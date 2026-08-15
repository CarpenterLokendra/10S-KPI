from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Dict


async def get_new_signups_per_day(db: Session, days: int = 30) -> List[Dict]:
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            DATE(created_at) as date,
            COUNT(*) as signup_count
        FROM "10s_schema".users
        WHERE created_at >= :start_date
          AND id NOT LIKE 'bot_%'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    """)
    result = db.execute(query, {"start_date": start_date})
    return [{"date": row[0].isoformat(), "count": row[1]} for row in result]


async def get_signups_weekly(db: Session, weeks: int = 12) -> List[Dict]:
    start_date = datetime.utcnow() - timedelta(weeks=weeks)
    query = text("""
        SELECT
            DATE_TRUNC('week', created_at)::DATE as week,
            COUNT(*) as signup_count
        FROM "10s_schema".users
        WHERE created_at >= :start_date
          AND id NOT LIKE 'bot_%'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY week ASC
    """)
    result = db.execute(query, {"start_date": start_date})
    return [{"week": row[0].isoformat(), "count": row[1]} for row in result]


async def get_signups_monthly(db: Session, months: int = 12) -> List[Dict]:
    start_date = datetime.utcnow() - timedelta(days=30 * months)
    query = text("""
        SELECT
            DATE_TRUNC('month', created_at)::DATE as month,
            COUNT(*) as signup_count
        FROM "10s_schema".users
        WHERE created_at >= :start_date
          AND id NOT LIKE 'bot_%'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
    """)
    result = db.execute(query, {"start_date": start_date})
    return [{"month": row[0].isoformat(), "count": row[1]} for row in result]


async def get_total_signups(db: Session) -> int:
    query = text("SELECT COUNT(*) FROM \"10s_schema\".users WHERE id NOT LIKE 'bot_%'")
    result = db.execute(query)
    return result.scalar() or 0


async def get_signup_growth_rate(db: Session) -> Dict:
    """Returns WoW and MoM growth rates"""
    today = datetime.utcnow()
    week_ago = today - timedelta(days=7)
    two_weeks_ago = today - timedelta(days=14)
    month_ago = today - timedelta(days=30)
    two_months_ago = today - timedelta(days=60)

    query = text("""
        SELECT
            SUM(CASE WHEN created_at >= :week_ago THEN 1 ELSE 0 END) as this_week,
            SUM(CASE WHEN created_at >= :two_weeks_ago AND created_at < :week_ago THEN 1 ELSE 0 END) as last_week,
            SUM(CASE WHEN created_at >= :month_ago THEN 1 ELSE 0 END) as this_month,
            SUM(CASE WHEN created_at >= :two_months_ago AND created_at < :month_ago THEN 1 ELSE 0 END) as last_month
        FROM "10s_schema".users
        WHERE id NOT LIKE 'bot_%'
    """)
    result = db.execute(query, {
        "week_ago": week_ago,
        "two_weeks_ago": two_weeks_ago,
        "month_ago": month_ago,
        "two_months_ago": two_months_ago,
    }).fetchone()

    this_week = result[0] or 0
    last_week = result[1] or 0
    this_month = result[2] or 0
    last_month = result[3] or 0

    wow_rate = ((this_week - last_week) / last_week * 100) if last_week > 0 else 0
    mom_rate = ((this_month - last_month) / last_month * 100) if last_month > 0 else 0

    return {
        "wow_percent": round(wow_rate, 2),
        "mom_percent": round(mom_rate, 2),
        "this_week": this_week,
        "last_week": last_week,
        "this_month": this_month,
        "last_month": last_month,
    }
