from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Dict


async def get_user_composition(db: Session) -> Dict:
    """Total users split into real users, test/QA accounts, and bot accounts"""
    query = text("""
        SELECT
            COUNT(*) as total_users,
            SUM(CASE WHEN id LIKE 'bot_%' THEN 1 ELSE 0 END) as bot_accounts,
            SUM(CASE WHEN username ILIKE 'testuser%' OR username ILIKE 'newuser%' OR username ILIKE 'uniqueuser%' THEN 1 ELSE 0 END) as test_accounts
        FROM "10s_schema".users
    """)
    result = db.execute(query).fetchone()
    total = result[0] or 0
    bots = result[1] or 0
    test = result[2] or 0
    real = total - test - bots
    return {
        "total_users": total,
        "real_users": real,
        "test_accounts": test,
        "bot_accounts": bots,
    }


async def get_active_premium_counts(db: Session) -> Dict:
    """Active and premium users (excluding test accounts and bot accounts)"""
    query = text("""
        SELECT
            COUNT(*) as total_real,
            SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_count,
            SUM(CASE WHEN is_premium THEN 1 ELSE 0 END) as premium_count
        FROM "10s_schema".users
        WHERE username NOT ILIKE 'testuser%'
          AND username NOT ILIKE 'newuser%'
          AND username NOT ILIKE 'uniqueuser%'
          AND id NOT LIKE 'bot_%'
    """)
    result = db.execute(query).fetchone()
    total_real = result[0] or 0
    active = result[1] or 0
    premium = result[2] or 0
    return {
        "total_real_users": total_real,
        "active_users": active,
        "premium_users": premium,
    }


async def get_played_vs_dormant(db: Session) -> Dict:
    """Real users split into those who've played at least once vs never played"""
    query = text("""
        SELECT
            COUNT(*) as total_real,
            SUM(CASE WHEN total_games > 0 THEN 1 ELSE 0 END) as users_played,
            SUM(CASE WHEN total_games = 0 THEN 1 ELSE 0 END) as users_dormant
        FROM "10s_schema".users
        WHERE username NOT ILIKE 'testuser%'
          AND username NOT ILIKE 'newuser%'
          AND username NOT ILIKE 'uniqueuser%'
          AND id NOT LIKE 'bot_%'
    """)
    result = db.execute(query).fetchone()
    total = result[0] or 0
    played = result[1] or 0
    dormant = result[2] or 0
    activation_rate = (played / total * 100) if total > 0 else 0
    return {
        "total_real_users": total,
        "users_played": played,
        "users_dormant": dormant,
        "activation_rate_percent": round(activation_rate, 2),
    }
