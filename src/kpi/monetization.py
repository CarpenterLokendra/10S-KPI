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


async def get_paid_users_analytics(db: Session, days: int = 30) -> Dict:
    """Get paid users count and growth metrics"""
    start_date = datetime.utcnow() - timedelta(days=days)
    previous_start = start_date - timedelta(days=days)

    # Total paid users (unique users with active subscriptions)
    query = text("""
        SELECT COUNT(DISTINCT user_id) as paid_users
        FROM "10s_schema".premium_subscriptions
        WHERE is_active = true
    """)
    total_paid = db.execute(query).fetchone()[0] or 0

    # Active subscriptions breakdown
    query = text("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN billing_period = 'monthly' THEN 1 ELSE 0 END) as monthly,
            SUM(CASE WHEN billing_period = 'yearly' THEN 1 ELSE 0 END) as yearly
        FROM "10s_schema".premium_subscriptions
        WHERE is_active = true
    """)
    result = db.execute(query).fetchone()
    total_subs = result[0] or 0
    monthly_subs = result[1] or 0
    yearly_subs = result[2] or 0

    # Calculate MRR and ARR (in INR for consistent base)
    query = text("""
        SELECT
            COALESCE(SUM(CASE WHEN billing_period = 'monthly' THEN amount ELSE 0 END), 0) as monthly_revenue,
            COALESCE(SUM(CASE WHEN billing_period = 'yearly' THEN amount/12 ELSE 0 END), 0) as yearly_monthly_equivalent
        FROM "10s_schema".premium_subscriptions
        WHERE is_active = true AND currency = 'INR'
    """)
    result = db.execute(query).fetchone()
    mrr = float(result[0] or 0) + float(result[1] or 0)
    arr = mrr * 12

    # Growth metrics - new subscriptions this period
    query = text("""
        SELECT COUNT(*) as new_subs
        FROM "10s_schema".premium_subscriptions
        WHERE started_at >= :start_date
    """)
    new_subs_this = db.execute(query, {"start_date": start_date}).fetchone()[0] or 0

    # Previous period
    query = text("""
        SELECT COUNT(*) as new_subs
        FROM "10s_schema".premium_subscriptions
        WHERE started_at >= :start_date AND started_at < :end_date
    """)
    new_subs_prev = db.execute(query, {"start_date": previous_start, "end_date": start_date}).fetchone()[0] or 0

    growth_rate = ((new_subs_this - new_subs_prev) / new_subs_prev * 100) if new_subs_prev > 0 else 0

    # Subscription status breakdown
    query = text("""
        SELECT
            SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END) as cancelled,
            SUM(CASE WHEN is_active = true AND expires_at < NOW() THEN 1 ELSE 0 END) as expired
        FROM "10s_schema".premium_subscriptions
    """)
    result = db.execute(query).fetchone()

    return {
        "total_paid_users": total_paid,
        "active_subscriptions": total_subs,
        "monthly_subscriptions": monthly_subs,
        "yearly_subscriptions": yearly_subs,
        "mrr_inr": round(mrr, 2),
        "arr_inr": round(arr, 2),
        "growth": {
            "new_subscriptions_this_period": new_subs_this,
            "growth_rate_percent": round(growth_rate, 2),
        },
        "subscription_breakdown": {
            "active": result[0] or 0,
            "cancelled": result[1] or 0,
            "expired": result[2] or 0,
        },
        "period_days": days,
    }


async def get_region_distribution(db: Session, days: int = 30) -> Dict:
    """Get user distribution by region with conversion rates"""
    start_date = datetime.utcnow() - timedelta(days=days)
    previous_start = start_date - timedelta(days=days)

    # Total user counts
    query = text("""
        SELECT COUNT(DISTINCT id) as total_users
        FROM "10s_schema".users
    """)
    total_users = db.execute(query).fetchone()[0] or 0

    # Total paid users
    query = text("""
        SELECT COUNT(DISTINCT user_id) as paid_users
        FROM "10s_schema".premium_subscriptions
        WHERE is_active = true
    """)
    total_paid = db.execute(query).fetchone()[0] or 0

    # Regional breakdown
    query = text("""
        SELECT
            u.country,
            COUNT(DISTINCT u.id) as total_users,
            COUNT(DISTINCT CASE WHEN ps.is_active THEN ps.user_id END) as paid_users,
            COUNT(DISTINCT CASE WHEN u.created_at >= :start_date THEN u.id END) as new_users_this_period
        FROM "10s_schema".users u
        LEFT JOIN "10s_schema".premium_subscriptions ps ON u.id = ps.user_id
        WHERE u.country IS NOT NULL
        GROUP BY u.country
        ORDER BY total_users DESC
    """)
    regions = []

    for row in db.execute(query, {"start_date": start_date}):
        country = row[0] or "Unknown"
        total = row[1] or 0
        paid = row[2] or 0
        new_users = row[3] or 0

        # Previous period count for growth
        prev_query = text("""
            SELECT COUNT(DISTINCT id) as count
            FROM "10s_schema".users
            WHERE country = :country AND created_at >= :start_date AND created_at < :end_date
        """)
        prev_count = db.execute(prev_query, {
            "country": country,
            "start_date": previous_start,
            "end_date": start_date
        }).fetchone()[0] or 0

        growth_rate = ((new_users - prev_count) / prev_count * 100) if prev_count > 0 else 0
        conversion_rate = (paid / total * 100) if total > 0 else 0

        regions.append({
            "country": country,
            "total_users": total,
            "paid_users": paid,
            "conversion_rate_percent": round(conversion_rate, 2),
            "new_users_this_period": new_users,
            "growth_rate_percent": round(growth_rate, 2),
        })

    return {
        "total_users": total_users,
        "total_paid_users": total_paid,
        "regions": regions[:50],  # Top 50 regions
        "top_regions": regions[:10],  # Top 10
        "period_days": days,
    }
