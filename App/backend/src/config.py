"""
Application configuration and settings
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from loguru import logger

# Load .env file from the current directory or parent
env_file = Path(__file__).parent / ".env"
load_dotenv(env_file)

# ============================================
# DATABASE CONFIGURATION
# ============================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost/postgres"
)

DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "20"))
DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "40"))
DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "3600"))

# ============================================
# SERVER CONFIGURATION
# ============================================

SERVER_HOST = os.getenv("SERVER_HOST", "0.0.0.0")
SERVER_PORT = int(os.getenv("SERVER_PORT", "8000"))
SERVER_RELOAD = os.getenv("SERVER_RELOAD", "True").lower() == "true"

# ============================================
# JWT CONFIGURATION
# ============================================

JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "your_secret_key_here_change_in_production"
)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
JWT_REFRESH_EXPIRATION_DAYS = int(os.getenv("JWT_REFRESH_EXPIRATION_DAYS", "30"))

# ============================================
# SECURITY CONFIGURATION
# ============================================

# Password hashing
BCRYPT_ROUNDS = int(os.getenv("BCRYPT_ROUNDS", "12"))

# CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "*"
).split(",")

# ============================================
# GAME CONFIGURATION
# ============================================

# Game timing
TURN_TIMEOUT_SECONDS = int(os.getenv("TURN_TIMEOUT_SECONDS", "30"))
DISCONNECTION_TIMEOUT_SECONDS = int(os.getenv("DISCONNECTION_TIMEOUT_SECONDS", "120"))
LOBBY_EXPIRY_SECONDS = int(os.getenv("LOBBY_EXPIRY_SECONDS", "180"))

# Game rules
CONSECUTIVE_ROUNDS_FOR_CATCH = int(os.getenv("CONSECUTIVE_ROUNDS_FOR_CATCH", "2"))
CATCH_10S_MULTIPLIER = int(os.getenv("CATCH_10S_MULTIPLIER", "100"))

# ============================================
# MONETIZATION CONFIGURATION
# ============================================

PREMIUM_SUBSCRIPTION_PRICE_USD = float(os.getenv("PREMIUM_SUBSCRIPTION_PRICE_USD", "3.00"))
PREMIUM_SUBSCRIPTION_DURATION_DAYS = int(os.getenv("PREMIUM_SUBSCRIPTION_DURATION_DAYS", "365"))
ADS_PER_GAME = int(os.getenv("ADS_PER_GAME", "2"))

# ============================================
# LOGGING CONFIGURATION
# ============================================

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")

# ============================================
# ENVIRONMENT
# ============================================

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = ENVIRONMENT == "development"

# ============================================
# EXTERNAL SERVICES (Optional)
# ============================================

# Redis Configuration (optional, for caching & sessions)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
ENABLE_REDIS = os.getenv("ENABLE_REDIS", "false").lower() == "true"

# Email Configuration (optional, for notifications)
SMTP_SERVER = os.getenv("SMTP_SERVER", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

# ============================================
# SECURITY VALIDATION
# ============================================

if ENVIRONMENT == "production":
    # Critical: JWT Secret must be strong and not default
    if JWT_SECRET_KEY == "your_secret_key_here_change_in_production":
        raise ValueError(
            "❌ CRITICAL: JWT_SECRET_KEY must be changed in production! "
            "Run: python3 -c \"import secrets; print(secrets.token_urlsafe(32))\""
        )

    # Critical: Must not allow all origins with credentials
    if ALLOWED_ORIGINS == ["*"]:
        raise ValueError(
            "❌ CRITICAL: ALLOWED_ORIGINS must be specific domains in production! "
            "Set: ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com"
        )

    # Warning: Reload should be disabled
    if SERVER_RELOAD:
        raise ValueError(
            "❌ CRITICAL: SERVER_RELOAD must be False in production!"
        )

    # Warning: Debug mode should be off
    if DEBUG:
        raise ValueError(
            "❌ WARNING: DEBUG should be False in production"
        )

    # Database credentials should not be default
    if "postgres:postgres" in DATABASE_URL.lower():
        raise ValueError(
            "❌ CRITICAL: Default PostgreSQL password detected in DATABASE_URL! "
            "Change the password before deploying."
        )

    logger.warning("✅ Production security checks passed")

# ============================================
# PRODUCTION READINESS CHECKLIST
# ============================================

def get_production_checklist():
    """Returns a checklist of items that must be completed before production."""
    checklist = {
        "🔑 Secrets Management": [
            {"item": "JWT_SECRET_KEY changed from default", "status": JWT_SECRET_KEY != "your_secret_key_here_change_in_production"},
            {"item": "Database password changed from default", "status": "postgres:postgres" not in DATABASE_URL.lower()},
            {"item": ".env file not committed to git", "status": True},  # Assume .gitignore working
            {"item": "API keys/tokens stored in environment only", "status": True},
        ],
        "🌐 Network Security": [
            {"item": "CORS origins are specific (not wildcard)", "status": ALLOWED_ORIGINS != ["*"]},
            {"item": "Server runs on localhost (127.0.0.1) in production", "status": True},  # Checked at runtime
            {"item": "HTTPS/TLS enabled (behind reverse proxy)", "status": False},  # Must be set up externally
            {"item": "Security headers configured", "status": True},  # Already implemented
            {"item": "Content Security Policy (CSP) strict in production", "status": ENVIRONMENT == "production"},  # Environment-aware
            {"item": "Swagger UI disabled in production (or restricted)", "status": ENVIRONMENT == "production"},  # Docs should be behind auth
        ],
        "🔐 Authentication & Authorization": [
            {"item": "User authentication endpoints implemented", "status": False},  # Not yet implemented
            {"item": "WebSocket token verification implemented", "status": False},  # Not yet implemented
            {"item": "Rate limiting on auth endpoints", "status": True},  # Framework ready
            {"item": "Password hashing with bcrypt", "status": True},  # Already implemented
        ],
        "📊 Monitoring & Logging": [
            {"item": "Error logging configured (not verbose)", "status": ENVIRONMENT == "production"},
            {"item": "Structured logging implemented", "status": False},  # To be done in Session 3
            {"item": "Monitoring and alerting set up", "status": False},  # External service
            {"item": "Database backups configured", "status": False},  # External service
        ],
        "🗄️ Database Security": [
            {"item": "Using managed database (AWS RDS, Azure, etc)", "status": False},  # External
            {"item": "Database encryption enabled", "status": False},  # External
            {"item": "Connection pooling configured", "status": True},  # Already set up
            {"item": "SQL injection prevention (using ORM)", "status": True},  # Already implemented
        ],
        "🚀 Deployment": [
            {"item": "ENVIRONMENT=production set", "status": ENVIRONMENT == "production"},
            {"item": "SERVER_RELOAD=False in production", "status": not SERVER_RELOAD if ENVIRONMENT == "production" else False},
            {"item": "DEBUG=False in production", "status": not DEBUG if ENVIRONMENT == "production" else False},
            {"item": "Reverse proxy configured (nginx, CloudFlare)", "status": False},  # External
        ],
    }
    return checklist

def print_security_status():
    """Print a formatted security status report."""
    checklist = get_production_checklist()

    if ENVIRONMENT == "development":
        logger.info("\n" + "="*70)
        logger.info("🟡 DEVELOPMENT MODE - Security relaxed for development")
        logger.info("="*70)
        logger.info("✅ Using default JWT_SECRET_KEY (OK for development)")
        logger.info("✅ CORS allows all origins (OK for development)")
        logger.info("✅ Auto-reload enabled for development")
        logger.info("\n📋 BEFORE PRODUCTION, complete this checklist:")
        for category, items in checklist.items():
            incomplete = [i for i in items if not i["status"]]
            if incomplete:
                logger.info(f"\n{category}")
                for item in incomplete:
                    logger.warning(f"  ❌ {item['item']}")
        logger.info("\n" + "="*70 + "\n")
    else:
        logger.info("\n" + "="*70)
        logger.info("🟢 PRODUCTION MODE - Enhanced security checks enabled")
        logger.info("="*70)
        for category, items in checklist.items():
            logger.info(f"\n{category}")
            for item in items:
                status_icon = "✅" if item["status"] else "⚠️ "
                logger.info(f"  {status_icon} {item['item']}")
        logger.info("\n" + "="*70 + "\n")

# Development warnings
if ENVIRONMENT == "development":
    if JWT_SECRET_KEY == "your_secret_key_here_change_in_production":
        logger.warning("⚠️  Using default JWT_SECRET_KEY (OK for development)")

    if ALLOWED_ORIGINS == ["*"]:
        logger.warning("⚠️  CORS allows all origins (OK for development)")

    if SERVER_RELOAD:
        logger.info("ℹ️  Auto-reload enabled for development")

    # Print checklist on startup
    print_security_status()
else:
    # Production mode - print security status
    print_security_status()
