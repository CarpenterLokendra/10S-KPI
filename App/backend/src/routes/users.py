"""
User management routes for 10S Card Game API.

Endpoints:
  GET    /users/me           - Get current authenticated user
  GET    /users/{user_id}    - Get user profile by ID
  PUT    /users/{user_id}    - Update user profile
  GET    /users/{user_id}/stats - Get user statistics
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from loguru import logger

from ..database import get_db
from ..security import verify_token
from ..models import User, PlayerStatistics

router = APIRouter(prefix="/users", tags=["users"])

# ============================================
# DEPENDENCIES
# ============================================

async def get_current_user(auth_token: str = None, db: Session = Depends(get_db)) -> User:
    """Dependency: Get currently authenticated user from JWT token."""
    if not auth_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user

# ============================================
# GET CURRENT USER
# ============================================

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user's profile.

    **Query Parameters**:
    - `auth_token`: User authentication token

    **Response**:
    - User profile with all fields
    """
    logger.info(f"📋 Retrieved profile for user: {current_user.username}")

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "avatar_url": current_user.avatar_url,
        "is_active": current_user.is_active,
        "is_premium": current_user.is_premium,
        "total_games": current_user.total_games,
        "total_wins": current_user.total_wins,
        "rating": current_user.rating,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }

# ============================================
# GET USER BY ID
# ============================================

@router.get("/{user_id}")
async def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    """
    Get public user profile by ID.

    **Path Parameters**:
    - `user_id`: UUID of the user

    **Response**:
    - User profile (public info only)

    **Errors**:
    - 404: User not found
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    logger.info(f"📋 Retrieved profile for user: {user.username}")

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_active": user.is_active,
        "created_at": user.created_at
    }

# ============================================
# UPDATE USER PROFILE
# ============================================

@router.put("")
async def update_current_user(
    update_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile.

    **Query Parameters**:
    - `auth_token`: User authentication token

    **Request Body**:
    - `username`: (optional) New username
    - `avatar_url`: (optional) New avatar URL

    **Response**:
    - Updated user profile
    """
    user = current_user

    if "username" in update_data:
        existing = db.query(User).filter(
            (User.username == update_data["username"]) & (User.id != user.id)
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        user.username = update_data["username"]

    if "avatar_url" in update_data:
        user.avatar_url = update_data["avatar_url"]

    try:
        db.commit()
        db.refresh(user)
        logger.info(f"✅ Updated profile for user: {user.username}")

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "updated_at": user.updated_at
        }
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to update user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@router.put("/{user_id}")
async def update_user_profile(
    user_id: str,
    update_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile (username, etc).

    **Path Parameters**:
    - `user_id`: UUID of user to update

    **Request Body**:
    - `username`: (optional) New username

    **Errors**:
    - 403: Cannot update other users' profiles
    - 404: User not found
    """
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other users' profiles"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update allowed fields
    if "username" in update_data:
        # Check if new username is available
        existing = db.query(User).filter(
            (User.username == update_data["username"]) & (User.id != user_id)
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        user.username = update_data["username"]

    try:
        db.commit()
        db.refresh(user)
        logger.info(f"✅ Updated profile for user: {user.username}")

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "updated_at": user.updated_at
        }
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to update user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

# ============================================
# GET USER STATISTICS
# ============================================

@router.get("/{user_id}/statistics")
async def get_user_statistics(user_id: str, db: Session = Depends(get_db)):
    """
    Get player statistics for a user.

    **Path Parameters**:
    - `user_id`: UUID of the user

    **Response**:
    - Games played, wins, losses, rating, ranking

    **Errors**:
    - 404: User or statistics not found
    """
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    stats = db.query(PlayerStatistics).filter(
        PlayerStatistics.user_id == user_id
    ).first()

    if not stats:
        logger.info(f"📊 Retrieved stats for user: {user_id} (default)")
        return {
            "user_id": user_id,
            "total_games_played": 0,
            "total_games_won": 0,
            "total_games_lost": 0,
            "rating": 1000.0,
            "rank": 0,
            "total_points_scored": 0,
            "win_rate": 0.0
        }

    logger.info(f"📊 Retrieved stats for user: {user_id}")

    return {
        "user_id": stats.user_id,
        "total_games_played": stats.total_games_played,
        "total_games_won": stats.total_games_won,
        "total_games_lost": stats.total_games_lost,
        "rating": stats.rating,
        "rank": stats.rank,
        "total_points_scored": stats.total_points_scored,
        "win_rate": round(stats.total_games_won / max(stats.total_games_played, 1) * 100, 2) if stats.total_games_played > 0 else 0
    }
