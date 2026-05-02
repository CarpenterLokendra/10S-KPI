"""
Loguru logging configuration for 10S Card Game API.

Provides:
- Colored console output for development
- Structured JSON logs for production
- Automatic log rotation
- Exception tracking
- Performance monitoring
"""

import sys
from pathlib import Path
from loguru import logger
import os

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Remove default handler
logger.remove()

# ============================================
# CONSOLE OUTPUT
# ============================================

if ENVIRONMENT == "development":
    # Development: Colorful, detailed output
    logger.add(
        sys.stdout,
        format="<level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=LOG_LEVEL,
        colorize=True,
        backtrace=True,
        diagnose=True,
    )
else:
    # Production: Structured JSON logs
    logger.add(
        sys.stdout,
        format="{message}",
        level=LOG_LEVEL,
        serialize=True,  # JSON format
        backtrace=False,
        diagnose=False,
    )

# ============================================
# FILE LOGGING
# ============================================

# Create logs directory if it doesn't exist
logs_dir = Path(__file__).parent.parent / "logs"
logs_dir.mkdir(exist_ok=True)

# Application logs
logger.add(
    logs_dir / "app.log",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}",
    level="DEBUG",
    rotation="500 MB",  # Rotate when file reaches 500 MB
    retention="7 days",  # Keep logs for 7 days
    compression="zip",  # Compress old logs
)

# Error logs (separate file for easier debugging)
logger.add(
    logs_dir / "error.log",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}",
    level="ERROR",
    rotation="500 MB",
    retention="30 days",  # Keep error logs longer
    compression="zip",
)

# ============================================
# EXCEPTION HANDLING
# ============================================

def setup_exception_logging():
    """Configure exception logging to loguru."""
    def exception_handler(exc_type, exc_value, exc_traceback):
        if issubclass(exc_type, KeyboardInterrupt):
            sys.__excepthook__(exc_type, exc_value, exc_traceback)
            return

        logger.error(
            "Uncaught exception",
            exc_info=(exc_type, exc_value, exc_traceback),
        )

    sys.excepthook = exception_handler


# ============================================
# STARTUP MESSAGE
# ============================================

def log_startup_info(host: str, port: int, environment: str):
    """Log startup information."""
    logger.info("=" * 70)
    logger.info(f"🚀 10S Card Game API Starting")
    logger.info(f"🌍 Environment: {environment}")
    logger.info(f"📍 Server: {host}:{port}")
    logger.info(f"📊 Log Level: {LOG_LEVEL}")
    logger.info(f"📁 Log Files: {logs_dir}/")
    logger.info("=" * 70)


# Initialize exception handling
setup_exception_logging()
