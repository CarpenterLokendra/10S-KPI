# 10S Card Game - Backend Architecture & Database Schema

## Project Overview
- **Game:** 10S (Card Game with 52-card deck)
- **Backend Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **Real-time Communication:** WebSockets
- **Deployment:** AWS/Google Cloud/Azure

---

## 1. DATABASE SCHEMA

### 1.1 Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255),
    auth_method ENUM('email', 'phone', 'google', 'facebook', 'guest'),
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 1.2 Sessions Table
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 1.3 Games Table
```sql
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_type ENUM('bot', 'random', 'lobby') NOT NULL,
    lobby_id UUID REFERENCES lobbies(id) ON DELETE SET NULL,
    status ENUM('waiting', 'in_progress', 'completed', 'abandoned') DEFAULT 'waiting',
    trump_suit ENUM('spades', 'hearts', 'diamonds', 'clubs') DEFAULT NULL,
    num_players INT NOT NULL,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total_cards_in_deck INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.4 Game Players Table
```sql
CREATE TABLE game_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_bot BOOLEAN DEFAULT FALSE,
    bot_name VARCHAR(50),
    position INT NOT NULL, -- 1, 2, 3, 4, 5 (determines play order)
    status ENUM('active', 'disconnected', 'eliminated', 'finished') DEFAULT 'active',
    total_points INT DEFAULT 0,
    caught_10s INT DEFAULT 0,
    cards_in_hand INT DEFAULT 0,
    disconnected_at TIMESTAMP,
    eliminated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, position)
);
```

### 1.5 Rounds Table
```sql
CREATE TABLE rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    led_suit ENUM('spades', 'hearts', 'diamonds', 'clubs') NOT NULL,
    winner_id UUID REFERENCES game_players(id),
    has_10 BOOLEAN DEFAULT FALSE,
    cards_in_round INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, round_number)
);
```

### 1.6 Round Plays Table (Cards played in each round)
```sql
CREATE TABLE round_plays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    game_player_id UUID NOT NULL REFERENCES game_players(id) ON DELETE CASCADE,
    card_value INT NOT NULL, -- 2-14 (2-10, J=11, Q=12, K=13, A=14)
    card_suit ENUM('spades', 'hearts', 'diamonds', 'clubs') NOT NULL,
    is_smash BOOLEAN DEFAULT FALSE, -- Whether this was a trump card
    play_order INT NOT NULL, -- Order in which card was played (1, 2, 3, 4, 5)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.7 Caught 10s Table
```sql
CREATE TABLE caught_10s (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    game_player_id UUID NOT NULL REFERENCES game_players(id) ON DELETE CASCADE,
    round_1_id UUID NOT NULL REFERENCES rounds(id),
    round_2_id UUID NOT NULL REFERENCES rounds(id),
    card_suit ENUM('spades', 'hearts', 'diamonds', 'clubs') NOT NULL,
    points_earned INT DEFAULT 100,
    caught_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.8 Lobbies Table
```sql
CREATE TABLE lobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(10) UNIQUE NOT NULL,
    max_players INT NOT NULL, -- 3, 4, or 5
    current_players INT DEFAULT 1,
    status ENUM('waiting', 'in_progress', 'closed') DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    expires_at TIMESTAMP, -- 3 minutes from creation
    game_id UUID REFERENCES games(id) ON DELETE SET NULL
);
```

### 1.9 Lobby Members Table
```sql
CREATE TABLE lobby_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lobby_id, user_id)
);
```

### 1.10 Game Statistics Table
```sql
CREATE TABLE game_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_games_played INT DEFAULT 0,
    total_games_won INT DEFAULT 0,
    total_points_earned INT DEFAULT 0,
    total_10s_caught INT DEFAULT 0,
    win_rate FLOAT DEFAULT 0.0,
    avg_points_per_game FLOAT DEFAULT 0.0,
    last_game_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.11 Chat Messages Table
```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_system_message BOOLEAN DEFAULT FALSE -- For game notifications
);
```

