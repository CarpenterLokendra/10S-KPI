from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth import get_current_user, limiter
from src.kpi import acquisition, engagement, retention, monetization, product_health

router = APIRouter(prefix="/api/kpi", tags=["kpi"])


@router.get("/health")
async def health_check():
    return {"status": "ok"}


# Acquisition KPIs
@router.get("/acquisition/signups-daily")
@limiter.limit("10/minute")
async def signups_daily(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await acquisition.get_new_signups_per_day(db, days)


@router.get("/acquisition/signups-weekly")
@limiter.limit("10/minute")
async def signups_weekly(weeks: int = 12, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await acquisition.get_signups_weekly(db, weeks)


@router.get("/acquisition/signups-monthly")
@limiter.limit("10/minute")
async def signups_monthly(months: int = 12, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await acquisition.get_signups_monthly(db, months)


@router.get("/acquisition/total-signups")
@limiter.limit("10/minute")
async def total_signups(_user=Depends(get_current_user), db: Session = Depends(get_db)):
    total = await acquisition.get_total_signups(db)
    return {"total_signups": total}


@router.get("/acquisition/growth-rate")
@limiter.limit("10/minute")
async def signup_growth_rate(_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await acquisition.get_signup_growth_rate(db)


# Engagement KPIs
@router.get("/engagement/dau")
@limiter.limit("10/minute")
async def dau(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_dau(db, days)


@router.get("/engagement/wau")
@limiter.limit("10/minute")
async def wau(weeks: int = 12, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_wau(db, weeks)


@router.get("/engagement/mau")
@limiter.limit("10/minute")
async def mau(months: int = 12, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_mau(db, months)


@router.get("/engagement/games-played-daily")
@limiter.limit("10/minute")
async def games_played_daily(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_games_played_daily(db, days)


@router.get("/engagement/avg-game-duration")
@limiter.limit("10/minute")
async def avg_game_duration(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_avg_game_duration(db, days)


@router.get("/engagement/lobby-conversion")
@limiter.limit("10/minute")
async def lobby_conversion(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_lobby_conversion_rate(db, days)


@router.get("/engagement/bot-vs-human")
@limiter.limit("10/minute")
async def bot_vs_human(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_bot_vs_human_mix(db, days)


# Retention KPIs
@router.get("/retention/d1")
@limiter.limit("10/minute")
async def retention_d1(days: int = 90, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await retention.get_d1_retention(db, days)


@router.get("/retention/d7")
@limiter.limit("10/minute")
async def retention_d7(days: int = 90, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await retention.get_d7_retention(db, days)


@router.get("/retention/d30")
@limiter.limit("10/minute")
async def retention_d30(days: int = 90, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await retention.get_d30_retention(db, days)


@router.get("/retention/churn-rate")
@limiter.limit("10/minute")
async def churn_rate(inactive_days: int = 7, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await retention.get_churn_rate(db, inactive_days)


# Monetization KPIs
@router.get("/monetization/revenue-daily")
@limiter.limit("10/minute")
async def revenue_daily(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_revenue_over_time(db, days)


@router.get("/monetization/revenue-by-provider")
@limiter.limit("10/minute")
async def revenue_by_provider(days: int = 90, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_revenue_by_provider(db, days)


@router.get("/monetization/revenue-by-platform")
@limiter.limit("10/minute")
async def revenue_by_platform(days: int = 90, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_revenue_by_platform(db, days)


@router.get("/monetization/premium-conversion")
@limiter.limit("10/minute")
async def premium_conversion(_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_premium_conversion_rate(db)


@router.get("/monetization/total-revenue")
@limiter.limit("10/minute")
async def total_revenue(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_total_revenue(db, days)


@router.get("/monetization/ad-engagement")
@limiter.limit("10/minute")
async def ad_engagement(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_ad_engagement(db, days)


@router.get("/monetization/arpu")
@limiter.limit("10/minute")
async def arpu(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_arpu(db, days)


# Product Health KPIs
@router.get("/health/game-completion")
@limiter.limit("10/minute")
async def game_completion(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await product_health.get_game_completion_rate(db, days)


@router.get("/health/disconnect-rate")
@limiter.limit("10/minute")
async def disconnect_rate(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await product_health.get_disconnect_rate(db, days)


@router.get("/health/avg-players-per-game")
@limiter.limit("10/minute")
async def avg_players_per_game(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await product_health.get_avg_players_per_game(db, days)


@router.get("/health/health-score")
@limiter.limit("10/minute")
async def health_score(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await product_health.get_health_score(db, days)


@router.get("/health/health-trend")
@limiter.limit("10/minute")
async def health_trend(days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await product_health.get_daily_health_trend(db, days)
