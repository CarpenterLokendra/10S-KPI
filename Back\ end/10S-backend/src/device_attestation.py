"""
Device attestation verification for mobile clients.

Verifies that API requests come from official, unmodified apps running on real devices.
- Android: Google Play Integrity API (real cryptographic verification)
- iOS: Apple DeviceCheck (stub, not enforced yet)
"""

import os
import json
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict
from loguru import logger

from .config import GOOGLE_PLAY_SERVICE_ACCOUNT_JSON, GOOGLE_PLAY_PACKAGE_NAME

# Cache attestation verification results to avoid repeated API calls
attestation_cache: Dict[str, Dict] = {}
CACHE_TTL_SECONDS = 3600  # Cache for 1 hour
TOKEN_AGE_LIMIT_MS = 300000  # Reject tokens older than 5 minutes (replay attack protection)


class AttestationVerificationError(Exception):
    """Raised when device attestation verification fails."""
    pass


async def verify_play_integrity_token(token: str) -> Dict:
    """
    Verify Android Play Integrity API token using Google's real verification API.

    Calls https://playintegrity.googleapis.com/v1/decodePlayIntegrity:decrypt with
    the service account to decrypt and verify the integrity token cryptographically.

    Returns device info if valid.
    Raises AttestationVerificationError if invalid.
    """
    # Check cache first
    if token in attestation_cache:
        cached = attestation_cache[token]
        if datetime.utcnow() < cached['expires_at']:
            logger.info(f"✅ Play Integrity token verified (cached)")
            return cached['data']
        else:
            del attestation_cache[token]

    if not GOOGLE_PLAY_SERVICE_ACCOUNT_JSON:
        raise AttestationVerificationError("Google Play service account not configured (missing GOOGLE_PLAY_SERVICE_ACCOUNT_JSON)")

    try:
        # Decode and parse service account JSON
        service_account_json = base64.b64decode(GOOGLE_PLAY_SERVICE_ACCOUNT_JSON).decode()
        credentials_dict = json.loads(service_account_json)

        # Authenticate with Google using service account
        from google.auth.transport.requests import Request
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build

        credentials = Credentials.from_service_account_info(
            credentials_dict,
            scopes=["https://www.googleapis.com/auth/playintegrity"]
        )
        credentials.refresh(Request())

        # Build Google Play Integrity API client
        service = build("playintegrity", "v1", credentials=credentials)

        # Call the decodePlayIntegrity endpoint
        request = service.v1().decodeIntegrityToken(
            packageName=GOOGLE_PLAY_PACKAGE_NAME,
            body={"integrityToken": token}
        )
        result = request.execute()

        # Extract and verify the decoded token payload
        # Google returns: {"tokenPayloadExternal": {...}} after successful decryption
        payload = result.get("tokenPayloadExternal", {})
        if not payload:
            raise AttestationVerificationError("Empty token payload from Google")

        # Verify request details
        request_details = payload.get("requestDetails", {})
        request_package_name = request_details.get("requestPackageName")
        if request_package_name != GOOGLE_PLAY_PACKAGE_NAME:
            raise AttestationVerificationError(
                f"Package name mismatch: expected {GOOGLE_PLAY_PACKAGE_NAME}, got {request_package_name}"
            )

        # Verify token freshness (prevent replay attacks)
        request_timestamp_ms = request_details.get("requestTimestampMillis", 0)
        if request_timestamp_ms:
            age_ms = int(datetime.utcnow().timestamp() * 1000) - request_timestamp_ms
            if age_ms > TOKEN_AGE_LIMIT_MS:
                raise AttestationVerificationError(f"Token is stale ({age_ms}ms old, limit is {TOKEN_AGE_LIMIT_MS}ms)")

        # Verify app integrity
        app_integrity = payload.get("appIntegrity", {})
        app_recognition_verdict = app_integrity.get("appRecognitionVerdict")
        if app_recognition_verdict != "PLAY_RECOGNIZED":
            raise AttestationVerificationError(
                f"App not recognized by Play Store: {app_recognition_verdict}. "
                "Possible causes: unofficial/cloned app, tampered build, or not yet indexed by Play."
            )

        # Verify device integrity
        device_integrity = payload.get("deviceIntegrity", {})
        device_verdicts = device_integrity.get("deviceRecognitionVerdict", [])
        # We require at least MEETS_DEVICE_INTEGRITY; MEETS_BASIC_INTEGRITY is acceptable fallback
        acceptable_verdicts = {"MEETS_DEVICE_INTEGRITY", "MEETS_BASIC_INTEGRITY"}
        if not any(v in device_verdicts for v in acceptable_verdicts):
            raise AttestationVerificationError(
                f"Device integrity check failed: {device_verdicts}. "
                "Device may be compromised, rooted, or running in an unsafe environment."
            )

        # Extract device integrity level (strongest one)
        if "MEETS_DEVICE_INTEGRITY" in device_verdicts:
            integrity_level = "MEETS_DEVICE_INTEGRITY"
        else:
            integrity_level = "MEETS_BASIC_INTEGRITY"

        device_info = {
            'platform': 'android',
            'package_name': request_package_name,
            'app_integrity': app_recognition_verdict,
            'device_integrity': integrity_level,
            'timestamp': datetime.utcnow().isoformat(),
        }

        # Cache the verification
        attestation_cache[token] = {
            'data': device_info,
            'expires_at': datetime.utcnow() + timedelta(seconds=CACHE_TTL_SECONDS)
        }

        logger.info(f"✅ Play Integrity token verified for {request_package_name} (integrity: {integrity_level})")
        return device_info

    except Exception as e:
        logger.error(f"❌ Play Integrity verification failed: {type(e).__name__}: {e}")
        if isinstance(e, AttestationVerificationError):
            raise
        raise AttestationVerificationError(f"Verification failed: {str(e)}")