### 1.12 Ad Impressions Table (for analytics)
```sql
CREATE TABLE ad_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    ad_type ENUM('start', 'end') NOT NULL,
    ad_network VARCHAR(50), -- 'admob', 'facebook', etc.
    revenue DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. BACKEND ARCHITECTURE

### 2.1 Project Structure
```
10s-game-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── config.py               # Environment variables & settings
│   ├── database.py             # PostgreSQL connection
│   ├── websocket_manager.py    # WebSocket connection handling
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── game.py
│   │   ├── round.py
│   │   └── lobby.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── game.py
│   │   └── lobby.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py             # Login, signup
│   │   ├── game.py             # Game endpoints
│   │   ├── lobby.py            # Lobby endpoints
│   │   ├── stats.py            # User statistics
│   │   └── ads.py              # Ad tracking
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py     # Authentication logic
│   │   ├── game_service.py     # Game logic & rules
│   │   ├── matchmaking_service.py  # Player matching
│   │   ├── websocket_service.py    # Real-time updates
│   │   └── bot_service.py      # Bot AI logic
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── game_rules.py       # Game rule validation
│   │   ├── card_utils.py       # Card deck management
│   │   └── jwt_utils.py        # JWT token handling
│   └── constants/
│       ├── __init__.py
│       └── game_constants.py   # Game constants
├── tests/
│   ├── __init__.py
│   ├── test_game_rules.py
│   ├── test_game_service.py
│   └── test_matchmaking.py
├── requirements.txt
├── .env.example
└── docker-compose.yml
```

---

## 3. KEY ENDPOINTS

### 3.1 Authentication Routes
```
POST   /auth/signup              # Email/Phone signup
POST   /auth/login               # Email/Phone login
POST   /auth/google-login        # Google OAuth
POST   /auth/facebook-login      # Facebook OAuth
POST   /auth/guest-login         # Anonymous guest
POST   /auth/logout              # Logout
POST   /auth/refresh-token       # Refresh JWT token
```

### 3.2 Game Routes
```
POST   /games/play-with-bots     # Start game with bots
POST   /games/play-random        # Join random multiplayer queue
GET    /games/{game_id}          # Get game details
POST   /games/{game_id}/play-card # Play a card (WebSocket)
GET    /games/{game_id}/status   # Get current game state
```

### 3.3 Lobby Routes
```
POST   /lobbies                  # Create new lobby
GET    /lobbies/{lobby_id}       # Get lobby details
POST   /lobbies/{lobby_id}/join  # Join lobby by code
POST   /lobbies/{lobby_id}/start # Start game when ready
GET    /lobbies/{lobby_id}/members # Get lobby members
```

### 3.4 Statistics Routes
```
GET    /stats/user/{user_id}     # Get user stats
GET    /stats/leaderboard        # Global leaderboard
```

### 3.5 Ad Routes
```
POST   /ads/impression           # Track ad impression
GET    /ads/check-premium        # Check if user has premium
```

---

## 4. WEBSOCKET EVENTS

### 4.1 Server → Client Events
```
game:player-joined       # New player joined game
game:cards-dealt         # Cards dealt to players
game:trump-set           # Trump suit set
game:round-started       # New round started
game:play-notification   # Player played a card
game:round-winner        # Round winner announced
game:10s-caught          # 10s caught by a player
game:game-ended          # Game finished with winner
game:player-disconnected # Player disconnected
game:chat-message        # New chat message
```

### 4.2 Client → Server Events
```
game:play-card           # Player plays a card
game:send-message        # Send chat message
game:disconnect          # Player disconnects gracefully
```

---

## 5. GAME LOGIC FLOW

### 5.1 Game Initialization
1. Players join (3-5 players)
2. Shuffle deck (remove 2 cards for 3 players, remove 2 of clubs for 5 players)
3. Deal 5 cards to each player
4. Select first player (random for first game, based on previous game points)
5. Initialize game state

### 5.2 Round Flow
1. First player plays a card (led suit)
2. Other players play in order:
   - If they have led suit → must play it
   - If no led suit but have trump → can play trump (smash)
   - Otherwise → play any card (lose round)
3. Determine round winner (highest card of led suit OR highest trump)
4. Check for 10s in round
5. Check if player has caught 10s (2 consecutive rounds)
6. Deal new card to all players
7. Next player plays

### 5.3 Game End Condition
- All 10s caught
- Calculate final scores
- Declare winner
- Save game statistics

---

## 6. REAL-TIME SYNCHRONIZATION

### 6.1 WebSocket Manager
- Maintain active player connections
- Broadcast game state changes
- Handle disconnections (2-minute timeout)
- Queue messages if player disconnects temporarily

### 6.2 Game State Management
```python
game_state = {
    "game_id": "uuid",
    "status": "in_progress",
    "current_player": 1,
    "trump_suit": "hearts",
    "current_round": 1,
    "players": [
        {
            "user_id": "uuid",
            "position": 1,
            "hand": [/* hidden from others */],
            "caught_10s": ["spades", "hearts"],
            "points": 114,
            "status": "active"
        }
    ],
    "round_history": [...],
    "chat_messages": [...]
}
```

---

## 7. MATCHMAKING ALGORITHM

### 7.1 Random Matchmaking (30-second max)
```python
class MatchmakingService:
    def __init__(self):
        self.waiting_queues = {
            3: [],  # Players waiting for 3-player game
            4: [],  # Players waiting for 4-player game
            5: []   # Players waiting for 5-player game
        }
    
    def add_player(user_id, preferred_size):
        # Add to queue
        # If queue has enough players, create game
        # If 30 seconds passed, start with available players
