"""
Lobby management routes for 10S Card Game API.

Endpoints:
  POST   /lobbies           - Create new lobby
  GET    /lobbies           - List available lobbies
  GET    /lobbies/{code}    - Get lobby details
  POST   /lobbies/{code}/join    - Join a lobby
  POST   /lobbies/{code}/leave   - Leave a lobby
  POST   /lobbies/{code}/start   - Start game from lobby
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from loguru import logger
import uuid
from collections import defaultdict

from ..database import get_db
from ..models import Lobby, LobbyPlayer, User, Game, GamePlayer
from ..security import verify_token
from datetime import datetime, timedelta

# In-memory storage for lobby chat messages
lobby_messages = defaultdict(list)

router = APIRouter(prefix="/lobbies", tags=["lobbies"])

# ============================================
# CREATE LOBBY
# ============================================

@router.post("")
async def create_lobby(
    max_players: int = 4,
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """
    Create a new game lobby.

    **Query Parameters**:
    - `max_players`: Maximum players (2-6, default 4)
    - `auth_token`: User authentication token (JWT)

    **Response**:
    - Lobby code, creator, status (automatically set to "waiting")

    **Errors**:
    - 400: Invalid player count
    - 401: Unauthorized

    **Note**: Lobby status is automatically set to "waiting" when created.
    """
    # Validate max players
    if max_players < 3 or max_players > 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Max players must be between 3 and 6"
        )

    # Get current user
    user_id = verify_token(auth_token) if auth_token else None
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    try:
        lobby_code = str(uuid.uuid4())[:6].upper()
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        lobby = Lobby(
            code=lobby_code,
            creator_id=user_id,
            max_players=max_players,
            current_players=1,
            expires_at=expires_at
        )

        db.add(lobby)
        db.commit()
        db.refresh(lobby)

        # Ensure expires_at is set
        if not lobby.expires_at:
            lobby.expires_at = expires_at
            db.commit()
            db.refresh(lobby)

        # Add creator to lobby players
        lobby_player = LobbyPlayer(
            lobby_id=lobby.id,
            user_id=user_id
        )
        db.add(lobby_player)
        db.commit()

        logger.info(f"✅ Lobby created: {lobby.code} by {user_id}")

        return {
            "id": lobby.id,
            "code": lobby.code,
            "creator_id": lobby.creator_id,
            "max_players": lobby.max_players,
            "current_players": lobby.current_players,
            "status": lobby.status.value,
            "created_at": lobby.created_at,
            "expires_at": lobby.expires_at.isoformat() if lobby.expires_at else None
        }
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to create lobby: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create lobby"
        )

# ============================================
# LIST LOBBIES
# ============================================

@router.get("")
async def list_lobbies(
    lobby_status: str = "waiting",
    db: Session = Depends(get_db)
):
    """
    List available lobbies filtered by status.

    **Query Parameters**:
    - `lobby_status`: Filter by lobby status ("waiting", "in_progress", "closed", default: "waiting")

    **Response**:
    - Array of lobbies with details

    **Errors**:
    - 400: Invalid status

    **Note**: Filter lobbies by status. Lobby status is automatically managed by the system.
    """
    valid_statuses = ["waiting", "in_progress", "closed"]

    if lobby_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )

    # Auto-close expired lobbies
    expired_lobbies = db.query(Lobby).filter(
        Lobby.status == "waiting",
        Lobby.expires_at < datetime.utcnow()
    ).all()
    for lobby in expired_lobbies:
        lobby.status = "closed"
    if expired_lobbies:
        db.commit()

    # Filter by status and exclude private lobbies from public listing
    lobbies = db.query(Lobby).filter(
        Lobby.status == lobby_status,
        Lobby.is_private == False
    ).all()

    logger.info(f"📋 Retrieved {len(lobbies)} lobbies with status: {lobby_status}")

    return [
        {
            "code": lobby.code,
            "creator_id": lobby.creator_id,
            "max_players": lobby.max_players,
            "current_players": lobby.current_players,
            "status": lobby.status.value,
            "created_at": lobby.created_at,
            "is_private": lobby.is_private
        }
        for lobby in lobbies
    ]

# ============================================
# GET LOBBY DETAILS
# ============================================

@router.get("/{code}")
async def get_lobby_details(code: str, db: Session = Depends(get_db)):
    """
    Get detailed information about a lobby.

    **Path Parameters**:
    - `code`: Lobby code

    **Response**:
    - Lobby details including players, settings, status

    **Errors**:
    - 404: Lobby not found
    """
    lobby = db.query(Lobby).filter(Lobby.code == code).first()

    if not lobby:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lobby not found"
        )

    # Auto-close expired lobbies
    if lobby.status == "waiting" and lobby.expires_at and datetime.utcnow() > lobby.expires_at:
        lobby.status = "closed"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lobby expired after 10 minutes of inactivity"
        )

    # Get players in lobby
    lobby_players = db.query(LobbyPlayer).filter(LobbyPlayer.lobby_id == lobby.id).all()
    players = [
        {
            "user_id": lp.user_id,
            "username": db.query(User).filter(User.id == lp.user_id).first().username,
            "joined_at": lp.joined_at.isoformat()
        }
        for lp in lobby_players if lp.status.value == "active"
    ]

    # Get game_id if game has started
    game = db.query(Game).filter(Game.lobby_id == lobby.id).first()
    game_id = game.id if game else None

    logger.info(f"📋 Retrieved lobby details: {code}")

    return {
        "code": lobby.code,
        "creator_id": lobby.creator_id,
        "max_players": lobby.max_players,
        "current_players": lobby.current_players,
        "status": lobby.status.value,
        "created_at": lobby.created_at,
        "expires_at": lobby.expires_at.isoformat() if lobby.expires_at else None,
        "players": players,
        "game_id": game_id,
        "is_private": lobby.is_private,
        "can_join": lobby.current_players < lobby.max_players and lobby.status.value == "waiting",
        "can_start": lobby.current_players >= 2
    }

# ============================================
# JOIN LOBBY
# ============================================

@router.post("/{code}/join")
async def join_lobby(
    code: str,
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """
    Join an existing lobby.

    **Path Parameters**:
    - `code`: Lobby code

    **Query Parameters**:
    - `auth_token`: User authentication token (JWT)

    **Response**:
    - Updated lobby info

    **Errors**:
    - 401: Unauthorized
    - 404: Lobby not found
    - 400: Lobby full or not in waiting status
    """
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    lobby = db.query(Lobby).filter(Lobby.code == code).first()

    if not lobby:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lobby not found"
        )

    # Auto-close expired lobbies
    if lobby.expires_at and datetime.utcnow() > lobby.expires_at:
        lobby.status = "closed"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lobby expired after 10 minutes of inactivity"
        )

    if lobby.status != "waiting":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lobby is not accepting new players"
        )

    if lobby.current_players >= lobby.max_players:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lobby is full"
        )

    # Check if already in lobby
    existing = db.query(LobbyPlayer).filter(
        LobbyPlayer.lobby_id == lobby.id,
        LobbyPlayer.user_id == user_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already in this lobby"
        )

    # Add player to lobby
    lobby_player = LobbyPlayer(
        lobby_id=lobby.id,
        user_id=user_id
    )
    db.add(lobby_player)
    lobby.current_players += 1
    db.commit()
    db.refresh(lobby)

    logger.info(f"✅ User {user_id} joined lobby: {code}")

    return {
        "message": f"Successfully joined lobby {code}",
        "status": "joined",
        "current_players": lobby.current_players
    }

# ============================================
# LEAVE LOBBY
# ============================================

@router.post("/{code}/leave")
async def leave_lobby(
    code: str,
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """
    Leave a lobby.

    **Path Parameters**:
    - `code`: Lobby code

    **Query Parameters**:
    - `auth_token`: User authentication token (JWT)

    **Response**:
    - Confirmation message

    **Errors**:
    - 401: Unauthorized
    - 404: Lobby not found
    """
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    lobby = db.query(Lobby).filter(Lobby.code == code).first()

    if not lobby:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lobby not found"
        )

    # Remove player from lobby
    lobby_player = db.query(LobbyPlayer).filter(
        LobbyPlayer.lobby_id == lobby.id,
        LobbyPlayer.user_id == user_id
    ).first()

    if not lobby_player:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not in this lobby"
        )

    db.delete(lobby_player)
    lobby.current_players = max(0, lobby.current_players - 1)

    # If creator left, reassign to oldest remaining player
    if str(lobby.creator_id) == user_id:
        remaining = db.query(LobbyPlayer).filter(LobbyPlayer.lobby_id == lobby.id).order_by(LobbyPlayer.joined_at).first()
        if remaining:
            lobby.creator_id = remaining.user_id
        elif lobby.current_players == 0:
            # Close lobby if empty
            lobby.status = "closed"

    db.commit()
    logger.info(f"✅ User {user_id} left lobby: {code}")

    return {
        "message": f"Successfully left lobby {code}",
        "status": "left",
        "current_players": lobby.current_players
    }

# ============================================
# START GAME
# ============================================

@router.post("/{code}/start")
async def start_game_from_lobby(
    code: str,
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """
    Start a game from lobby (creator only).

    **Path Parameters**:
    - `code`: Lobby code

    **Query Parameters**:
    - `auth_token`: User authentication token (JWT, must be creator)

    **Response**:
    - Game ID and initial state

    **Errors**:
    - 401: Unauthorized
    - 403: Only creator can start
    - 404: Lobby not found
    - 400: Not enough players
    """
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    lobby = db.query(Lobby).filter(Lobby.code == code).first()

    if not lobby:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lobby not found"
        )

    if str(lobby.creator_id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lobby creator can start the game"
        )

    if lobby.current_players < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 3 players are required to start"
        )

    try:
        # Create game linked to this lobby
        game = Game(
            id=str(uuid.uuid4()),
            lobby_id=lobby.id,
            creator_id=user_id,
            num_players=lobby.current_players,
            game_type="LOBBY"
        )
        db.add(game)
        db.flush()  # Flush to get the game ID

        # Create GamePlayer records for all lobby members
        lobby_members = db.query(LobbyPlayer).filter(LobbyPlayer.lobby_id == lobby.id).all()
        logger.info(f"📋 Found {len(lobby_members)} lobby members")

        for i, member in enumerate(lobby_members):
            game_player = GamePlayer(
                id=str(uuid.uuid4()),
                game_id=game.id,
                user_id=member.user_id,
                player_position=i
            )
            db.add(game_player)
            logger.info(f"   ✅ Added GamePlayer: user_id={member.user_id}, position={i}")

        # Update lobby status
        lobby.status = "in_progress"

        db.commit()
        db.refresh(game)

        logger.info(f"🎮 Game {game.id} started from lobby: {code} with {len(lobby_members)} players")

        return {
            "message": "Game started successfully",
            "game_id": game.id,
            "lobby_id": lobby.id,
            "status": "started"
        }
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to start game from lobby {code}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start game: {str(e)}"
        )

# ============================================
# DELETE LOBBY
# ============================================

@router.delete("/{code}")
async def delete_lobby(
    code: str,
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """
    Delete a lobby (creator only).

    **Path Parameters**:
    - `code`: Lobby code

    **Query Parameters**:
    - `auth_token`: User authentication token (JWT, must be creator)

    **Response**:
    - Confirmation message

    **Errors**:
    - 401: Unauthorized
    - 403: Only creator can delete
    - 404: Lobby not found
    """
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    lobby = db.query(Lobby).filter(Lobby.code == code).first()

    if not lobby:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lobby not found"
        )

    if str(lobby.creator_id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lobby creator can delete the lobby"
        )

    # Delete all lobby players first
    db.query(LobbyPlayer).filter(LobbyPlayer.lobby_id == lobby.id).delete()

    # Delete the lobby
    db.delete(lobby)
    db.commit()

    logger.info(f"✅ Lobby {code} deleted by {user_id}")

    return {
        "message": "Lobby deleted successfully",
        "status": "deleted"
    }

# ============================================
# LOBBY CHAT
# ============================================

@router.post("/{code}/chat")
async def send_lobby_message(
    code: str,
    message: str,
    auth_token: str = None,
    db: Session = Depends(get_db)
):
    """
    Send a message in the lobby chat.

    **Path Parameters**:
    - `code`: Lobby code

    **Query Parameters**:
    - `message`: Message text
    - `auth_token`: User authentication token (JWT)

    **Response**:
    - Message details

    **Errors**:
    - 401: Unauthorized
    - 404: Lobby not found
    """
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    lobby = db.query(Lobby).filter(Lobby.code == code).first()

    if not lobby:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lobby not found"
        )

    # Get user info
    user = db.query(User).filter(User.id == user_id).first()
    username = user.username if user else f"Player {user_id[:8]}"

    # Create message object
    msg_data = {
        "id": str(uuid.uuid4()),
        "message": message,
        "user_id": user_id,
        "username": username,
        "timestamp": datetime.utcnow().isoformat(),
    }

    # Store message in lobby chat
    lobby_messages[code].append(msg_data)

    # Keep only last 100 messages per lobby
    if len(lobby_messages[code]) > 100:
        lobby_messages[code] = lobby_messages[code][-100:]

    logger.info(f"💬 Message in lobby {code} from {username}: {message[:50]}")

    return msg_data

@router.get("/{code}/chat")
async def get_lobby_messages(
    code: str,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get chat messages from a lobby.

    **Path Parameters**:
    - `code`: Lobby code

    **Query Parameters**:
    - `limit`: Maximum number of messages to return (default: 50)

    **Response**:
    - Array of chat messages

    **Errors**:
    - 404: Lobby not found
    """
    lobby = db.query(Lobby).filter(Lobby.code == code).first()

    if not lobby:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lobby not found"
        )

    # Get messages from in-memory storage
    messages = lobby_messages.get(code, [])

    # Return only the last `limit` messages
    messages = messages[-limit:] if limit else messages

    logger.info(f"📋 Retrieved {len(messages)} chat messages for lobby {code}")

    return {
        "messages": messages,
        "count": len(messages)
    }