async def verify_device_check_token(token: str, device_token: str) -> Dict:
    """
    Verify iOS DeviceCheck token.

    Returns device info if valid.
    Raises AttestationVerificationError if invalid.
    """
    # Check cache first
    cache_key = f"ios:{device_token}"
    if cache_key in attestation_cache:
        cached = attestation_cache[cache_key]
        if datetime.utcnow() < cached['expires_at']:
            logger.info(f"✅ DeviceCheck token verified (cached)")
            return cached['data']
        else:
            del attestation_cache[cache_key]

    try:
        # In production, validate with Apple's DeviceCheck API
        # Requires: keyId, teamId, bundleId from Apple

        # For MVP, verify JWT structure
        import jwt
        payload = jwt.decode(token, options={"verify_signature": False})

        if not isinstance(payload, dict):
            raise AttestationVerificationError("Invalid token format")

        device_info = {
            'platform': 'ios',
            'bundle_id': payload.get('bundleId'),
            'timestamp': datetime.utcnow().isoformat(),
            'device_token': device_token[:16] + '...',  # Log truncated token
        }

        # Cache the verification
        attestation_cache[cache_key] = {
            'data': device_info,
            'expires_at': datetime.utcnow() + timedelta(seconds=CACHE_TTL_SECONDS)
        }

        logger.info(f"✅ DeviceCheck token verified for {device_info['bundle_id']}")
        return device_info

    except Exception as e:
        logger.error(f"❌ DeviceCheck verification failed: {e}")
        raise AttestationVerificationError(f"Verification failed: {str(e)}")


async def verify_client_attestation(
    platform: str,
    attestation_token: Optional[str] = None,
    device_token: Optional[str] = None,
) -> Dict:
    """
    Verify device attestation based on platform.

    Args:
        platform: 'android', 'ios', or 'web'
        attestation_token: Token from Play Integrity API (Android) or similar
        device_token: Device identifier token (iOS)

    Returns:
        Device info dict with platform, app name, etc.

    Raises:
        AttestationVerificationError if verification fails
    """
    if platform == 'android':
        if not attestation_token:
            raise AttestationVerificationError("attestation_token required for Android")
        return await verify_play_integrity_token(attestation_token)

    elif platform == 'ios':
        if not attestation_token or not device_token:
            raise AttestationVerificationError("attestation_token and device_token required for iOS")
        return await verify_device_check_token(attestation_token, device_token)

    elif platform == 'web':
        # Web: use client authentication instead (separate mechanism)
        raise AttestationVerificationError("Web platform requires different authentication")

    else:
        raise AttestationVerificationError(f"Unknown platform: {platform}")


def clear_attestation_cache():
    """Clear expired cache entries. Call periodically."""
    expired_keys = [
        key for key, cached in attestation_cache.items()
        if datetime.utcnow() >= cached['expires_at']
    ]
    for key in expired_keys:
        del attestation_cache[key]
    if expired_keys:
        logger.info(f"Cleared {len(expired_keys)} expired attestation cache entries")


# Background task to clean cache
async def cleanup_attestation_cache_task():
    """Periodic cleanup of expired cache entries."""
    import asyncio
    while True:
        await asyncio.sleep(600)  # Every 10 minutes
        clear_attestation_cache()
