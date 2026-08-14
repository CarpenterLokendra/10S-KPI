from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Dict


async def get_revenue_over_time(db: Session, days: int = 30) -> List[Dict]:
    """Revenue per day from premium subscriptions"""
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            DATE(ps.started_at) as date,
            SUM(ps.price_usd) as daily_revenue,
            COUNT(*) as subscription_count
        FROM "10s_schema".premium_subscriptions ps
        WHERE ps.started_at >= :start_date AND ps.is_active
        GROUP BY DATE(ps.started_at)
        ORDER BY date ASC
    """)
    result = db.execute(query, {"start_date": start_date})
    return [{"date": row[0].isoformat(), "revenue": round(float(row[1]), 2), "subscriptions": row[2]} for row in result]


async def get_revenue_by_provider(db: Session, days: int = 90) -> List[Dict]:
    """Revenue breakdown by payment provider"""
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            ps.payment_provider,
            SUM(ps.price_usd) as revenue,
            COUNT(*) as subscription_count
        FROM "10s_schema".premium_subscriptions ps
        WHERE ps.started_at >= :start_date AND ps.is_active
        GROUP BY ps.payment_provider
        ORDER BY revenue DESC
    """)
    result = db.execute(query, {"start_date": start_date})
    return [{"provider": row[0], "revenue": round(float(row[1]), 2), "count": row[2]} for row in result]


async def get_revenue_by_platform(db: Session, days: int = 90) -> List[Dict]:
    """Revenue breakdown by platform (web, ios, android)"""
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            ps.platform,
            SUM(ps.price_usd) as revenue,
            COUNT(*) as subscription_count
        FROM "10s_schema".premium_subscriptions ps
        WHERE ps.started_at >= :start_date AND ps.is_active
        GROUP BY ps.platform
        ORDER BY revenue DESC
    """)
    result = db.execute(query, {"start_date": start_date})
    return [{"platform": row[0], "revenue": round(float(row[1]), 2), "count": row[2]} for row in result]


async def get_premium_conversion_rate(db: Session) -> Dict:
    """% of users with premium subscriptions"""
    query = text("""
        SELECT
            COUNT(DISTINCT u.id) as total_users,
            COUNT(DISTINCT CASE WHEN u.is_premium THEN u.id END) as premium_users
        FROM "10s_schema".users u
    """)
    result = db.execute(query).fetchone()
    total = result[0] or 0
    premium = result[1] or 0
    conversion_rate = (premium / total * 100) if total > 0 else 0
    return {
        "total_users": total,
        "premium_users": premium,
        "conversion_rate_percent": round(conversion_rate, 2),
    }


async def get_total_revenue(db: Session, days: int = 30) -> Dict:
    """Total revenue for period"""
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            SUM(ps.price_usd) as total_revenue,
            COUNT(*) as subscription_count,
            AVG(ps.price_usd) as avg_price
        FROM "10s_schema".premium_subscriptions ps
        WHERE ps.started_at >= :start_date AND ps.is_active
    """)
    result = db.execute(query, {"start_date": start_date}).fetchone()
    total_revenue = float(result[0]) if result[0] else 0
    count = result[1] or 0
    avg_price = float(result[2]) if result[2] else 0
    return {
        "total_revenue_usd": round(total_revenue, 2),
        "subscription_count": count,
        "avg_subscription_price": round(avg_price, 2),
        "days": days,
    }


async def get_ad_engagement(db: Session, days: int = 30) -> Dict:
    """Ad views and engagement"""
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            ad_network,
            COUNT(*) as total_ads,
            COUNT(CASE WHEN is_completed THEN 1 END) as completed_ads,
            COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked_ads
        FROM "10s_schema".ad_servings
        WHERE created_at >= :start_date
        GROUP BY ad_network
    """)
    result = db.execute(query, {"start_date": start_date})
    data = []
    for row in result:
        network = row[0] or "unknown"
        total = row[1] or 0
        completed = row[2] or 0
        clicked = row[3] or 0
        completion_rate = (completed / total * 100) if total > 0 else 0
        ctr = (clicked / total * 100) if total > 0 else 0
        data.append({
            "network": network,
            "total_ads": total,
            "completed_ads": completed,
            "clicked_ads": clicked,
            "completion_rate_percent": round(completion_rate, 2),
            "ctr_percent": round(ctr, 2),
        })
    return data


async def get_arpu(db: Session, days: int = 30) -> Dict:
    """Average Revenue Per User"""
    start_date = datetime.utcnow() - timedelta(days=days)
    query = text("""
        SELECT
            COUNT(DISTINCT u.id) as active_users,
            COALESCE(SUM(ps.price_usd), 0) as total_revenue
        FROM "10s_schema".users u
        LEFT JOIN "10s_schema".premium_subscriptions ps ON u.id = ps.user_id AND ps.started_at >= :start_date
    """)
    result = db.execute(query, {"start_date": start_date}).fetchone()
    active_users = result[0] or 0
    total_revenue = float(result[1]) if result[1] else 0
    arpu = (total_revenue / active_users) if active_users > 0 else 0
    return {
        "active_users": active_users,
        "total_revenue_usd": round(total_revenue, 2),
        "arpu": round(arpu, 2),
        "days": days,
    }
