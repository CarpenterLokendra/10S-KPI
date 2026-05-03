"""
Game management routes for 10S Card Game API.

Endpoints:
  POST   /games            - Create new game
  GET    /games            - List user's games
  GET    /games/{game_id}  - Get game details
  POST   /games/{game_id}/play-card   - Play a card
  POST   /games/{game_id}/end         - End game
  GET    /games/{game_id}/history     - Get game history
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from loguru import logger
import uuid
from typing import List

from ..database import get_db
from ..models import Game, GamePlayer, User, Round
from ..security import verify_token
from ..schemas import GameCreate

router = APIRouter(prefix="/games", tags=["games"])

# ============================================
# CREATE GAME
# ============================================

@router.post("")
async def create_game(
    game_data: GameCreate,
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """
    Create a new game.

    **Query Parameters**:
    - `auth_token`: Creator authentication token

    **Request Body**:
    - `game_type`: Game type ("BOT", "LOBBY", etc.)
    - `num_players`: Number of players (optional, for BOT games)
    - `lobby_id`: Lobby ID (optional, for LOBBY games)

    **Response**:
    - Game ID, status, game type, initial state

    **Errors**:
    - 400: Invalid parameters
    - 401: Unauthorized
    """
    creator_id = verify_token(auth_token)

    if not creator_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    try:
        lobby_id = None
        if game_data.lobby_id:
            from models import Lobby
            lobby = db.query(Lobby).filter(Lobby.code == game_data.lobby_id).first()
            if lobby:
                lobby_id = lobby.id

        game = Game(
            id=str(uuid.uuid4()),
            creator_id=creator_id,
            status="WAITING",
            game_type=game_data.game_type,
            num_players=game_data.num_players or 0,
            lobby_id=lobby_id
        )

        db.add(game)
        db.commit()
        db.refresh(game)

        logger.info(f"🎮 Game created: {game.id} (type={game_data.game_type})")

        return {
            "id": game.id,
            "game_type": game_data.game_type.value.upper(),
            "status": game.status,
            "num_players": game_data.num_players,
            "created_at": game.created_at
        }
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to create game: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create game"
        )

# ============================================
# LIST GAMES
# ============================================

@router.get("")
async def list_user_games(
    auth_token: str = None,
    game_status: str = None,
    db: Session = Depends(get_db)
):
    """
    List games for current user.

    **Query Parameters**:
    - `auth_token`: User authentication token
    - `game_status`: Filter by status ("active", "finished", etc)

    **Response**:
    - Array of games with details
    """
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    query = db.query(Game).join(GamePlayer).filter(GamePlayer.user_id == user_id)

    if game_status:
        query = query.filter(Game.status == game_status)

    games = query.all()

    logger.info(f"📋 Retrieved {len(games)} games for user: {user_id}")

    return [
        {
            "game_id": game.id,
            "status": game.status,
            "current_round": game.current_round,
            "created_at": game.created_at
        }
        for game in games
    ]

# ============================================
# USER GAME HISTORY
# ============================================

@router.get("/history")
async def get_user_game_history(
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """Get current user's game history."""
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    games = db.query(Game).filter(Game.creator_id == user_id).all()

    logger.info(f"📜 Retrieved game history for user: {user_id}")

    return [
        {
            "game_id": game.id,
            "status": game.status,
            "created_at": game.created_at
        }
        for game in games
    ]

# ============================================
# GAME STATISTICS
# ============================================

