"""
10S Card Game - Backend API
Main FastAPI application
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from loguru import logger
from sqlalchemy.orm import Session
from sqlalchemy import text

# Setup logging (must be imported before any logging calls)
from logging_config import log_startup_info

# Security: Rate limiting
try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    RATE_LIMITING_ENABLED = True
except ImportError:
    RATE_LIMITING_ENABLED = False
    logger.warning("slowapi not installed - rate limiting disabled. Install with: pip install slowapi")

# Load environment variables
load_dotenv()

# Import database and models
from database import engine, SessionLocal, init_db, Base
import models
from config import ENVIRONMENT, ALLOWED_ORIGINS, SERVER_HOST, SERVER_PORT, SERVER_RELOAD, print_security_status

# Import route modules
from routes import auth, users, lobbies, games, leaderboard, admin

# Initialize FastAPI app
# Disable docs in production for security (reduces attack surface)
app = FastAPI(
    title="10S Card Game API",
    description="Multiplayer card game backend",
    version="1.0.0",
    docs_url="/docs" if ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if ENVIRONMENT == "development" else None,
    openapi_url="/openapi.json" if ENVIRONMENT == "development" else None,
)

# Rate Limiting Setup (protects against DDoS, brute force attacks)
if RATE_LIMITING_ENABLED:
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    logger.info("✅ Rate limiting enabled")
else:
    logger.warning("⚠️  Rate limiting disabled - install slowapi for protection")

# ============================================
# REGISTER ROUTE MODULES
# ============================================

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(lobbies.router)
app.include_router(games.router)
app.include_router(leaderboard.router)
app.include_router(admin.router)

logger.info("✅ All route modules registered")

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("Initializing database...")
    try:
        init_db()
        logger.info("✅ Database schema and tables created successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {str(e)}")

    # Log startup information
    log_startup_info(SERVER_HOST, SERVER_PORT, ENVIRONMENT)

# Security Middleware - Trusted Host
# Allow localhost for development, specific domains for production
trusted_hosts = ["localhost", "127.0.0.1"]
if ENVIRONMENT == "production":
    # In production, extract hostnames from ALLOWED_ORIGINS
    trusted_hosts.extend([origin.replace("https://", "").replace("http://", "") for origin in ALLOWED_ORIGINS])

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=trusted_hosts
)

# CORS Configuration - Secure by default
cors_origins = ["*"] if ENVIRONMENT == "development" else ALLOWED_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600,
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)

    # Prevent clickjacking
    response.headers["X-Frame-Options"] = "DENY"

    # Prevent MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"

    # Enable XSS protection
    response.headers["X-XSS-Protection"] = "1; mode=block"

    # Content Security Policy
    # Development: Allow inline scripts for Swagger UI
    # Production: Strict policy
    if ENVIRONMENT == "development":
        response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:"
    else:
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"

    # HTTPS enforcement (in production)
    if ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # Referrer Policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # Remove server info
    response.headers["Server"] = "GameAPI"

    return response

# ============================================
# TEMPORARY ROUTES (TO BE REPLACED)
# ============================================
# API ENDPOINTS - Organized in routes/ modules
# ============================================
# Authentication:  /auth/*      (routes/auth.py)
# Users:           /users/*     (routes/users.py)
# Lobbies:         /lobbies/*   (routes/lobbies.py)
# Games:           /games/*     (routes/games.py)
# Leaderboard:     /leaderboard/*  (routes/leaderboard.py)
# Admin:           /admin/*     (routes/admin.py)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "message": "10S Card Game API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs" if ENVIRONMENT == "development" else "Disabled in production",
        "admin": "/admin/info"
    }

# ============================================
# WEBSOCKET ENDPOINT (REAL-TIME UPDATES)
# ============================================

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}
    
    async def connect(self, game_id: str, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if game_id not in self.active_connections:
            self.active_connections[game_id] = {}
        self.active_connections[game_id][user_id] = websocket
        logger.info(f"User {user_id} connected to game {game_id}")
    
    def disconnect(self, game_id: str, user_id: str):
        if game_id in self.active_connections:
            self.active_connections[game_id].pop(user_id, None)
        logger.info(f"User {user_id} disconnected from game {game_id}")
    
    async def broadcast(self, game_id: str, message: dict, exclude_user: str = None):
        if game_id in self.active_connections:
            for user_id, connection in self.active_connections[game_id].items():
                if exclude_user and user_id == exclude_user:
                    continue
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to {user_id}: {str(e)}")

manager = ConnectionManager()

@app.websocket("/ws/{game_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str, user_id: str):
    """
    WebSocket endpoint for real-time game updates

    ⚠️ SECURITY: This endpoint requires authentication to be implemented
    Current placeholder - accepts any user_id
    TODO: Implement JWT token verification

    Usage:
    ws://localhost:8000/ws/{game_id}/{user_id}?token=<jwt_token>

    Required for production:
    1. Validate JWT token from query parameter
    2. Verify user_id matches token claims
    3. Verify user has access to this game_id
    4. Rate limit connections per user
    """
    # TODO: Add authentication verification
    # from jose import jwt
    # token = websocket.query_params.get("token")
    # user_id_from_token = verify_jwt_token(token)
    # if user_id != user_id_from_token:
    #     await websocket.close(code=4001, reason="Unauthorized")
    #     return

    await manager.connect(game_id, user_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Handle different message types
            message_type = data.get("type")
            
            if message_type == "play-card":
                # Broadcast card play to all players
                await manager.broadcast(game_id, {
                    "type": "play-notification",
                    "user_id": user_id,
                    "card": data.get("card"),
                    "timestamp": data.get("timestamp")
                })
            
            elif message_type == "chat-message":
                # Broadcast chat message
                await manager.broadcast(game_id, {
                    "type": "chat-message",
                    "user_id": user_id,
                    "message": data.get("message"),
                    "timestamp": data.get("timestamp")
                })
            
            elif message_type == "disconnect":
                # Player disconnecting gracefully
                logger.info(f"User {user_id} gracefully disconnected from game {game_id}")
                break
    
    except WebSocketDisconnect:
        manager.disconnect(game_id, user_id)
        # Notify other players
        await manager.broadcast(game_id, {
            "type": "player-disconnected",
            "user_id": user_id,
            "timestamp": None
        })
    
    except Exception as e:
        logger.error(f"WebSocket error for {user_id} in game {game_id}: {str(e)}")
        manager.disconnect(game_id, user_id)

# ============================================
# ERROR HANDLERS
# ============================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler - sanitizes error messages
    In production: generic error message
    In development: detailed error information
    """
    error_id = os.urandom(4).hex()  # Unique error ID for support team

    # Always log the full error for debugging
    logger.error(
        f"Unhandled exception [{error_id}]",
        exc_info=True,
        extra={"error_type": type(exc).__name__}
    )

    # Return different responses based on environment
    if ENVIRONMENT == "production":
        # Never expose details in production
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An internal error occurred",
                "error_id": error_id  # For support tickets
            }
        )
    else:
        # Development: show details for debugging
        return JSONResponse(
            status_code=500,
            content={
                "detail": str(exc),
                "type": type(exc).__name__,
                "error_id": error_id
            }
        )

