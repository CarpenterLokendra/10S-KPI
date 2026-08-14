from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth import get_current_user, limiter
from src.kpi import acquisition, engagement, retention, monetization, product_health, users

router = APIRouter(prefix="/api/kpi", tags=["kpi"])


@router.get("/health")
async def health_check():
    return {"status": "ok"}


# Acquisition KPIs
@router.get("/acquisition/signups-daily")
@limiter.limit("10/minute")
async def signups_daily(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await acquisition.get_new_signups_per_day(db, days)


@router.get("/acquisition/signups-weekly")
@limiter.limit("10/minute")
async def signups_weekly(request: Request, weeks: int = 12, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await acquisition.get_signups_weekly(db, weeks)


@router.get("/acquisition/signups-monthly")
@limiter.limit("10/minute")
async def signups_monthly(request: Request, months: int = 12, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await acquisition.get_signups_monthly(db, months)


@router.get("/acquisition/total-signups")
@limiter.limit("10/minute")
async def total_signups(request: Request, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    total = await acquisition.get_total_signups(db)
    return {"total_signups": total}


@router.get("/acquisition/growth-rate")
@limiter.limit("10/minute")
async def signup_growth_rate(request: Request, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await acquisition.get_signup_growth_rate(db)


# Engagement KPIs
@router.get("/engagement/dau")
@limiter.limit("10/minute")
async def dau(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_dau(db, days)


@router.get("/engagement/wau")
@limiter.limit("10/minute")
async def wau(request: Request, weeks: int = 12, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_wau(db, weeks)


@router.get("/engagement/mau")
@limiter.limit("10/minute")
async def mau(request: Request, months: int = 12, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_mau(db, months)


@router.get("/engagement/games-played-daily")
@limiter.limit("10/minute")
async def games_played_daily(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_games_played_daily(db, days)


@router.get("/engagement/avg-game-duration")
@limiter.limit("10/minute")
async def avg_game_duration(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_avg_game_duration(db, days)


@router.get("/engagement/lobby-conversion")
@limiter.limit("10/minute")
async def lobby_conversion(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_lobby_conversion_rate(db, days)


@router.get("/engagement/bot-vs-human")
@limiter.limit("10/minute")
async def bot_vs_human(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await engagement.get_bot_vs_human_mix(db, days)


# Retention KPIs
@router.get("/retention/d1")
@limiter.limit("10/minute")
async def retention_d1(request: Request, days: int = 90, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await retention.get_d1_retention(db, days)


@router.get("/retention/d7")
@limiter.limit("10/minute")
async def retention_d7(request: Request, days: int = 90, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await retention.get_d7_retention(db, days)


@router.get("/retention/d30")
@limiter.limit("10/minute")
async def retention_d30(request: Request, days: int = 90, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await retention.get_d30_retention(db, days)


@router.get("/retention/churn-rate")
@limiter.limit("10/minute")
async def churn_rate(request: Request, inactive_days: int = 7, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await retention.get_churn_rate(db, inactive_days)


# Monetization KPIs
@router.get("/monetization/revenue-daily")
@limiter.limit("10/minute")
async def revenue_daily(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_revenue_over_time(db, days)


@router.get("/monetization/revenue-by-provider")
@limiter.limit("10/minute")
async def revenue_by_provider(request: Request, days: int = 90, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_revenue_by_provider(db, days)


@router.get("/monetization/revenue-by-platform")
@limiter.limit("10/minute")
async def revenue_by_platform(request: Request, days: int = 90, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_revenue_by_platform(db, days)


@router.get("/monetization/premium-conversion")
@limiter.limit("10/minute")
async def premium_conversion(request: Request, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_premium_conversion_rate(db)


@router.get("/monetization/total-revenue")
@limiter.limit("10/minute")
async def total_revenue(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_total_revenue(db, days)


@router.get("/monetization/ad-engagement")
@limiter.limit("10/minute")
async def ad_engagement(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_ad_engagement(db, days)


@router.get("/monetization/arpu")
@limiter.limit("10/minute")
async def arpu(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await monetization.get_arpu(db, days)


# Users KPIs
@router.get("/users/composition")
@limiter.limit("10/minute")
async def user_composition(request: Request, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await users.get_user_composition(db)


@router.get("/users/active-premium")
@limiter.limit("10/minute")
async def active_premium_counts(request: Request, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await users.get_active_premium_counts(db)


@router.get("/users/activation")
@limiter.limit("10/minute")
async def activation_rate(request: Request, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await users.get_played_vs_dormant(db)


# Product Health KPIs
@router.get("/health/game-completion")
@limiter.limit("10/minute")
async def game_completion(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await product_health.get_game_completion_rate(db, days)


@router.get("/health/disconnect-rate")
@limiter.limit("10/minute")
async def disconnect_rate(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await product_health.get_disconnect_rate(db, days)


@router.get("/health/avg-players-per-game")
@limiter.limit("10/minute")
async def avg_players_per_game(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await product_health.get_avg_players_per_game(db, days)


@router.get("/health/health-score")
@limiter.limit("10/minute")
async def health_score(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await product_health.get_health_score(db, days)


@router.get("/health/health-trend")
@limiter.limit("10/minute")
async def health_trend(request: Request, days: int = 30, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await product_health.get_daily_health_trend(db, days)