```

### 7.2 Lobby Creation
```python
class LobbyService:
    def create_lobby(creator_id, max_players):
        # Generate unique 6-digit code
        # Set expiry to 3 minutes
        # Return code + shareable link
    
    def join_lobby(user_id, code):
        # Validate code exists and is active
        # Add player to lobby
        # Check if enough players to start
```

---

## 8. BOT AI LOGIC

### 8.1 Bot Player Behavior
```python
class BotService:
    def decide_card(bot_state, game_state):
        """
        Decision logic:
        1. If must play led suit, play lowest value (save high cards)
        2. If can choose, evaluate:
           - Can I win this round?
           - Is there a 10 in the round?
           - Should I smash or play low?
        3. Consider 2-round catch strategy
        """
    
    def get_difficulty(level):
        # Easy: Random valid cards
        # Medium: Basic strategy
        # Hard: Advanced strategy + memory
```

---

## 9. AUTHENTICATION & SECURITY

### 9.1 JWT Tokens
```python
# Token structure
{
    "sub": user_id,
    "email": email,
    "auth_method": "email|phone|google|facebook|guest",
    "is_premium": boolean,
    "exp": timestamp,
    "iat": timestamp
}
```

### 9.2 Password Security
- Use bcrypt for password hashing
- Min 8 characters, alphanumeric + special char
- Rate limit login attempts (5 attempts per 15 minutes)

### 9.3 Premium Verification
```python
def is_premium(user_id):
    user = db.query(User).filter(User.id == user_id).first()
    if not user.is_premium:
        return False
    if user.premium_expiry < datetime.now():
        user.is_premium = False
        db.commit()
        return False
    return True
```

---

## 10. ERROR HANDLING & VALIDATION

### 10.1 Game Rule Validation
```python
class GameRules:
    @staticmethod
    def is_valid_move(player_hand, led_suit, trump_suit, card_played):
        """Validate if card play follows rules"""
        if led_suit in player_hand:
            return card_played.suit == led_suit
        elif trump_suit in player_hand:
            return card_played.suit == trump_suit
        return True  # Any card valid
    
    @staticmethod
    def get_round_winner(cards_played, trump_suit):
        """Determine round winner"""
        led_suit = cards_played[0].suit
        trump_cards = [c for c in cards_played if c.suit == trump_suit]
        if trump_cards:
            return max(trump_cards, key=lambda x: x.value)
        led_cards = [c for c in cards_played if c.suit == led_suit]
        return max(led_cards, key=lambda x: x.value)
    
    @staticmethod
    def check_10s_caught(last_two_rounds):
        """Check if 10s were caught"""
        # Logic for 2 consecutive rounds with at least one 10
```

---

## 11. DEPLOYMENT

### 11.1 Docker Configuration
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app/ ./app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 11.2 Environment Variables
```
DATABASE_URL=postgresql://user:password@localhost/10s_game
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
GOOGLE_CLIENT_ID=xxx
FACEBOOK_APP_ID=xxx
ADMOB_UNIT_ID=xxx
REDIS_URL=redis://localhost:6379
LOG_LEVEL=INFO
```

---

## 12. MONITORING & ANALYTICS

### 12.1 Metrics to Track
- Daily/Monthly Active Users (DAU/MAU)
- Average game duration
- Player retention rate
- Ad impressions & revenue
- Server latency
- Disconnection rate

### 12.2 Logging
```python
import logging
logger = logging.getLogger(__name__)
logger.info(f"Game {game_id} started with {num_players} players")
logger.error(f"Error in game logic: {error_message}")
```

---

## 13. NEXT STEPS

1. **Set up PostgreSQL** and create tables
2. **Initialize FastAPI project** with dependencies
3. **Implement authentication** (JWT + OAuth)
4. **Build game service** with rule validation
5. **Set up WebSocket** for real-time updates
6. **Create matchmaking** algorithm
7. **Implement bot AI** logic
8. **Test thoroughly** before deployment
9. **Deploy to cloud** (AWS/GCP/Azure)
10. **Monitor and optimize** based on metrics

---

This architecture supports:
✅ 3-5 multiplayer games
✅ Bot AI for solo play
✅ Lobby system for friends
✅ Real-time synchronization
✅ Disconnection recovery
✅ Premium ad-free subscription
✅ Analytics & monetization tracking
✅ Scalable to thousands of concurrent players

Would you like me to start coding the backend now?