# ============================================
# PLACEHOLDER ROUTE INCLUDES
# ============================================

# When you have the route modules ready, uncomment:
# app.include_router(auth.router, prefix="/auth", tags=["authentication"])
# app.include_router(game.router, prefix="/games", tags=["games"])
# app.include_router(lobby.router, prefix="/lobbies", tags=["lobbies"])
# app.include_router(stats.router, prefix="/stats", tags=["statistics"])
# app.include_router(ads.router, prefix="/ads", tags=["ads"])

if __name__ == "__main__":
    import uvicorn
    from config import LOG_LEVEL

    # Security: Different configuration for development vs production
    if ENVIRONMENT == "production":
        # Production: NO reload, restricted host, HTTPS behind proxy
        host = "127.0.0.1"
        reload = False
        ssl_keyfile = None
        ssl_certfile = None
        workers = 4  # Use multiple workers in production
    else:
        # Development: Reload enabled for faster iteration
        host = SERVER_HOST
        reload = SERVER_RELOAD
        ssl_keyfile = None
        ssl_certfile = None
        workers = 1

    logger.info(f"Starting 10S Card Game API - Environment: {ENVIRONMENT}")
    logger.info(f"Server: {host}:{SERVER_PORT} (reload={reload})")
    logger.info(f"CORS Origins: {cors_origins}")

    uvicorn.run(
        "main:app",
        host=host,
        port=SERVER_PORT,
        reload=reload,
        log_level=LOG_LEVEL.lower(),
        access_log=ENVIRONMENT == "development"  # Only log access in dev
    )
