"""
Centralized rate limiting configuration and utilities.

Protects against:
- Brute force attacks
- DDoS attacks
- Resource exhaustion
- API abuse
"""

from functools import wraps
from fastapi import Request, HTTPException, status
from slowapi.errors import RateLimitExceeded
from datetime import datetime, timedelta
from typing import Optional
from loguru import logger

# Rate limit definitions (requests per minute)
RATE_LIMITS = {
    # Authentication
    "auth:login": 5,  # 5 login attempts per minute (enforced via account lockout in auth.py)
    "auth:register": 5,  # 5 registrations per minute
    "auth:refresh": 30,  # 30 refresh attempts per minute

    # Game operations
    "games:create": 10,  # 10 game creations per minute per user
    "games:join": 20,  # 20 join attempts per minute
    "games:play_card": 60,  # 60 card plays per minute (normal gameplay)
    "games:catch_ten": 30,  # 30 catch actions per minute

    # Lobby operations
    "lobbies:list": 60,  # 60 lobby list requests per minute
    "lobbies:create": 10,  # 10 lobby creations per minute
    "lobbies:join": 20,  # 20 lobby joins per minute

    # User operations
    "users:profile": 60,  # 60 profile requests per minute
    "users:update": 10,  # 10 profile updates per minute
    "users:avatar": 5,  # 5 avatar uploads per minute

    # Leaderboard
    "leaderboard:get": 120,  # 120 leaderboard queries per minute

    # Messages
    "messages:send": 30,  # 30 messages per minute (chat safety)

    # Default global limit
    "global": 100,  # 100 requests per minute per IP (fallback)
}

# Severity levels for rate limit violations
RATE_LIMIT_SEVERITY = {
    "auth:login": "CRITICAL",  # Login brute force
    "auth:register": "WARNING",  # Registration spam
    "games:create": "WARNING",  # Game spam
    "users:avatar": "WARNING",  # Upload spam
}


def get_rate_limit(endpoint: str) -> int:
    """Get rate limit (requests/minute) for an endpoint."""
    return RATE_LIMITS.get(endpoint, RATE_LIMITS["global"])


def get_rate_limit_key(request: Request, endpoint: str) -> str:
    """
    Generate rate limit key combining endpoint and client IP.
    Format: "endpoint:ip:minute"
    """
    client_ip = (
        request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        or request.headers.get("x-real-ip", "")
        or request.client.host
    )

    # Use minute-based key for rotating rate limits
    minute = datetime.utcnow().replace(second=0, microsecond=0)
    return f"{endpoint}:{client_ip}:{minute.isoformat()}"


async def apply_rate_limit(request: Request, endpoint: str, limiter) -> None:
    """
    Apply rate limit for an endpoint.
    Raises HTTPException if rate limit exceeded.
    """
    if not limiter:
        return  # Rate limiting disabled

    limit = get_rate_limit(endpoint)
    severity = RATE_LIMIT_SEVERITY.get(endpoint, "INFO")

    try:
        # Get the rate limiter from app state
        if hasattr(request.app.state, 'limiter'):
            limiter_instance = request.app.state.limiter
            # Apply rate limit with custom message
            limiter_instance.try_accept_visit(request, response=None, increment=1)
    except RateLimitExceeded:
        client_ip = (
            request.headers.get("x-forwarded-for", "").split(",")[0].strip()
            or request.headers.get("x-real-ip", "")
            or request.client.host
        )

        logger.warning(
            f"🚫 Rate limit exceeded: {endpoint} from {client_ip} "
            f"(limit: {limit} req/min, severity: {severity})"
        )

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests. Please retry after 1 minute.",
        )


def rate_limit(endpoint: str):
    """
    Decorator to apply rate limiting to route handlers.

    Usage:
        @router.get("/some-endpoint")
        @rate_limit("endpoint:name")
        async def handler(request: Request):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            limiter = request.app.state.limiter if hasattr(request.app.state, 'limiter') else None
            await apply_rate_limit(request, endpoint, limiter)
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator


def get_rate_limit_headers(endpoint: str) -> dict:
    """
    Get X-RateLimit headers for response.
    Informs clients about rate limits.
    """
    limit = get_rate_limit(endpoint)
    return {
        "X-RateLimit-Limit": str(limit),
        "X-RateLimit-Remaining": "unknown",  # Would need to track in Redis
        "X-RateLimit-Reset": str(int((datetime.utcnow() + timedelta(minutes=1)).timestamp())),
    }
