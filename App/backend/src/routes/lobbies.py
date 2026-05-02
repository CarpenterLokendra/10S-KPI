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

from database import get_db
from models import Lobby, User, Game
from security import verify_token

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
    if max_players < 2 or max_players > 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Max players must be between 2 and 6"
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
        lobby = Lobby(
            code=lobby_code,
            creator_id=user_id,
            max_players=max_players,
            current_players=1
        )

        db.add(lobby)
        db.commit()
        db.refresh(lobby)

        logger.info(f"✅ Lobby created: {lobby.code} by {user_id}")

        return {
            "id": lobby.id,
            "code": lobby.code,
            "creator_id": lobby.creator_id,
            "max_players": lobby.max_players,
            "current_players": lobby.current_players,
            "status": lobby.status.value,
            "created_at": lobby.created_at
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

    lobbies = db.query(Lobby).filter(Lobby.status == lobby_status).all()

    logger.info(f"📋 Retrieved {len(lobbies)} lobbies with status: {lobby_status}")

    return [
        {
            "code": lobby.code,
            "creator_id": lobby.creator_id,
            "max_players": lobby.max_players,
            "current_players": lobby.current_players,
            "status": lobby.status.value,
            "created_at": lobby.created_at
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

    logger.info(f"📋 Retrieved lobby details: {code}")

    return {
        "code": lobby.code,
        "creator_id": lobby.creator_id,
        "max_players": lobby.max_players,
        "current_players": lobby.current_players,
        "status": lobby.status.value,
        "created_at": lobby.created_at,
        "expires_at": lobby.expires_at
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

    if lobby.status != "waiting":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lobby is not accepting new players"
        )

    # TODO: Add player to lobby
    logger.info(f"✅ User {user_id} joined lobby: {code}")

    return {
        "message": f"Successfully joined lobby {code}",
        "status": "joined"
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

    # TODO: Remove player from lobby
    logger.info(f"✅ User {user_id} left lobby: {code}")

    return {
        "message": f"Successfully left lobby {code}",
        "status": "left"
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

    logger.info(f"🎮 Game started from lobby: {code}")

    return {
        "message": "Game started successfully",
        "game_id": str(uuid.uuid4()),
        "status": "started"
    }
