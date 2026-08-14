from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Dict


async def get_dau(db: Session, days: int = 30) -> List[Dict]:
    """Daily Active Users"""
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            DATE(gp.joined_at) as date,
            COUNT(DISTINCT gp.user_id) as active_users
        FROM "10s_schema".game_players gp
        WHERE gp.joined_at >= :start_date
        GROUP BY DATE(gp.joined_at)
        ORDER BY date ASC
    """)
    result = db.execute(query, {"start_date": start_date})
    return [{"date": row[0].isoformat(), "count": row[1]} for row in result]


async def get_wau(db: Session, weeks: int = 12) -> List[Dict]:
    """Weekly Active Users"""
    start_date = datetime.utcnow() - timedelta(weeks=weeks)
    query = text("""
        SELECT
            DATE_TRUNC('week', gp.joined_at)::DATE as week,
            COUNT(DISTINCT gp.user_id) as active_users
        FROM "10s_schema".game_players gp
        WHERE gp.joined_at >= :start_date
        GROUP BY DATE_TRUNC('week', gp.joined_at)
        ORDER BY week ASC
    """)
    result = db.execute(query, {"start_date": start_date})
    return [{"week": row[0].isoformat(), "count": row[1]} for row in result]


async def get_mau(db: Session, months: int = 12) -> List[Dict]:
    """Monthly Active Users"""
    start_date = datetime.utcnow() - timedelta(days=30 * months)
    query = text("""
        SELECT
            DATE_TRUNC('month', gp.joined_at)::DATE as month,
            COUNT(DISTINCT gp.user_id) as active_users
        FROM "10s_schema".game_players gp
        WHERE gp.joined_at >= :start_date
        GROUP BY DATE_TRUNC('month', gp.joined_at)
        ORDER BY month ASC
    """)
    result = db.execute(query, {"start_date": start_date})
    return [{"month": row[0].isoformat(), "count": row[1]} for row in result]


async def get_games_played_daily(db: Session, days: int = 30) -> List[Dict]:
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            DATE(g.start_time) as date,
            g.game_type,
            COUNT(*) as game_count
        FROM "10s_schema".games g
        WHERE g.start_time >= :start_date
        GROUP BY DATE(g.start_time), g.game_type
        ORDER BY date ASC
    """)
    result = db.execute(query, {"start_date": start_date})
    data = {}
    for row in result:
        date_str = row[0].isoformat()
        game_type = row[1] or "unknown"
        count = row[2]
        if date_str not in data:
            data[date_str] = {"date": date_str, "bot": 0, "lobby": 0}
        data[date_str][game_type.lower()] = count
    return list(data.values())


async def get_avg_game_duration(db: Session, days: int = 30) -> Dict:
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            AVG(EXTRACT(EPOCH FROM (g.end_time - g.start_time))) as avg_seconds,
            AVG(g.num_players) as avg_players
        FROM "10s_schema".games g
        WHERE g.start_time >= :start_date AND g.end_time IS NOT NULL
    """)
    result = db.execute(query, {"start_date": start_date}).fetchone()
    avg_seconds = result[0] or 0
    avg_players = result[1] or 0
    return {
        "avg_duration_seconds": round(avg_seconds, 2),
        "avg_duration_minutes": round(avg_seconds / 60, 2),
        "avg_players_per_game": round(avg_players, 2),
    }


async def get_lobby_conversion_rate(db: Session, days: int = 30) -> Dict:
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            COUNT(DISTINCT l.id) as lobbies_created,
            COUNT(DISTINCT g.lobby_id) as lobbies_converted
        FROM "10s_schema".lobbies l
        LEFT JOIN "10s_schema".games g ON l.id = g.lobby_id
        WHERE l.created_at >= :start_date
    """)
    result = db.execute(query, {"start_date": start_date}).fetchone()
    lobbies_created = result[0] or 0
    lobbies_converted = result[1] or 0
    conversion_rate = (lobbies_converted / lobbies_created * 100) if lobbies_created > 0 else 0
    return {
        "lobbies_created": lobbies_created,
        "lobbies_converted": lobbies_converted,
        "conversion_rate_percent": round(conversion_rate, 2),
    }


async def get_bot_vs_human_mix(db: Session, days: int = 30) -> Dict:
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            SUM(CASE WHEN gp.is_bot THEN 1 ELSE 0 END) as bot_players,
            SUM(CASE WHEN NOT gp.is_bot THEN 1 ELSE 0 END) as human_players
        FROM "10s_schema".game_players gp
        WHERE gp.joined_at >= :start_date
    """)
    result = db.execute(query, {"start_date": start_date}).fetchone()
    bot_players = result[0] or 0
    human_players = result[1] or 0
    total = bot_players + human_players
    return {
        "bot_players": bot_players,
        "human_players": human_players,
        "bot_percent": round((bot_players / total * 100) if total > 0 else 0, 2),
        "human_percent": round((human_players / total * 100) if total > 0 else 0, 2),
    }
