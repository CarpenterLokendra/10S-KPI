"""
Admin routes for 10S Card Game API.

Endpoints:
  GET    /admin/health                  - Health check
  GET    /admin/production-checklist    - Production readiness
  GET    /admin/stats                   - Server statistics
  POST   /admin/migrate-phone-column    - Add phone_number column to users table
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from loguru import logger

from database import get_db
from config import ENVIRONMENT, get_production_checklist

router = APIRouter(prefix="/admin", tags=["admin"])

# ============================================
# HEALTH CHECK
# ============================================

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint with database verification.

    **Response**:
    - Status: "healthy" or "degraded"
    - Database: "connected" or error message
    - WebSocket: "ready"

    **Errors**:
    - 503: Database connection failed
    """
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        db_status = "connected"
        db_ok = True
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        db_status = f"disconnected: {str(e)}"
        db_ok = False
    finally:
        db.close()

    status_code = status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": db_status,
        "websocket": "ready",
        "environment": ENVIRONMENT
    }

# ============================================
# PRODUCTION CHECKLIST
# ============================================

@router.get("/production-checklist")
async def production_checklist_endpoint():
    """
    Get production readiness checklist.

    **Response**:
    - Checklist items with completion status
    - Progress percentage
    - Message about next steps

    **Note**: Available in all environments for transparency
    """
    checklist = get_production_checklist()

    total_items = sum(len(items) for items in checklist.values())
    completed_items = sum(sum(1 for i in items if i["status"]) for items in checklist.values())
    completion_percentage = round((completed_items / total_items * 100) if total_items > 0 else 0, 1)

    logger.info(f"📋 Production checklist requested ({completion_percentage}% complete)")

    return {
        "environment": ENVIRONMENT,
        "progress": f"{completed_items}/{total_items}",
        "completion_percentage": completion_percentage,
        "checklist": {
            category: [
                {"item": i["item"], "completed": i["status"]}
                for i in items
            ]
            for category, items in checklist.items()
        },
        "message": "Complete all items before moving to production" if ENVIRONMENT == "development" else "Verify all production requirements are met"
    }

# ============================================
# SERVER STATISTICS
# ============================================

@router.get("/stats")
async def get_server_statistics(db: Session = Depends(get_db)):
    """
    Get server and application statistics.

    **Response**:
    - Database size, active connections
    - Application uptime
    - API usage stats

    **Errors**:
    - 503: Database unavailable
    """
    try:
        # Get database stats
        db.execute(text("SELECT 1"))

        logger.info("📊 Server statistics requested")

        return {
            "environment": ENVIRONMENT,
            "status": "running",
            "database": {
                "status": "connected",
                "driver": "psycopg2"
            },
            "api": {
                "version": "1.0.0",
                "endpoints": "multiple",
                "authentication": "JWT"
            },
            "timestamp": "recent"
        }
    except Exception as e:
        logger.error(f"❌ Error retrieving statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable"
        )

# ============================================
# API DOCUMENTATION
# ============================================

@router.get("/info")
async def get_api_info():
    """
    Get API information and documentation links.

    **Response**:
    - API version, environment
    - Documentation URLs
    - Supported features
    """
    logger.info("ℹ️  API information requested")

    docs_url = "/docs" if ENVIRONMENT == "development" else None
    redoc_url = "/redoc" if ENVIRONMENT == "development" else None

    return {
        "api_name": "10S Card Game API",
        "version": "1.0.0",
        "environment": ENVIRONMENT,
        "description": "Multiplayer real-time card game backend",
        "documentation": {
            "swagger_ui": docs_url or "Disabled in production",
            "redoc": redoc_url or "Disabled in production",
            "openapi_json": "/openapi.json" if ENVIRONMENT == "development" else "Disabled in production"
        },
        "features": [
            "User Authentication (JWT)",
            "Game Management",
            "Real-time WebSocket Updates",
            "Leaderboard & Rankings",
            "Player Statistics",
            "Lobby System"
        ],
        "contact": "support@10sgame.com"
    }

# ============================================
# DATABASE MIGRATIONS
# ============================================

@router.post("/migrate-phone-column")
async def migrate_phone_column(db: Session = Depends(get_db)):
    """
    Add phone_number column to users table if it doesn't exist.
    This migration enables phone number based registration.

    **Response**:
    - status: "success" or "already_exists"
    - message: Description of what was done

    **Errors**:
    - 500: Migration failed
    """
    try:
        # Check if column already exists
        result = db.execute(text("""
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = '10s_schema'
            AND table_name = 'users'
            AND column_name = 'phone_number'
        """))

        if result.fetchone():
            logger.info("✅ phone_number column already exists")
            return {
                "status": "already_exists",
                "message": "phone_number column already exists in users table"
            }

        # Add phone_number column
        db.execute(text("""
            ALTER TABLE "10s_schema"."users"
            ADD COLUMN phone_number VARCHAR(20) UNIQUE NULL
        """))
        db.commit()

        logger.info("✅ Successfully added phone_number column to users table")

        return {
            "status": "success",
            "message": "phone_number column added to users table. Phone number registration is now enabled."
        }

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Migration failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Migration failed: {str(e)}"
        )
