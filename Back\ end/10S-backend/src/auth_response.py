"""
Shared authentication response helpers for session token issuance and cookie setting.
Used by register(), login(), and verify_registration_otp() endpoints.
"""

from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from .models import User
from .security import create_access_token, create_refresh_token
from .csrf_protection import generate_csrf_token
from .config import JWT_EXPIRATION_HOURS, JWT_REFRESH_EXPIRATION_DAYS


def build_user_dict(user: User) -> dict:
    """
    Build the user object for auth responses.
    Ensures consistent structure across all endpoints.
    """
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "email_verified": user.email_verified,  # Always included for frontend badge display
        "phone_number": user.phone_number,
        "avatar_url": user.avatar_url,
        "is_active": user.is_active,
        "is_premium": user.is_premium,
        "total_games": user.total_games,
        "total_wins": user.total_wins,
        "rating": user.rating,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "auth_method": user.auth_method
    }


def issue_session_response(
    user: User,
    status_code: int = 200,
    extra_fields: dict | None = None
) -> JSONResponse:
    """
    Create a complete authentication response with tokens, cookies, and user data.

    Args:
        user: User model instance to build response for
        status_code: HTTP status (201 for register, 200 for login/verify-otp)
        extra_fields: Additional fields to merge into response body (e.g. {"verified": True})

    Returns:
        JSONResponse with access_token, refresh_token, csrf_token, token_type,
        expires_in, refresh_expires_in, user object, plus httpOnly auth cookies.
    """
    # Create JWT tokens
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    # Generate CSRF token for web frontend
    csrf_token = generate_csrf_token(str(user.id))

    # Build response body
    response_body = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "csrf_token": csrf_token,
        "token_type": "bearer",
        "expires_in": JWT_EXPIRATION_HOURS * 3600,
        "refresh_expires_in": JWT_REFRESH_EXPIRATION_DAYS * 86400,
        "user": build_user_dict(user),
    }

    # Merge any extra fields (e.g. verified: True from verify-otp)
    if extra_fields:
        response_body.update(extra_fields)

    # Create response with tokens in body
    response = JSONResponse(
        content=response_body,
        status_code=status_code
    )

    # Set secure httpOnly cookies for web (browser auto-sends with requests)
    response.set_cookie(
        key="auth_token",
        value=access_token,
        httponly=True,           # Blocks JavaScript access (XSS protection)
        secure=True,             # HTTPS only
        samesite="strict",       # CSRF protection
        max_age=JWT_EXPIRATION_HOURS * 3600,  # Matches access token TTL
        path="/"                 # Available to all paths
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=JWT_REFRESH_EXPIRATION_DAYS * 86400,  # 30 days
        path="/api/v1/auth/refresh"  # Match actual mounted route
    )

    return response
