"""
Middleware to enforce device attestation on protected endpoints.

Mobile clients (Android) must provide valid Play Integrity tokens.
Web clients use Origin/Sec-Fetch-Site validation instead.
iOS clients: stub for now (not enforced until iOS app exists).
"""

from fastapi import Request, HTTPException, status
from loguru import logger
from .device_attestation import verify_client_attestation, AttestationVerificationError
from .config import ENVIRONMENT

# Endpoints excluded from attestation verification
# These are publicly accessible and don't require device verification
ATTESTATION_EXCLUDED_ENDPOINTS = {
    '/health',
    '/docs',
    '/openapi.json',
    '/redoc',
    '/.well-known',  # ACME, OAuth, etc.
}

# By default, ALL other endpoints require attestation for mobile clients.
# This is safer than a whitelist approach, as new endpoints automatically
# get protected (instead of silently missing protection like the previous bug).


async def check_device_attestation(request: Request) -> None:
    """
    Verify device attestation for mobile clients on all protected endpoints.

    - Android: enforces real Play Integrity API verification
    - iOS: logged notice but not enforced (todo when iOS app exists)
    - Web: uses Origin/Sec-Fetch-Site check instead
    - Development: bypassed (allows local testing)

    Raises HTTPException if attestation is invalid or missing.
    """
    path = request.url.path

    # Skip checks for excluded endpoints (health, docs, etc.)
    if any(path.startswith(excluded) for excluded in ATTESTATION_EXCLUDED_ENDPOINTS):
        logger.debug(f"Skipping attestation for excluded endpoint: {path}")
        return

    # Skip attestation in development environment
    if ENVIRONMENT == 'development':
        logger.debug(f"Skipping attestation check in development environment")
        return

    # Get platform and attestation from headers
    platform = request.headers.get('X-Platform', 'unknown').lower()
    attestation_token = request.headers.get('X-Attestation-Token')
    device_token = request.headers.get('X-Device-Token')  # iOS only
    user_agent = request.headers.get('User-Agent', '')
    origin = request.headers.get('Origin', '')

    # Web clients: use Origin/Sec-Fetch-Site validation instead of device attestation
    # (this is a separate check already in place; just log and skip here)
    if platform == 'web' or 'Mozilla' in user_agent or origin:
        logger.debug(f"Web client request from {origin or user_agent}, using alternative auth")
        return

    # iOS: currently a stub — log notice but don't reject
    if platform == 'ios':
        logger.warning(
            f"⚠️ iOS client on {path} without Play Integrity verification (not yet enforced). "
            f"TODO: implement once iOS App Attest is available"
        )
        return

    # Android: enforce real Play Integrity verification
    if platform == 'android':
        if not attestation_token:
            logger.warning(f"❌ Missing attestation token for Android client on {path}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Device attestation required for this endpoint. "
                       "Android app must provide valid X-Attestation-Token header "
                       "(from Google Play Integrity API)."
            )

        try:
            device_info = await verify_client_attestation(
                platform=platform,
                attestation_token=attestation_token,
                device_token=device_token,
            )

            logger.info(f"✅ Device attestation verified for Android: {device_info}")
            # Store in request state for later use (e.g., audit logging)
            request.state.device_info = device_info

        except AttestationVerificationError as e:
            logger.warning(f"❌ Android attestation verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Device attestation failed. {str(e)}"
            )
        except Exception as e:
            logger.error(f"❌ Unexpected error during Android attestation: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Device verification service error"
            )
        return

    # Unknown platform: reject by default (fail-closed)
    logger.warning(f"❌ Unknown platform '{platform}' on {path}, rejecting")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=f"Unknown platform: {platform}. "
               f"Must be one of: 'android', 'ios', 'web' (via X-Platform header)"
    )
