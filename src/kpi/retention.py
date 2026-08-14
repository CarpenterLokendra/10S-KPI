from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Dict


async def get_d1_retention(db: Session, days: int = 90) -> Dict:
    """Day 1 retention: % of users active within 1 day of signup"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        WITH cohorts AS (
            SELECT
                u.id,
                u.created_at::DATE as signup_date,
                MAX(gp.joined_at)::DATE as last_activity_date
            FROM "10s_schema".users u
            LEFT JOIN "10s_schema".game_players gp ON u.id = gp.user_id
            WHERE u.created_at >= :cutoff_date
            GROUP BY u.id, u.created_at
        )
        SELECT
            COUNT(*) as total_users,
            COUNT(CASE WHEN last_activity_date IS NOT NULL AND last_activity_date <= signup_date + INTERVAL '1 day' THEN 1 END) as retained_d1
        FROM cohorts
    """)
    result = db.execute(query, {"cutoff_date": cutoff_date}).fetchone()
    total = result[0] or 0
    retained = result[1] or 0
    retention_rate = (retained / total * 100) if total > 0 else 0
    return {
        "total_cohort": total,
        "retained_d1": retained,
        "retention_rate_percent": round(retention_rate, 2),
    }


async def get_d7_retention(db: Session, days: int = 90) -> Dict:
    """Day 7 retention: % of users active within 7 days of signup"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        WITH cohorts AS (
            SELECT
                u.id,
                u.created_at::DATE as signup_date,
                MAX(gp.joined_at)::DATE as last_activity_date
            FROM "10s_schema".users u
            LEFT JOIN "10s_schema".game_players gp ON u.id = gp.user_id
            WHERE u.created_at >= :cutoff_date
            GROUP BY u.id, u.created_at
        )
        SELECT
            COUNT(*) as total_users,
            COUNT(CASE WHEN last_activity_date IS NOT NULL AND last_activity_date <= signup_date + INTERVAL '7 days' THEN 1 END) as retained_d7
        FROM cohorts
    """)
    result = db.execute(query, {"cutoff_date": cutoff_date}).fetchone()
    total = result[0] or 0
    retained = result[1] or 0
    retention_rate = (retained / total * 100) if total > 0 else 0
    return {
        "total_cohort": total,
        "retained_d7": retained,
        "retention_rate_percent": round(retention_rate, 2),
    }


async def get_d30_retention(db: Session, days: int = 90) -> Dict:
    """Day 30 retention: % of users active within 30 days of signup"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        WITH cohorts AS (
            SELECT
                u.id,
                u.created_at::DATE as signup_date,
                MAX(gp.joined_at)::DATE as last_activity_date
            FROM "10s_schema".users u
            LEFT JOIN "10s_schema".game_players gp ON u.id = gp.user_id
            WHERE u.created_at >= :cutoff_date
            GROUP BY u.id, u.created_at
        )
        SELECT
            COUNT(*) as total_users,
            COUNT(CASE WHEN last_activity_date IS NOT NULL AND last_activity_date <= signup_date + INTERVAL '30 days' THEN 1 END) as retained_d30
        FROM cohorts
    """)
    result = db.execute(query, {"cutoff_date": cutoff_date}).fetchone()
    total = result[0] or 0
    retained = result[1] or 0
    retention_rate = (retained / total * 100) if total > 0 else 0
    return {
        "total_cohort": total,
        "retained_d30": retained,
        "retention_rate_percent": round(retention_rate, 2),
    }


async def get_churn_rate(db: Session, inactive_days: int = 7) -> Dict:
    """% of previously active users with no activity in the last N days"""
    cutoff_date = datetime.utcnow() - timedelta(days=inactive_days)
    query = text("""
        WITH user_activity AS (
            SELECT
                u.id,
                MAX(gp.joined_at) as last_activity
            FROM "10s_schema".users u
            LEFT JOIN "10s_schema".game_players gp ON u.id = gp.user_id
            GROUP BY u.id
        )
        SELECT
            COUNT(*) as total_active_users,
            COUNT(CASE WHEN last_activity IS NULL OR last_activity < :cutoff_date THEN 1 END) as churned_users
        FROM user_activity
        WHERE last_activity IS NOT NULL
    """)
    result = db.execute(query, {"cutoff_date": cutoff_date}).fetchone()
    total = result[0] or 0
    churned = result[1] or 0
    churn_rate = (churned / total * 100) if total > 0 else 0
    return {
        "active_users": total,
        "churned_users": churned,
        "churn_rate_percent": round(churn_rate, 2),
        "inactive_threshold_days": inactive_days,
    }
