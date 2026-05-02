"""
Game Constants for 10S Card Game
"""

from enum import Enum

# ============================================
# CARD VALUES & SUITS
# ============================================

class CardValue(int, Enum):
    """Card values (numerical)"""
    TWO = 2
    THREE = 3
    FOUR = 4
    FIVE = 5
    SIX = 6
    SEVEN = 7
    EIGHT = 8
    NINE = 9
    TEN = 10
    JACK = 11
    QUEEN = 12
    KING = 13
    ACE = 14

class CardSuit(str, Enum):
    """Card suits"""
    SPADES = "spades"
    HEARTS = "hearts"
    DIAMONDS = "diamonds"
    CLUBS = "clubs"

# Card Points (for scoring)
CARD_POINTS = {
    2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
    10: 100,  # 10s are special
    11: 11,   # Jack
    12: 12,   # Queen
    13: 13,   # King
    14: 14    # Ace
}

# ============================================
# GAME CONFIGURATION
# ============================================

# Number of players
MIN_PLAYERS = 3
MAX_PLAYERS = 5

# Cards distribution by player count
CARDS_DISTRIBUTION = {
    3: {"total_cards": 51, "cards_per_player": 17},  # Remove 2 random cards
    4: {"total_cards": 52, "cards_per_player": 13},  # Full deck
    5: {"total_cards": 50, "cards_per_player": 10},  # Remove 2 of clubs
}

# Initial hand size before trump
INITIAL_HAND_SIZE = 5

# ============================================
# GAME TIMING
# ============================================

TURN_TIMEOUT_SECONDS = 30
DISCONNECTION_TIMEOUT_SECONDS = 120  # 2 minutes
LOBBY_EXPIRY_SECONDS = 180  # 3 minutes
MATCHMAKING_TIMEOUT_SECONDS = 30

# ============================================
# GAME RULES
# ============================================

# Special rules for catching 10s
CONSECUTIVE_ROUNDS_FOR_CATCH = 2  # Must win 2 consecutive rounds
CATCH_10S_MULTIPLIER = 100  # 10s worth 100 points

# Bot difficulty levels
class BotDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

# ============================================
# GAME STATES
# ============================================

class GameStatus(str, Enum):
    WAITING = "waiting"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

class PlayerStatus(str, Enum):
    ACTIVE = "active"
    DISCONNECTED = "disconnected"
    ELIMINATED = "eliminated"
    FINISHED = "finished"

class GameType(str, Enum):
    BOT = "bot"
    RANDOM = "random"
    LOBBY = "lobby"

# ============================================
# LOBBY CONFIGURATION
# ============================================

class LobbyStatus(str, Enum):
    WAITING = "waiting"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"

# Lobby code format: 6 alphanumeric characters
LOBBY_CODE_LENGTH = 6

# ============================================
# AUTHENTICATION
# ============================================

class AuthMethod(str, Enum):
    EMAIL = "email"
    PHONE = "phone"
    GOOGLE = "google"
    FACEBOOK = "facebook"
    GUEST = "guest"

# Password requirements
MIN_PASSWORD_LENGTH = 8
REQUIRE_SPECIAL_CHAR = True
REQUIRE_NUMERIC = True

# JWT Configuration
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
JWT_REFRESH_EXPIRATION_DAYS = 30

# ============================================
# MONETIZATION
# ============================================

PREMIUM_SUBSCRIPTION_PRICE_USD = 3.00
PREMIUM_SUBSCRIPTION_DURATION_DAYS = 365

class AdType(str, Enum):
    START = "start"  # Ad before game starts
    END = "end"      # Ad after game ends

# Ads shown per game
ADS_PER_GAME = 2

# ============================================
# WEBSOCKET EVENTS
# ============================================

# Server -> Client Events
class ServerEvent(str, Enum):
    PLAYER_JOINED = "game:player-joined"
    CARDS_DEALT = "game:cards-dealt"
    TRUMP_SET = "game:trump-set"
    ROUND_STARTED = "game:round-started"
    PLAY_NOTIFICATION = "game:play-notification"
    ROUND_WINNER = "game:round-winner"
    TENS_CAUGHT = "game:10s-caught"
    GAME_ENDED = "game:game-ended"
    PLAYER_DISCONNECTED = "game:player-disconnected"
    CHAT_MESSAGE = "game:chat-message"
    ERROR = "game:error"

# Client -> Server Events
class ClientEvent(str, Enum):
    PLAY_CARD = "game:play-card"
    SEND_MESSAGE = "game:send-message"
    DISCONNECT = "game:disconnect"

# ============================================
# ERROR MESSAGES
# ============================================

ERROR_MESSAGES = {
    "INVALID_CARD": "Card is not in your hand",
    "INVALID_MOVE": "Invalid move according to game rules",
    "NOT_YOUR_TURN": "It's not your turn",
    "GAME_NOT_FOUND": "Game not found",
    "LOBBY_NOT_FOUND": "Lobby not found",
    "INVALID_CODE": "Invalid lobby code",
    "LOBBY_FULL": "Lobby is full",
    "INSUFFICIENT_PLAYERS": "Not enough players to start the game",
    "NOT_AUTHENTICATED": "User not authenticated",
    "PERMISSION_DENIED": "Permission denied",
    "PLAYER_DISCONNECTED": "Player disconnected from the game",
}

# ============================================
# SUCCESS MESSAGES
# ============================================

SUCCESS_MESSAGES = {
    "GAME_CREATED": "Game created successfully",
    "LOBBY_CREATED": "Lobby created successfully",
    "PLAYER_JOINED": "Player joined the game",
    "CARD_PLAYED": "Card played successfully",
    "GAME_STARTED": "Game started successfully",
    "USER_REGISTERED": "User registered successfully",
    "LOGIN_SUCCESS": "Login successful",
}

# ============================================
# DATABASE CONSTRAINTS
# ============================================

# Max chat message length
MAX_MESSAGE_LENGTH = 500

# Max username length
MAX_USERNAME_LENGTH = 50

# Max bot name length
MAX_BOT_NAME_LENGTH = 50

# ============================================
# STATISTICS
# ============================================

# Stats reset period (for seasonal leaderboards if needed)
STATS_RESET_PERIOD_DAYS = 30

# Top N players for leaderboard
LEADERBOARD_TOP_N = 100
