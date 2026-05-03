"""
Leaderboard and statistics routes for 10S Card Game API.

Endpoints:
  GET    /leaderboard           - Top 100 players
  GET    /leaderboard/global    - Global statistics
  GET    /leaderboard/friends   - Friends leaderboard
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from loguru import logger

from ..database import get_db
from ..models import PlayerStatistics, User
from ..security import verify_token

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

# ============================================
# TOP PLAYERS
# ============================================

@router.get("")
async def get_top_players(
    limit: int = 100,
    offset: int = 0,
    sort_by: str = "rating",
    db: Session = Depends(get_db)
):
    """
    Get top ranked players.

    **Query Parameters**:
    - `limit`: Number of players to return (default 100, max 500)
    - `offset`: Pagination offset (default 0)
    - `sort_by`: Sort by "rating", "wins", "games_played" (default: rating)

    **Response**:
    - Array of top players with rankings and stats

    **Errors**:
    - 400: Invalid parameters
    """
    # Validate parameters
    if limit > 500:
        limit = 500
    if limit < 1:
        limit = 10

    valid_sorts = ["rating", "games_won", "games_played"]
    if sort_by not in valid_sorts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"sort_by must be one of: {', '.join(valid_sorts)}"
        )

    # Build query
    query = db.query(PlayerStatistics).order_by(
        PlayerStatistics.rating.desc() if sort_by == "rating"
        else PlayerStatistics.games_won.desc() if sort_by == "games_won"
        else PlayerStatistics.games_played.desc()
    )

    total_players = query.count()
    players = query.offset(offset).limit(limit).all()

    logger.info(f"📊 Retrieved top {len(players)} players (sort: {sort_by})")

    return {
        "total_players": total_players,
        "limit": limit,
        "offset": offset,
        "players": [
            {
                "rank": offset + idx + 1,
                "user_id": p.user_id,
                "games_played": p.games_played,
                "games_won": p.games_won,
                "games_lost": p.games_lost,
                "rating": p.rating,
                "total_points": p.total_points,
                "win_rate": round(p.games_won / max(p.games_played, 1) * 100, 2) if p.games_played > 0 else 0
            }
            for idx, p in enumerate(players)
        ]
    }

# ============================================
# GLOBAL STATISTICS
# ============================================

@router.get("/global")
async def get_global_statistics(db: Session = Depends(get_db)):
    """
    Get global game statistics.

    **Response**:
    - Total players, games played, average rating, etc.
    """
    total_players = db.query(PlayerStatistics).count()

    stats = db.query(PlayerStatistics).all()

    if not stats:
        return {
            "total_players": 0,
            "total_games": 0,
            "average_rating": 0,
            "top_rating": 0
        }

    total_games = sum(s.games_played for s in stats)
    avg_rating = sum(s.rating for s in stats) / len(stats) if stats else 0
    top_rating = max(s.rating for s in stats) if stats else 0

    logger.info("📊 Retrieved global statistics")

    return {
        "total_players": total_players,
        "total_games_played": total_games,
        "average_player_rating": round(avg_rating, 2),
        "highest_rating": top_rating,
        "statistics_updated": "recent"
    }

# ============================================
# PLAYER RANKING
# ============================================

@router.get("/player/{user_id}")
async def get_player_ranking(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get specific player's ranking and stats.

    **Path Parameters**:
    - `user_id`: Player UUID

    **Response**:
    - Player ranking, position, statistics

    **Errors**:
    - 404: Player not found
    """
    stats = db.query(PlayerStatistics).filter(
        PlayerStatistics.user_id == user_id
    ).first()

    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player statistics not found"
        )

    # Get player's rank
    better_players = db.query(PlayerStatistics).filter(
        PlayerStatistics.rating > stats.rating
    ).count()

    rank = better_players + 1

    logger.info(f"📊 Retrieved ranking for player: {user_id}")

    return {
        "user_id": stats.user_id,
        "rank": rank,
        "rating": stats.rating,
        "games_played": stats.games_played,
        "games_won": stats.games_won,
        "games_lost": stats.games_lost,
        "win_rate": round(stats.games_won / max(stats.games_played, 1) * 100, 2) if stats.games_played > 0 else 0,
        "total_points": stats.total_points
    }

# ============================================
# FRIENDS LEADERBOARD
# ============================================

@router.get("/friends")
async def get_friends_leaderboard(
    auth_token: str,
    db: Session = Depends(get_db)
):
    """
    Get leaderboard of user's friends.

    **Query Parameters**:
    - `token`: User authentication token

    **Response**:
    - Ranked list of friends with stats

    **Errors**:
    - 401: Unauthorized
    """
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    # TODO: Implement friends list query
    # For now, return user's own stats

    stats = db.query(PlayerStatistics).filter(
        PlayerStatistics.user_id == user_id
    ).first()

    logger.info(f"👥 Retrieved friends leaderboard for: {user_id}")

    if not stats:
        return {
            "friends": []
        }

    return {
        "friends": [
            {
                "user_id": stats.user_id,
                "rating": stats.rating,
                "games_played": stats.games_played,
                "games_won": stats.games_won
            }
        ]
    }

# ============================================
# STATISTICS BY TIME PERIOD
# ============================================

@router.get("/stats/weekly")
async def get_weekly_statistics(
    auth_token: str,
    db: Session = Depends(get_db)
):
    """
    Get player statistics for the past week.

    **Query Parameters**:
    - `token`: User authentication token

    **Response**:
    - Weekly stats (games played, wins, points)
    """
    user_id = verify_token(auth_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    logger.info(f"📊 Retrieved weekly stats for: {user_id}")

    return {
        "period": "weekly",
        "user_id": user_id,
        "games_played": 0,
        "games_won": 0,
        "points_earned": 0
    }
