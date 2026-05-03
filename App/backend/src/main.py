"""
10S Card Game - Backend API
Main FastAPI application
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import os
import asyncio
from dotenv import load_dotenv
from loguru import logger
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.orm.attributes import flag_modified
from datetime import datetime

# Setup logging (must be imported before any logging calls)
from .logging_config import log_startup_info

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
from .database import engine, SessionLocal, init_db, Base
from . import models
from .config import ENVIRONMENT, ALLOWED_ORIGINS, SERVER_HOST, SERVER_PORT, SERVER_RELOAD, print_security_status

# Import route modules
from .routes import auth, users, lobbies, games, leaderboard, admin

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
trusted_hosts = ["localhost", "127.0.0.1", "192.168.29.254"]
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
            logger.info(f"📢 Broadcasting {message.get('type')} to {len(self.active_connections[game_id])} players in game {game_id}")
            for user_id, connection in self.active_connections[game_id].items():
                if exclude_user and user_id == exclude_user:
                    logger.info(f"   ⏭️ Excluding {user_id}")
                    continue
                try:
                    await connection.send_json(message)
                    logger.info(f"   ✅ Sent to {user_id}")
                except Exception as e:
                    logger.error(f"   ❌ Error sending message to {user_id}: {str(e)}")
        else:
            logger.warning(f"⚠️ No active connections for game {game_id}")

manager = ConnectionManager()

# Game timeout tracking (20 minutes = 1200 seconds)
GAME_TIMEOUT_SECONDS = 20 * 60  # 20 minutes
game_timeout_tasks = {}

async def handle_game_timeout(game_id: str):
    """Handle game timeout - terminate game and redirect all players to lobby"""
    try:
        db = SessionLocal()
        game = db.query(models.Game).filter(models.Game.id == game_id).first()

        if game and game.status != "ENDED":
            logger.warning(f"⏰ GAME TIMEOUT: Game {game_id} exceeded 20 minutes")

            lobby_id = game.lobby_id

            # Mark game as ended
            game.status = "ENDED"
            game.end_time = datetime.utcnow()
            db.commit()
            logger.info(f"   ✅ Game marked as ENDED")

            # Broadcast timeout message to all players
            logger.info(f"   📢 Broadcasting game-timeout to all players...")
            await manager.broadcast(game_id, {
                "type": "game-timeout",
                "message": "Game timeout: No moves made for 20 minutes",
                "lobby_id": lobby_id,
                "timestamp": datetime.utcnow().isoformat()
            })

            logger.info(f"✅ All players notified of timeout. Redirecting to lobby {lobby_id}")

        db.close()
    except Exception as e:
        logger.error(f"❌ Error handling game timeout: {str(e)}", exc_info=True)
    finally:
        # Clean up the timeout task
        if game_id in game_timeout_tasks:
            del game_timeout_tasks[game_id]

async def schedule_game_timeout(game_id: str):
    """Schedule a timeout check for a game (20 minutes)"""
    logger.info(f"⏰ Scheduling 20-minute timeout for game {game_id}")

    # Cancel any existing timeout for this game
    if game_id in game_timeout_tasks:
        game_timeout_tasks[game_id].cancel()

    # Create a new timeout task
    async def timeout_callback():
        await asyncio.sleep(GAME_TIMEOUT_SECONDS)
        await handle_game_timeout(game_id)

    import asyncio
    task = asyncio.create_task(timeout_callback())
    game_timeout_tasks[game_id] = task

async def handle_game_disconnect(game_id: str, user_id: str):
    """Handle game cancellation when a player disconnects/quits"""
    try:
        db = SessionLocal()
        game = db.query(models.Game).filter(models.Game.id == game_id).first()
        logger.info(f"🎮 Looking up game {game_id}, found: {game is not None}")

        if game:
            lobby_id = game.lobby_id
            logger.info(f"   Lobby ID: {lobby_id}")

            # Get the disconnected player's username
            disconnected_user = db.query(models.User).filter(models.User.id == user_id).first()
            username = disconnected_user.username if disconnected_user else "Unknown Player"

            logger.warning(f"⚠️ Game {game_id} stopped because player {username} ({user_id}) disconnected")

            # Update game status to ended
            game.status = "ENDED"
            game.end_time = datetime.utcnow()
            db.commit()
            logger.info(f"   ✅ Game status updated to ENDED")

            # Notify all players that game was cancelled
            logger.info(f"   📢 Broadcasting game-cancelled to all players...")
            await manager.broadcast(game_id, {
                "type": "game-cancelled",
                "username": username,
                "lobby_id": lobby_id,
                "timestamp": datetime.utcnow().isoformat()
            })

            logger.info(f"✅ All players notified. {username} left. Redirecting to lobby {lobby_id}")
        else:
            logger.warning(f"⚠️ Game {game_id} not found when processing disconnect")

        db.close()
    except Exception as e:
        logger.error(f"❌ Error handling disconnect: {str(e)}", exc_info=True)

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
        # Schedule game timeout if not already scheduled
        if game_id not in game_timeout_tasks:
            await schedule_game_timeout(game_id)

        # Fetch game and player data from database
        db = SessionLocal()
        try:
            logger.info(f"🔍 WebSocket: User {user_id} connected to game {game_id}")

            game = db.query(models.Game).filter(models.Game.id == game_id).first()
            logger.info(f"   Game found: {game is not None}")

            if game:
                logger.info(f"   Game status: {game.status}, Num players: {game.num_players}")

                # Check if game has ended - if so, redirect player to lobby
                if game.status == "ENDED":
                    logger.warning(f"⚠️ Game {game_id} has ended. Sending game-cancelled to player {user_id}")
                    await websocket.send_json({
                        "type": "game-cancelled",
                        "username": "Game ended",
                        "lobby_id": game.lobby_id,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    manager.disconnect(game_id, user_id)
                    logger.info(f"✅ Game-cancelled sent to {user_id}")
                    # Return early to close the connection
                    return

                # Get all players in this game
                game_players_db = db.query(models.GamePlayer).filter(
                    models.GamePlayer.game_id == game_id
                ).all()

                logger.info(f"   GamePlayer records found: {len(game_players_db)}")

                game_players = []
                for i, gp in enumerate(game_players_db):
                    user = db.query(models.User).filter(models.User.id == gp.user_id).first()
                    logger.info(f"   Player {i}: user_id={gp.user_id}, found={user is not None}, username={user.username if user else 'N/A'}")

                    if user:
                        player_obj = {
                            "id": user.id,
                            "username": user.username,
                            "position": len(game_players),  # Sequential position
                            "status": "active",
                            "handSize": 0,
                            "score": 0,
                            "caughtTens": [],
                            "isYourTurn": False,
                            "avatar_url": user.avatar_url
                        }
                        game_players.append(player_obj)
                        logger.info(f"      Added: {player_obj['username']}")

                # Fetch this player's hand from database
                my_game_player = db.query(models.GamePlayer).filter_by(game_id=game_id, user_id=user_id).first()
                my_hand = my_game_player.hand or [] if my_game_player else []

                # Get current turn from game_state
                game_state = game.game_state or {}
                current_turn = game_state.get("current_turn")

                # Send initial game state to the newly connected player
                logger.info(f"✅ Sending game-state message with {len(game_players)} players to {user_id}")
                logger.info(f"✅ Player hand: {len(my_hand)} cards, current_turn: {current_turn}")
                await websocket.send_json({
                    "type": "game-state",
                    "players": game_players,
                    "current_turn": current_turn,
                    "trump_suit": game.current_trump_suit,
                    "led_suit": game.current_led_suit,
                    "hand": my_hand
                })
                logger.info(f"✅ Game state sent successfully")
            else:
                logger.warning(f"❌ Game {game_id} not found in database")
        except Exception as e:
            logger.error(f"❌ Error fetching game state: {str(e)}", exc_info=True)
        finally:
            db.close()

        while True:
            data = await websocket.receive_json()
            
            # Handle different message types
            message_type = data.get("type")
            
            if message_type == "play-card":
                logger.info(f"♠️ Card played by {user_id}")

                card_data = data.get("card")
                played_suit = card_data.get("suit") if card_data else None

                # Broadcast card play to all players
                await manager.broadcast(game_id, {
                    "type": "play-notification",
                    "user_id": user_id,
                    "card": card_data,
                    "timestamp": data.get("timestamp")
                })

                # Remove played card from player's hand
                try:
                    db_temp = SessionLocal()
                    gp = db_temp.query(models.GamePlayer).filter(
                        models.GamePlayer.game_id == game_id,
                        models.GamePlayer.user_id == user_id
                    ).first()
                    if gp and gp.hand:
                        # Find and remove the card
                        for i, card in enumerate(gp.hand):
                            if card["suit"] == card_data.get("suit") and card["value"] == card_data.get("value"):
                                gp.hand.pop(i)
                                # Mark the JSON field as modified so SQLAlchemy detects the change
                                flag_modified(gp, "hand")
                                db_temp.commit()
                                logger.info(f"   ✅ Removed {card_data['value']} of {card_data['suit']} from {user_id}'s hand, {len(gp.hand)} cards remaining")
                                break
                    db_temp.close()
                except Exception as e:
                    logger.error(f"❌ Error removing card from hand: {str(e)}", exc_info=True)

                # Update turn to next player
                try:
                    db = SessionLocal()
                    game = db.query(models.Game).filter(models.Game.id == game_id).first()

                    if game:
                        # Set led_suit if this is the first card (no led_suit yet)
                        if not game.current_led_suit and played_suit:
                            game.current_led_suit = played_suit
                            logger.info(f"📍 Led suit set to {played_suit}")

                        # Set trump_suit if player plays a card that's not the led_suit
                        if game.current_led_suit and played_suit and played_suit != game.current_led_suit and not game.current_trump_suit:
                            game.current_trump_suit = played_suit
                            logger.info(f"🎯 Trump suit set to {played_suit}")

                        # Get all players in order
                        game_players_db = db.query(models.GamePlayer).filter(
                            models.GamePlayer.game_id == game_id
                        ).order_by(models.GamePlayer.player_position).all()

                        if game_players_db:
                            # Find current player's position
                            current_pos = next((gp.player_position for gp in game_players_db if gp.user_id == user_id), None)

                            if current_pos is not None:
                                # Track cards played this round
                                game_state = game.game_state or {}
                                cards_played_this_round = game_state.get("cards_played_this_round", [])
                                cards_played_this_round.append({"user_id": user_id, "suit": played_suit})
                                game_state["cards_played_this_round"] = cards_played_this_round

                                num_players = len(game_players_db)
                                round_complete = len(cards_played_this_round) >= num_players

                                if round_complete:
                                    logger.info(f"✅ Round complete! {num_players} cards played")

                                    # Check if trump was just decided this round and this is the first round after trump
                                    trump_just_decided = game.current_trump_suit and not game_state.get("trump_decided_and_dealt", False)

                                    if trump_just_decided:
                                        logger.info(f"🎯 Trump decided! Distributing all remaining cards equally to all players...")

                                        # Distribute ALL remaining cards equally
                                        from ..game_rules import Card
                                        remaining_deck = game_state.get("deck", [])

                                        # Convert dict cards back to Card objects for dealing
                                        deck_cards = [Card(suit=c["suit"], value=c["value"]) for c in remaining_deck]

                                        cards_per_player = len(deck_cards) // num_players
                                        remainder = len(deck_cards) % num_players

                                        logger.info(f"📊 Distributing {len(deck_cards)} cards: {cards_per_player} cards each, {remainder} remainder")

                                        deck_index = 0
                                        for i, player in enumerate(game_players_db):
                                            player.hand = player.hand or []
                                            # Give extra cards to first players if there's a remainder
                                            extra_card = 1 if i < remainder else 0
                                            cards_to_deal = cards_per_player + extra_card

                                            for _ in range(cards_to_deal):
                                                if deck_index < len(deck_cards):
                                                    card = deck_cards[deck_index]
                                                    player.hand.append({
                                                        "suit": card.suit.value,
                                                        "value": card.value
                                                    })
                                                    deck_index += 1

                                            # Mark the hand as modified so SQLAlchemy detects the JSON change
                                            flag_modified(player, "hand")
                                            logger.info(f"   ✅ Dealt {cards_to_deal} cards to player {player.user_id} (now {len(player.hand)} cards)")

                                        # Mark that trump has been decided and all remaining cards distributed
                                        game_state["trump_decided_and_dealt"] = True
                                        game_state["deck"] = []  # No more cards in deck
                                        logger.info(f"✅ All cards distributed! Deck is now empty")
                                    else:
                                        logger.info(f"ℹ️ Round complete but trump not yet decided, no card distribution")

                                    game_state["cards_played_this_round"] = []

                                    # Calculate next player for new round
                                    next_pos = (current_pos + 1) % num_players
                                else:
                                    # Normal turn rotation
                                    next_pos = (current_pos + 1) % num_players

                                next_player_id = game_players_db[next_pos].user_id
                                game_state["current_turn"] = next_player_id
                                game.game_state = game_state
                                db.commit()

                                logger.info(f"🔄 Turn switched to player {next_player_id}")

                                # Send updated game state to all players
                                updated_players = []
                                for gp in game_players_db:
                                    user_obj = db.query(models.User).filter(models.User.id == gp.user_id).first()
                                    if user_obj:
                                        updated_players.append({
                                            "id": user_obj.id,
                                            "username": user_obj.username,
                                            "position": gp.player_position,
                                            "status": "active",
                                            "handSize": len(gp.hand) if gp.hand else 0,
                                            "score": 0,
                                            "caughtTens": [],
                                            "isYourTurn": user_obj.id == next_player_id,
                                            "avatar_url": user_obj.avatar_url
                                        })

                                await manager.broadcast(game_id, {
                                    "type": "game-state",
                                    "players": updated_players,
                                    "current_turn": next_player_id,
                                    "trump_suit": game.current_trump_suit,
                                    "led_suit": game.current_led_suit
                                })

                                # If cards were distributed, send each player their updated hand
                                if round_complete:
                                    logger.info(f"📤 Sending updated hands to all players after round completion")
                                    for gp in game_players_db:
                                        if gp.user_id in manager.active_connections.get(game_id, {}):
                                            try:
                                                await manager.active_connections[game_id][gp.user_id].send_json({
                                                    "type": "hand-update",
                                                    "hand": gp.hand or []
                                                })
                                                logger.info(f"   ✅ Sent hand update to {gp.user_id}")
                                            except Exception as e:
                                                logger.error(f"   ❌ Failed to send hand update to {gp.user_id}: {str(e)}")
                    db.close()
                except Exception as e:
                    logger.error(f"❌ Error updating turn: {str(e)}", exc_info=True)
            
            elif message_type == "chat-message":
                # Broadcast chat message
                logger.info(f"💬 [CHAT] User {user_id} sent: {data.get('message')}")
                logger.info(f"💬 [CHAT] Broadcasting to {len(manager.active_connections.get(game_id, []))} players in game {game_id}")
                await manager.broadcast(game_id, {
                    "type": "chat-message",
                    "user_id": user_id,
                    "message": data.get("message"),
                    "timestamp": data.get("timestamp")
                })
                logger.info(f"✅ [CHAT] Message broadcasted")
            
            elif message_type == "disconnect":
                # Player quitting the game - stop game for everyone
                logger.info(f"⏹️ User {user_id} is quitting game {game_id}")
                # Broadcast game cancelled BEFORE disconnecting so other players receive it
                await handle_game_disconnect(game_id, user_id)
                # Now remove from active connections
                manager.disconnect(game_id, user_id)
                break
    
    except WebSocketDisconnect:
        manager.disconnect(game_id, user_id)
        logger.info(f"🔌 WebSocket disconnected for user {user_id} in game {game_id}")
        await handle_game_disconnect(game_id, user_id)
    
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
