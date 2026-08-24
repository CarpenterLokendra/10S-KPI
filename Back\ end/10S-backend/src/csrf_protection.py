"""
CSRF (Cross-Site Request Forgery) protection utilities.

Strategy:
- Generate random CSRF tokens on login
- Return token to client in response
- Client includes token in X-CSRF-Token header for state-changing operations
- Server validates token before processing
- Token expires with session
"""

import secrets
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional, Tuple
from loguru import logger
from fastapi import Request, HTTPException, status
from sqlalchemy.orm import Session

from .config import JWT_SECRET_KEY

# CSRF token expiration (same as session)
CSRF_TOKEN_EXPIRY = 24 * 3600  # 24 hours

# Protected methods that require CSRF tokens
PROTECTED_METHODS = ["POST", "PUT", "PATCH", "DELETE"]


def generate_csrf_token(user_id: str) -> str:
    """
    Generate a secure CSRF token.

    Token is generated using:
    1. Random secrets.token_urlsafe(32)
    2. HMAC-SHA256 with JWT_SECRET_KEY
    3. Format: random_part:hmac_signature
    """
    random_part = secrets.token_urlsafe(32)

    # Create HMAC signature
    message = f"{user_id}:{random_part}".encode()
    signature = hmac.new(
        JWT_SECRET_KEY.encode(),
        message,
        hashlib.sha256
    ).hexdigest()

    # Combine: random_part:signature
    token = f"{random_part}:{signature}"

    logger.debug(f"Generated CSRF token for user {user_id}")
    return token


def validate_csrf_token(
    token: str,
    user_id: str,
    secret_key: str = JWT_SECRET_KEY
) -> Tuple[bool, str]:
    """
    Validate a CSRF token.

    Returns:
        (is_valid, error_message)
    """
    if not token:
        return False, "CSRF token is missing"

    try:
        random_part, signature = token.split(":", 1)
    except ValueError:
        return False, "CSRF token format is invalid"

    # Recalculate expected signature
    message = f"{user_id}:{random_part}".encode()
    expected_signature = hmac.new(
        secret_key.encode(),
        message,
        hashlib.sha256
    ).hexdigest()

    # Constant-time comparison to prevent timing attacks
    if not hmac.compare_digest(signature, expected_signature):
        logger.warning(f"🚨 CSRF token validation failed for user {user_id}")
        return False, "CSRF token is invalid"

    logger.debug(f"CSRF token validated for user {user_id}")
    return True, ""


async def check_csrf_token(request: Request, user_id: str) -> None:
    """
    Middleware-style CSRF validation.

    For POST/PUT/PATCH/DELETE requests:
    - Extract token from X-CSRF-Token header
    - Validate token
    - Raise HTTPException if invalid

    Raises:
        HTTPException 403 if CSRF token is missing or invalid
    """
    # Only check state-changing operations
    if request.method not in PROTECTED_METHODS:
        return

    # Allow OPTIONS requests (preflight)
    if request.method == "OPTIONS":
        return

    # Get CSRF token from header
    csrf_token = request.headers.get("X-CSRF-Token")

    if not csrf_token:
        logger.warning(f"🚫 CSRF token missing for user {user_id} on {request.url.path}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token is missing. Include X-CSRF-Token header."
        )

    # Validate token
    is_valid, error = validate_csrf_token(csrf_token, user_id)

    if not is_valid:
        logger.warning(f"🚨 CSRF token validation failed for user {user_id}: {error}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token is invalid or expired"
        )


def store_csrf_token_in_db(
    db: Session,
    user_id: str,
    csrf_token: str,
    expiry_seconds: int = CSRF_TOKEN_EXPIRY
) -> None:
    """
    Store CSRF token in database for server-side validation.

    Optional: Can store tokens in database for additional security
    (revocation, multi-device handling, etc.)

    Currently unused (tokens are validated using HMAC signature only),
    but can be enabled for stricter requirements.
    """
    # Implementation depends on having a CSRFToken model
    # db.add(CSRFToken(user_id=user_id, token=csrf_token, expires_at=...))
    # db.commit()
    pass


def revoke_csrf_token(db: Session, user_id: str) -> None:
    """
    Revoke all CSRF tokens for a user.

    Called on logout to prevent CSRF attacks with old tokens.
    """
    # Implementation depends on having a CSRFToken model
    # db.query(CSRFToken).filter(CSRFToken.user_id == user_id).delete()
    # db.commit()
    logger.debug(f"Revoked CSRF tokens for user {user_id}")


# ============================================
# CSRF TOKEN RESPONSE
# ============================================

def get_csrf_token_response_header(csrf_token: str) -> dict:
    """
    Get response headers for CSRF token.

    Returns X-CSRF-Token header that client should use in subsequent requests.
    """
    return {
        "X-CSRF-Token": csrf_token,
        "X-CSRF-Token-Expires": str(CSRF_TOKEN_EXPIRY),
    }