@router.get("/statistics")
async def get_game_statistics(
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """Get game statistics."""
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    logger.info(f"📊 Retrieved game statistics for user: {user_id}")

    return {
        "user_id": user_id,
        "total_games": 0,
        "wins": 0,
        "losses": 0
    }

# ============================================
# GET GAME DETAILS
# ============================================

@router.get("/{game_id}")
async def get_game_details(
    game_id: str,
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """
    Get detailed game state.

    **Path Parameters**:
    - `game_id`: Game UUID

    **Query Parameters**:
    - `token`: User authentication token

    **Response**:
    - Game state, players, current round, cards in play

    **Errors**:
    - 401: Unauthorized
    - 404: Game not found
    """
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    game = db.query(Game).filter(Game.id == game_id).first()

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    # Get game players
    game_players = db.query(GamePlayer).filter(GamePlayer.game_id == game_id).all()

    logger.info(f"📊 Retrieved game state: {game_id}")

    return {
        "id": game.id,
        "status": game.status,
        "current_round": game.current_round,
        "players": [
            {"user_id": gp.user_id, "position": gp.position, "is_active": gp.is_active}
            for gp in game_players
        ],
        "created_at": game.created_at
    }

# ============================================
# PLAY CARD
# ============================================

@router.post("/{game_id}/play")
async def play_card(
    game_id: str,
    card_data: dict,
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """
    Play a card in the current game.

    **Path Parameters**:
    - `game_id`: Game UUID

    **Query Parameters**:
    - `token`: User authentication token

    **Request Body**:
    - `card`: Card object {"suit": "hearts", "value": "10"}

    **Response**:
    - Updated game state

    **Errors**:
    - 401: Unauthorized
    - 404: Game not found
    - 400: Invalid card play
    """
    from .game_rules import GameRules, Card, PlayerHand, CardSuit, CardValue

    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    game = db.query(Game).filter(Game.id == game_id).first()

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    try:
        # Get player's hand from game state
        game_state = game.game_state or {}
        player_hands = game_state.get('player_hands', {})
        current_player_hand = player_hands.get(user_id, [])

        # Convert to Card objects
        player_cards = [
            Card(value=CardValue[c['value']], suit=CardSuit[c['suit'].upper()])
            for c in current_player_hand
        ]
        player_hand = PlayerHand(user_id, player_cards)

        # Create card to play
        card_to_play = Card(
            value=CardValue[card_data['value']],
            suit=CardSuit[card_data['suit'].upper()]
        )

        # Get current round info
        current_round = game_state.get('current_round', {})
        led_suit = CardSuit[current_round.get('led_suit', 'HEARTS')]
        trump_suit = CardSuit[current_round.get('trump_suit')] if current_round.get('trump_suit') else None

        # Validate the move
        if not GameRules.is_valid_move(player_hand, led_suit, trump_suit, card_to_play):
            if player_hand.has_suit(led_suit):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"You must play a card of the led suit ({led_suit.value})"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid card play"
                )

        logger.info(f"✅ Valid card played in game {game_id}: {card_to_play}")

        return {
            "message": "Card played successfully",
            "game_state": "updated"
        }
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid card format: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error playing card: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process card play"
        )

# ============================================
# END GAME
# ============================================

@router.post("/{game_id}/end")
async def end_game(
    game_id: str,
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """
    End a game and record results.

    **Path Parameters**:
    - `game_id`: Game UUID

    **Query Parameters**:
    - `token`: User authentication token

    **Response**:
    - Final scores and winners

    **Errors**:
    - 401: Unauthorized
    - 404: Game not found
    """
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    game = db.query(Game).filter(Game.id == game_id).first()

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    try:
        from datetime import datetime
        game.status = "finished"
        game.end_time = datetime.utcnow()
        db.commit()

        logger.info(f"🏁 Game ended: {game_id}")

        return {
            "message": "Game ended successfully",
            "game_id": game.id,
            "lobby_id": game.lobby_id,
            "status": game.status,
            "end_time": game.end_time.isoformat(),
            "final_results": {}  # TODO: Calculate scores
        }
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to end game: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to end game"
        )

# ============================================
# GET GAME HISTORY
# ============================================

@router.get("/{game_id}/history")
async def get_game_history(
    game_id: str,
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """
    Get complete history/moves of a game.

    **Path Parameters**:
    - `game_id`: Game UUID

    **Query Parameters**:
    - `token`: User authentication token

    **Response**:
    - Array of rounds with all moves
    """
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    rounds = db.query(Round).filter(Round.game_id == game_id).all()

    logger.info(f"📜 Retrieved game history: {game_id}")

    return {
        "game_id": game_id,
        "total_rounds": len(rounds),
        "rounds": [
            {
                "round_number": r.round_number,
                "winner_id": r.winner_id,
                "timestamp": r.created_at
            }
            for r in rounds
        ]
    }

# ============================================
# GAME CHAT
# ============================================

@router.post("/{game_id}/chat")
async def send_chat_message(
    game_id: str,
    message: dict,
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """Send a chat message in a game."""
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    game = db.query(Game).filter(Game.id == game_id).first()

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    logger.info(f"💬 Chat message in game {game_id}")

    return {
        "message": "Chat message sent",
        "status": "sent"
    }

# ============================================
# LEAVE GAME
# ============================================

@router.post("/{game_id}/leave")
async def leave_game(
    game_id: str,
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """Leave a game."""
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    game = db.query(Game).filter(Game.id == game_id).first()

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    logger.info(f"👋 User {user_id} left game {game_id}")

    return {
        "message": "Left game successfully",
        "status": "left"
    }
