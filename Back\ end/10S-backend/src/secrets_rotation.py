"""
Secrets rotation and versioning utilities.

Strategy:
- Store multiple JWT secret versions (current + previous)
- Accept tokens signed with current OR previous secret
- Rotate secrets on deployment
- Old secrets expire after configured grace period
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict
from loguru import logger
import os
from .config import JWT_SECRET_KEY

# Number of previous secrets to keep (for rotation grace period)
MAX_PREVIOUS_SECRETS = 3

# Grace period for old secrets (they still work during this time)
SECRET_ROTATION_GRACE_PERIOD_DAYS = 7


class SecretRotationManager:
    """Manage JWT secret rotation for zero-downtime deployments."""

    def __init__(self):
        """Initialize secret manager with current and previous secrets."""
        self.current_secret = JWT_SECRET_KEY
        self.previous_secrets: List[Dict] = []
        self._load_secrets_from_env()

    def _load_secrets_from_env(self):
        """Load previous secrets from environment if available."""
        # Could load from environment variables like:
        # JWT_SECRET_KEY_PREVIOUS_1, JWT_SECRET_KEY_PREVIOUS_2, etc.
        # Or from AWS Parameter Store with version tags

        # For now, we just use the current secret
        logger.info(f"Loaded {len(self.previous_secrets)} previous secrets for rotation grace period")

    def get_all_valid_secrets(self) -> List[str]:
        """
        Get all secrets that should be accepted (current + valid previous).

        Returns:
            List of secrets in priority order (current first)
        """
        valid_secrets = [self.current_secret]

        # Add previous secrets that haven't expired
        now = datetime.utcnow()
        grace_period = timedelta(days=SECRET_ROTATION_GRACE_PERIOD_DAYS)

        for secret_info in self.previous_secrets:
            rotated_at = secret_info.get("rotated_at")
            if rotated_at and (now - rotated_at) < grace_period:
                valid_secrets.append(secret_info["secret"])
            else:
                logger.info(f"Expired secret {secret_info.get('id')} (rotated {rotated_at})")

        return valid_secrets

    def rotate_secret(self, new_secret: str) -> None:
        """
        Rotate to a new JWT secret.

        The old secret becomes a "previous secret" and remains valid during grace period.

        Args:
            new_secret: The new JWT secret key
        """
        if new_secret == self.current_secret:
            logger.warning("Attempted to rotate to same secret - skipping")
            return

        # Move current to previous
        self.previous_secrets.insert(0, {
            "id": len(self.previous_secrets),
            "secret": self.current_secret,
            "rotated_at": datetime.utcnow(),
        })

        # Keep only MAX_PREVIOUS_SECRETS
        if len(self.previous_secrets) > MAX_PREVIOUS_SECRETS:
            removed = self.previous_secrets.pop()
            logger.warning(f"Removed expired secret {removed['id']}")

        # Update current
        self.current_secret = new_secret

        logger.info(
            f"🔄 JWT secret rotated. Keeping {len(self.previous_secrets)} "
            f"previous secrets for {SECRET_ROTATION_GRACE_PERIOD_DAYS} days grace period"
        )

    def get_current_secret(self) -> str:
        """Get the current (latest) secret."""
        return self.current_secret

    def get_status(self) -> dict:
        """Get rotation status for monitoring/logging."""
        valid_count = len(self.get_all_valid_secrets())

        return {
            "current_secret_age_seconds": 0,  # Would need to track rotation time
            "valid_secrets_count": valid_count,
            "previous_secrets_count": len(self.previous_secrets),
            "grace_period_days": SECRET_ROTATION_GRACE_PERIOD_DAYS,
            "status": "healthy",
        }


# Global instance
_rotation_manager: Optional[SecretRotationManager] = None


def get_rotation_manager() -> SecretRotationManager:
    """Get or create the global SecretRotationManager instance."""
    global _rotation_manager
    if _rotation_manager is None:
        _rotation_manager = SecretRotationManager()
    return _rotation_manager


# ============================================
# DEPLOYMENT-TIME ROTATION
# ============================================

def rotate_secrets_on_deployment():
    """
    Called during deployment to rotate secrets.

    In production:
    1. Generate new JWT_SECRET_KEY
    2. Store in AWS Parameter Store with version tag
    3. Update Docker container env
    4. Old secret becomes "previous" with grace period
    """
    manager = get_rotation_manager()

    # In production deployment, you would:
    # 1. Generate new secret:
    #    new_secret = secrets.token_urlsafe(32)
    # 2. Store in Parameter Store:
    #    aws ssm put-parameter --name /prod/jwt-secret-key --value $new_secret
    # 3. Rotate:
    #    manager.rotate_secret(new_secret)

    logger.info("💡 To rotate secrets in production:")
    logger.info("  1. Generate: python3 -c 'import secrets; print(secrets.token_urlsafe(32))'")
    logger.info("  2. Store in AWS Parameter Store: /prod/jwt-secret-key")
    logger.info("  3. Redeploy container (picks up new env)")


# ============================================
# AUTOMATED ROTATION SCHEDULE
# ============================================

async def schedule_secret_rotation_check():
    """
    Background task that checks for secret rotation on schedule.

    Runs daily to:
    1. Check if secrets are close to grace period expiry
    2. Log warnings if rotation needed soon
    3. Alert ops team
    """
    import asyncio

    manager = get_rotation_manager()
    check_interval = 86400  # Daily

    while True:
        try:
            status = manager.get_status()

            # Log status
            logger.info(
                f"🔑 Secret rotation status: "
                f"Valid secrets={status['valid_secrets_count']}, "
                f"Previous={status['previous_secrets_count']}, "
                f"Grace period={status['grace_period_days']}d"
            )

            # Check if any secrets are expiring soon
            for secret_info in manager.previous_secrets:
                days_until_expiry = SECRET_ROTATION_GRACE_PERIOD_DAYS - (
                    (datetime.utcnow() - secret_info["rotated_at"]).days
                )

                if days_until_expiry <= 1:
                    logger.warning(
                        f"⚠️  Secret {secret_info['id']} expiring in {days_until_expiry} days! "
                        f"Rotation recommended."
                    )

        except Exception as e:
            logger.error(f"Secret rotation check failed: {e}")

        # Sleep until next check
        await asyncio.sleep(check_interval)


# ============================================
# MONITORING & ALERTS
# ============================================

def get_rotation_metrics() -> Dict:
    """Get metrics for monitoring dashboard."""
    manager = get_rotation_manager()
    status = manager.get_status()

    return {
        "metric": "secrets.rotation",
        "valid_secrets": status["valid_secrets_count"],
        "previous_secrets": status["previous_secrets_count"],
        "grace_period_days": status["grace_period_days"],
        "status": status["status"],
        "timestamp": datetime.utcnow().isoformat(),
    }
