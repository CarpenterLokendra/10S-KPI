"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
from .game_constants import GameStatus, PlayerStatus, GameType, AuthMethod

# ============================================
# USER SCHEMAS
# ============================================

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    auth_method: AuthMethod = AuthMethod.EMAIL

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    password: str
    auth_method: AuthMethod = AuthMethod.EMAIL

class UserLogin(BaseModel):
    username: str = Field(..., description="Username, email, or phone number")
    password: str = Field(..., description="User password")

class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    is_premium: bool
    total_games: int
    total_wins: int
    rating: float
    created_at: datetime
    last_login: Optional[datetime] = None
    auth_method: AuthMethod = AuthMethod.EMAIL

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    email: Optional[EmailStr] = None

# ============================================
# PLAYER STATISTICS SCHEMAS
# ============================================

class PlayerStatisticsResponse(BaseModel):
    user_id: str
    total_games_played: int
    total_games_won: int
    total_games_lost: int
    total_points_scored: int
    average_points_per_game: float
    tens_caught: int
    win_rate: float
    rating: float
    rank: int

    class Config:
        from_attributes = True

# ============================================
# LOBBY SCHEMAS
# ============================================

class LobbyCreate(BaseModel):
    max_players: int = Field(default=5, ge=2, le=5)
    game_type: GameType = GameType.LOBBY
    is_private: bool = False

class LobbyResponse(BaseModel):
    id: str
    code: str
    creator_id: str
    status: str
    max_players: int
    current_players: int
    game_type: GameType
    is_private: bool
    created_at: datetime

    class Config:
        from_attributes = True

class LobbyJoin(BaseModel):
    code: str = Field(..., min_length=6, max_length=6)

# ============================================
# GAME SCHEMAS
# ============================================

class GameCreate(BaseModel):
    game_type: GameType = GameType.BOT
    num_players: Optional[int] = None
    lobby_id: Optional[str] = None

    @field_validator('game_type', mode='before')
    @classmethod
    def convert_game_type(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class GameResponse(BaseModel):
    id: str
    creator_id: str
    status: GameStatus
    game_type: GameType
    num_players: int
    current_round: int
    current_led_suit: Optional[str] = None
    current_trump_suit: Optional[str] = None
    winner_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class GamePlayerResponse(BaseModel):
    id: str
    game_id: str
    user_id: str
    player_position: int
    status: PlayerStatus
    final_score: int
    joined_at: datetime

    class Config:
        from_attributes = True

# ============================================
# GAME ACTION SCHEMAS
# ============================================

class CardPlay(BaseModel):
    card_value: int = Field(..., ge=2, le=14)
    card_suit: str = Field(..., pattern="^(spades|hearts|diamonds|clubs)$")
    timestamp: datetime

class ChatMessageCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)

class ChatMessageResponse(BaseModel):
    id: str
    game_id: str
    user_id: str
    message: str
    message_type: str
    created_at: datetime

    class Config:
        from_attributes = True

# ============================================
# AUTHENTICATION SCHEMAS
# ============================================

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    token: str = Field(..., description="Current JWT token to refresh")

class TokenData(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    exp: Optional[int] = None

# ============================================
# LEADERBOARD SCHEMAS
# ============================================

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    username: str
    rating: float
    total_wins: int
    total_games: int
    win_rate: float

    class Config:
        from_attributes = True

# ============================================
# ERROR SCHEMAS
# ============================================

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# HEALTH CHECK SCHEMAS
# ============================================

class HealthCheck(BaseModel):
    status: str
    database: str
    websocket: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
