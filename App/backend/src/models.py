"""
Database models for 10S Card Game - Uses 10s_schema
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, ForeignKey, Text, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .database import Base
from .game_constants import (
    GameStatus, PlayerStatus, GameType, LobbyStatus,
    AuthMethod, BotDifficulty, AdType
)

# Custom schema for all 10S tables
SCHEMA = "10s_schema"

# ============================================
# USER & AUTHENTICATION MODELS
# ============================================

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": SCHEMA}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    phone_number = Column(String(20), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)
    auth_method = Column(Enum(AuthMethod), default=AuthMethod.EMAIL)

    # Profile
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    premium_expiry = Column(DateTime, nullable=True)

    # Stats
    total_games = Column(Integer, default=0)
    total_wins = Column(Integer, default=0)
    total_points = Column(Integer, default=0)
    rating = Column(Float, default=1000.0)  # ELO rating

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    games = relationship("Game", back_populates="creator", foreign_keys="Game.creator_id")
    player_records = relationship("GamePlayer", back_populates="user")
    messages = relationship("ChatMessage", back_populates="user")
    statistics = relationship("PlayerStatistics", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User {self.username}>"

class PlayerStatistics(Base):
    __tablename__ = "player_statistics"
    __table_args__ = {"schema": SCHEMA}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey(f"{SCHEMA}.users.id"), nullable=False, unique=True)

    total_games_played = Column(Integer, default=0)
    total_games_won = Column(Integer, default=0)
    total_games_lost = Column(Integer, default=0)
    total_points_scored = Column(Integer, default=0)
    average_points_per_game = Column(Float, default=0.0)
    tens_caught = Column(Integer, default=0)

    win_rate = Column(Float, default=0.0)
    rating = Column(Float, default=1000.0)
    rank = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="statistics")

    def __repr__(self):
        return f"<PlayerStatistics user_id={self.user_id}>"

# ============================================
# GAME & LOBBY MODELS
# ============================================

class Lobby(Base):
    __tablename__ = "lobbies"
    __table_args__ = {"schema": SCHEMA}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(6), unique=True, nullable=False, index=True)
    creator_id = Column(String, ForeignKey(f"{SCHEMA}.users.id"), nullable=False)

    status = Column(Enum(LobbyStatus), default=LobbyStatus.WAITING)
    max_players = Column(Integer, default=5)
    current_players = Column(Integer, default=0)

    game_type = Column(Enum(GameType), default=GameType.LOBBY)
    is_private = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    games = relationship("Game", back_populates="lobby")
    creator = relationship("User", foreign_keys=[creator_id])

    def __repr__(self):
        return f"<Lobby {self.code}>"

class LobbyPlayer(Base):
    __tablename__ = "lobby_players"
    __table_args__ = (
        UniqueConstraint("lobby_id", "user_id", name="uq_lobby_user"),
        {"schema": SCHEMA},
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    lobby_id = Column(String, ForeignKey(f"{SCHEMA}.lobbies.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey(f"{SCHEMA}.users.id"), nullable=False, index=True)

    status = Column(Enum(PlayerStatus), default=PlayerStatus.ACTIVE)
    joined_at = Column(DateTime, default=datetime.utcnow)
    left_at = Column(DateTime, nullable=True)

    # Relationships
    lobby = relationship("Lobby")
    user = relationship("User")

    def __repr__(self):
        return f"<LobbyPlayer lobby_id={self.lobby_id} user_id={self.user_id}>"

class Game(Base):
    __tablename__ = "games"
    __table_args__ = {"schema": SCHEMA}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    lobby_id = Column(String, ForeignKey(f"{SCHEMA}.lobbies.id"), nullable=True)
    creator_id = Column(String, ForeignKey(f"{SCHEMA}.users.id"), nullable=False)

    status = Column(Enum(GameStatus), default=GameStatus.WAITING, index=True)
    game_type = Column(Enum(GameType), default=GameType.LOBBY)

    num_players = Column(Integer, default=0)
    current_round = Column(Integer, default=0)
    current_led_suit = Column(String(20), nullable=True)
    current_trump_suit = Column(String(20), nullable=True)

    game_state = Column(JSON, nullable=True)

    winner_id = Column(String, ForeignKey(f"{SCHEMA}.users.id"), nullable=True)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    lobby = relationship("Lobby", back_populates="games")
    creator = relationship("User", foreign_keys=[creator_id], back_populates="games")
    players = relationship("GamePlayer", back_populates="game", cascade="all, delete-orphan")
    rounds = relationship("Round", back_populates="game", cascade="all, delete-orphan")
    messages = relationship("ChatMessage", back_populates="game", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Game {self.id}>"

class GamePlayer(Base):
    __tablename__ = "game_players"
    __table_args__ = {"schema": SCHEMA}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id = Column(String, ForeignKey(f"{SCHEMA}.games.id"), nullable=False)
    user_id = Column(String, ForeignKey(f"{SCHEMA}.users.id"), nullable=False)

    player_position = Column(Integer, nullable=False)
    status = Column(Enum(PlayerStatus), default=PlayerStatus.ACTIVE)

    hand = Column(JSON, nullable=True)  # Store hand as JSON
    caught_10s = Column(JSON, nullable=True)  # Store caught 10s as JSON
    final_score = Column(Integer, default=0)

    joined_at = Column(DateTime, default=datetime.utcnow)
    left_at = Column(DateTime, nullable=True)
    disconnected_at = Column(DateTime, nullable=True)

    # Relationships
    game = relationship("Game", back_populates="players")
    user = relationship("User", back_populates="player_records")

    def __repr__(self):
        return f"<GamePlayer game_id={self.game_id} user_id={self.user_id}>"

class Round(Base):
    __tablename__ = "rounds"
    __table_args__ = {"schema": SCHEMA}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id = Column(String, ForeignKey(f"{SCHEMA}.games.id"), nullable=False)

    round_number = Column(Integer, nullable=False)
    led_suit = Column(String(20), nullable=False)
    trump_suit = Column(String(20), nullable=True)

    plays = Column(JSON, nullable=True)  # Store plays as JSON
    winner_id = Column(String, nullable=True)
    winning_card = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    game = relationship("Game", back_populates="rounds")

    def __repr__(self):
        return f"<Round game_id={self.game_id} round_number={self.round_number}>"

# ============================================
# CHAT & COMMUNICATION MODELS
# ============================================

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = {"schema": SCHEMA}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id = Column(String, ForeignKey(f"{SCHEMA}.games.id"), nullable=False)
    user_id = Column(String, ForeignKey(f"{SCHEMA}.users.id"), nullable=False)

    message = Column(Text, nullable=False)
    message_type = Column(String(20), default="chat")  # 'chat', 'system', 'action'

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    game = relationship("Game", back_populates="messages")
    user = relationship("User", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage game_id={self.game_id} user_id={self.user_id}>"

# ============================================
# MONETIZATION MODELS
# ============================================

class AdServing(Base):
    __tablename__ = "ad_servings"
    __table_args__ = {"schema": SCHEMA}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id = Column(String, ForeignKey(f"{SCHEMA}.games.id"), nullable=False)
    user_id = Column(String, ForeignKey(f"{SCHEMA}.users.id"), nullable=False)

    ad_type = Column(Enum(AdType), nullable=False)
    ad_network = Column(String(100), nullable=True)  # 'google_admob', 'unity_ads', etc.

    is_completed = Column(Boolean, default=False)
    viewed_at = Column(DateTime, nullable=True)
    clicked_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<AdServing game_id={self.game_id} type={self.ad_type}>"

class PremiumSubscription(Base):
    __tablename__ = "premium_subscriptions"
    __table_args__ = {"schema": SCHEMA}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey(f"{SCHEMA}.users.id"), nullable=False, unique=True)

    subscription_tier = Column(String(50), default="basic")
    price_usd = Column(Float, default=3.00)

    is_active = Column(Boolean, default=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

    renewal_enabled = Column(Boolean, default=True)
    last_renewed_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<PremiumSubscription user_id={self.user_id}>"

# ============================================
# GAME BOT MODELS
# ============================================

class Bot(Base):
    __tablename__ = "bots"
    __table_args__ = {"schema": SCHEMA}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False)
    difficulty = Column(Enum(BotDifficulty), default=BotDifficulty.MEDIUM)

    avatar_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)

    win_rate = Column(Float, default=0.5)
    games_played = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Bot {self.name}>"
