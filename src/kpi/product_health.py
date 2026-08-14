from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Dict


async def get_game_completion_rate(db: Session, days: int = 30) -> Dict:
    """% of games completed vs abandoned/timeout"""
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            COUNT(*) as total_games,
            SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'ABANDONED' THEN 1 ELSE 0 END) as abandoned,
            SUM(CASE WHEN ended_via_timeout THEN 1 ELSE 0 END) as timed_out
        FROM "10s_schema".games
        WHERE start_time >= :start_date
    """)
    result = db.execute(query, {"start_date": start_date}).fetchone()
    total = result[0] or 0
    completed = result[1] or 0
    abandoned = result[2] or 0
    timed_out = result[3] or 0
    completion_rate = (completed / total * 100) if total > 0 else 0
    return {
        "total_games": total,
        "completed": completed,
        "abandoned": abandoned,
        "timed_out": timed_out,
        "completion_rate_percent": round(completion_rate, 2),
    }


async def get_disconnect_rate(db: Session, days: int = 30) -> Dict:
    """% of players who disconnected during games"""
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            COUNT(*) as total_player_sessions,
            COUNT(CASE WHEN disconnected_at IS NOT NULL THEN 1 END) as disconnected_players
        FROM "10s_schema".game_players gp
        WHERE gp.joined_at >= :start_date
    """)
    result = db.execute(query, {"start_date": start_date}).fetchone()
    total = result[0] or 0
    disconnected = result[1] or 0
    disconnect_rate = (disconnected / total * 100) if total > 0 else 0
    return {
        "total_player_sessions": total,
        "disconnected_players": disconnected,
        "disconnect_rate_percent": round(disconnect_rate, 2),
    }


async def get_avg_players_per_game(db: Session, days: int = 30) -> Dict:
    """Average number of players per game"""
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            AVG(num_players) as avg_players,
            MIN(num_players) as min_players,
            MAX(num_players) as max_players,
            COUNT(*) as game_count
        FROM "10s_schema".games
        WHERE start_time >= :start_date
    """)
    result = db.execute(query, {"start_date": start_date}).fetchone()
    avg = result[0] or 0
    min_players = result[1] or 0
    max_players = result[2] or 0
    game_count = result[3] or 0
    return {
        "avg_players": round(avg, 2),
        "min_players": min_players,
        "max_players": max_players,
        "game_count": game_count,
    }


async def get_health_score(db: Session, days: int = 30) -> Dict:
    """Composite health score (0-100) based on key metrics"""
    start_date = datetime.utcnow() - timedelta(days=days)

    # Fetch all metrics
    completion_query = text("""
        SELECT
            COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END)::float / COUNT(*), 0) as completion_rate
        FROM "10s_schema".games
        WHERE start_time >= :start_date
    """)
    completion_result = db.execute(completion_query, {"start_date": start_date}).fetchone()
    completion_rate = completion_result[0] if completion_result[0] is not None else 0

    disconnect_query = text("""
        SELECT
            COALESCE(COUNT(CASE WHEN disconnected_at IS NOT NULL THEN 1 END)::float / COUNT(*), 0) as disconnect_rate
        FROM "10s_schema".game_players gp
        WHERE gp.joined_at >= :start_date
    """)
    disconnect_result = db.execute(disconnect_query, {"start_date": start_date}).fetchone()
    disconnect_rate = disconnect_result[0] if disconnect_result[0] is not None else 0

    # Simple composite: 50% completion + 50% connectivity (inverse of disconnect rate)
    health_score = (completion_rate * 50) + ((1 - disconnect_rate) * 50)

    return {
        "health_score": round(health_score, 2),
        "max_score": 100,
        "completion_rate_component": round(completion_rate * 50, 2),
        "connectivity_component": round((1 - disconnect_rate) * 50, 2),
        "days": days,
    }


async def get_daily_health_trend(db: Session, days: int = 30) -> List[Dict]:
    """Health score trend over time"""
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            DATE(g.start_time) as date,
            COALESCE(SUM(CASE WHEN g.status = 'COMPLETED' THEN 1 ELSE 0 END)::float / COUNT(g.*), 0) as completion_rate,
            COALESCE(COUNT(CASE WHEN gp.disconnected_at IS NOT NULL THEN 1 END)::float / COUNT(gp.id), 0) as disconnect_rate
        FROM "10s_schema".games g
        LEFT JOIN "10s_schema".game_players gp ON g.id = gp.game_id
        WHERE g.start_time >= :start_date
        GROUP BY DATE(g.start_time)
        ORDER BY date ASC
    """)
    result = db.execute(query, {"start_date": start_date})
    data = []
    for row in result:
        completion = row[1] if row[1] is not None else 0
        disconnect = row[2] if row[2] is not None else 0
        health_score = (completion * 50) + ((1 - disconnect) * 50)
        data.append({
            "date": row[0].isoformat(),
            "health_score": round(health_score, 2),
            "completion_rate": round(completion, 3),
            "disconnect_rate": round(disconnect, 3),
        })
    return data
