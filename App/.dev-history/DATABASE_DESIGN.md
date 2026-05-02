# 10S Card Game - Database Design

## Overview

The database uses PostgreSQL with 10 main tables optimized for a multiplayer card game. The design prioritizes flexibility, performance, and auditability while maintaining referential integrity.

## Table Structure

### 1. **users** (Core)
Stores user account information and session data.

```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    auth_method ENUM ('email', 'phone', 'google', 'facebook', 'guest'),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expiry DATETIME,
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    rating FLOAT DEFAULT 1000.0,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW(),
    last_login DATETIME
);
```

**Purpose**: Authentication, profile, aggregated stats  
**Indexes**: username, email, is_premium, rating  
**Relationships**: Owns games, lobbies, player stats, messages  

### 2. **player_statistics** (Core)
Detailed statistics per player for leaderboards and analytics.

```sql
CREATE TABLE player_statistics (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR UNIQUE NOT NULL REFERENCES users(id),
    total_games_played INTEGER DEFAULT 0,
    total_games_won INTEGER DEFAULT 0,
    total_games_lost INTEGER DEFAULT 0,
    total_points_scored INTEGER DEFAULT 0,
    average_points_per_game FLOAT DEFAULT 0.0,
    tens_caught INTEGER DEFAULT 0,
    win_rate FLOAT DEFAULT 0.0,
    rating FLOAT DEFAULT 1000.0,
    rank INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);
```

**Purpose**: Leaderboard queries, seasonal rankings  
**Indexes**: rating, rank, win_rate  
**Update**: Calculated at game end  

### 3. **lobbies** (Game Organization)
Temporary rooms where players gather before starting a game.

```sql
CREATE TABLE lobbies (
    id VARCHAR PRIMARY KEY,
    code VARCHAR(6) UNIQUE NOT NULL,
    creator_id VARCHAR NOT NULL REFERENCES users(id),
    status ENUM ('waiting', 'in_progress', 'closed') DEFAULT 'waiting',
    max_players INTEGER DEFAULT 5,
    current_players INTEGER DEFAULT 0,
    game_type ENUM ('bot', 'random', 'lobby'),
    is_private BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW(),
    expires_at DATETIME
);
```

**Purpose**: Player grouping before game starts  
**Indexes**: code, creator_id, status, expires_at  
**TTL**: 3 minutes (checked on access)  

### 4. **games** (Game Sessions)
Represents a single game instance with current state.

```sql
CREATE TABLE games (
    id VARCHAR PRIMARY KEY,
    lobby_id VARCHAR REFERENCES lobbies(id),
    creator_id VARCHAR NOT NULL REFERENCES users(id),
    status ENUM ('waiting', 'in_progress', 'completed', 'abandoned'),
    game_type ENUM ('bot', 'random', 'lobby'),
    num_players INTEGER DEFAULT 0,
    current_round INTEGER DEFAULT 0,
    current_led_suit VARCHAR(20),
    current_trump_suit VARCHAR(20),
    game_state JSON,  -- Full game state (hands, discard pile, etc.)
    winner_id VARCHAR REFERENCES users(id),
    start_time DATETIME,
    end_time DATETIME,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);
```

**Purpose**: Game lifecycle management  
**Indexes**: creator_id, status, start_time  
**JSON Schema**: Contains deck state, player hands, current round info  

### 5. **game_players** (Participation)
Tracks which players are in which games and their game-specific state.

```sql
CREATE TABLE game_players (
    id VARCHAR PRIMARY KEY,
    game_id VARCHAR NOT NULL REFERENCES games(id),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    player_position INTEGER NOT NULL,
    status ENUM ('active', 'disconnected', 'eliminated', 'finished'),
    hand JSON,  -- Current cards in hand
    caught_10s JSON,  -- 10s the player has caught
    final_score INTEGER DEFAULT 0,
    joined_at DATETIME DEFAULT NOW(),
    left_at DATETIME,
    disconnected_at DATETIME
);
```

**Purpose**: Player participation and per-game state  
**Indexes**: game_id, user_id  
**Constraints**: Unique(game_id, user_id)  

### 6. **rounds** (Game Progression)
Individual rounds within a game - what cards were played, who won, etc.

```sql
CREATE TABLE rounds (
    id VARCHAR PRIMARY KEY,
    game_id VARCHAR NOT NULL REFERENCES games(id),
    round_number INTEGER NOT NULL,
    led_suit VARCHAR(20) NOT NULL,
    trump_suit VARCHAR(20),
    plays JSON,  -- [{ player_id, card, play_order }]
    winner_id VARCHAR,
    winning_card VARCHAR(50),  -- e.g. "10 of hearts"
    created_at DATETIME DEFAULT NOW()
);
```

**Purpose**: Game history for replay and analysis  
**Indexes**: game_id, round_number  
**Immutable**: Once created, never updated  

### 7. **chat_messages** (In-Game Communication)
Player messages during game for social interaction and game communication.

```sql
CREATE TABLE chat_messages (
    id VARCHAR PRIMARY KEY,
    game_id VARCHAR NOT NULL REFERENCES games(id),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'chat',  -- 'chat', 'system', 'action'
    created_at DATETIME DEFAULT NOW() INDEX
);
```

**Purpose**: In-game chat and notifications  
**Indexes**: game_id, created_at (for range queries)  
**Retention**: Archive after 30 days  

### 8. **ad_servings** (Monetization)
Tracks which ads were shown to which players for revenue tracking.

```sql
CREATE TABLE ad_servings (
    id VARCHAR PRIMARY KEY,
    game_id VARCHAR NOT NULL REFERENCES games(id),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    ad_type ENUM ('start', 'end'),
    ad_network VARCHAR(100),  -- 'google_admob', 'unity_ads'
    is_completed BOOLEAN DEFAULT FALSE,
    viewed_at DATETIME,
    clicked_at DATETIME,
    created_at DATETIME DEFAULT NOW()
);
```

**Purpose**: Ad revenue tracking and analytics  
**Indexes**: user_id, created_at  

### 9. **premium_subscriptions** (Monetization)
Premium user subscriptions for ad-free gameplay and other benefits.

```sql
CREATE TABLE premium_subscriptions (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR UNIQUE NOT NULL REFERENCES users(id),
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    price_usd FLOAT DEFAULT 3.00,
    is_active BOOLEAN DEFAULT TRUE,
    started_at DATETIME DEFAULT NOW(),
    expires_at DATETIME NOT NULL,
    renewal_enabled BOOLEAN DEFAULT TRUE,
    last_renewed_at DATETIME,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);
```

**Purpose**: Track premium memberships  
**Indexes**: user_id, is_active, expires_at  
**Triggers**: Auto-expire if expires_at < NOW()  

### 10. **bots** (AI Players)
AI player definitions for single-player games.

```sql
CREATE TABLE bots (
    id VARCHAR PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    difficulty ENUM ('easy', 'medium', 'hard'),
    avatar_url VARCHAR(500),
    description TEXT,
    win_rate FLOAT DEFAULT 0.5,
    games_played INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW()
);
```

**Purpose**: Define AI opponents  
**Indexes**: difficulty, is_active  

## Key Design Decisions

### 1. **UUID Primary Keys**
- **Why**: Distributed-system ready, secure (can't guess IDs), UUIDs can be generated client-side
- **Trade-off**: Takes more storage than auto-increment integers
- **Implementation**: `id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))`

### 2. **JSON Columns for Game State**
- **Why**: Flexibility for complex data (cards, game state) without over-normalizing
- **What**: Hands, caught_10s, game_state, rounds plays
- **Trade-off**: Not queryable with SQL (can't easily filter "games where player has specific card")
- **Mitigation**: Keep queryable data (user_id, game_id) in regular columns

### 3. **Separate PlayerStatistics Table**
- **Why**: Efficient leaderboard queries without scanning all games
- **Update Pattern**: Recalculate after each game ends
- **Cost**: Requires double-write (update both users and player_statistics)
- **Benefit**: O(1) leaderboard retrieval vs O(n) aggregation

### 4. **Timestamp on All Tables**
- **Why**: Audit trail, analytics, debugging
- **Pattern**: created_at (immutable), updated_at (auto-updated)
- **Queries**: Time-series analytics, "games from last 7 days"

### 5. **Status Enums Instead of Boolean**
- **Why**: More expressive than just active/inactive
- **Example**: PlayerStatus.DISCONNECTED vs just deleted
- **Benefit**: Can replay games from disconnects, trace user journey

### 6. **No Soft Deletes**
- **Why**: Games are immutable records; players can't really "leave" a finished game
- **Exception**: Users can delete accounts (cascade delete or soft delete?)
- **Decision**: Hard delete only for test data, soft delete for user accounts

## Relationships Diagram

```
users (1) ──────┬────── (N) games
                │
                ├────── (N) lobbies
                │
                ├────── (1) player_statistics
                │
                ├────── (N) game_players
                │
                └────── (N) chat_messages

games (1) ──────┬────── (N) game_players
                │
                ├────── (N) rounds
                │
                ├────── (N) chat_messages
                │
                └────── (N) ad_servings

lobbies (1) ───────────── (N) games

premium_subscriptions (1) ── (1) users
```

## Indexing Strategy

### High-Priority Indexes
```sql
-- User queries
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rating ON users(rating DESC);

-- Game queries  
CREATE INDEX idx_games_creator_id ON games(creator_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_start_time ON games(start_time DESC);

-- Game player queries
CREATE INDEX idx_game_players_game_id ON game_players(game_id);
CREATE INDEX idx_game_players_user_id ON game_players(user_id);

-- Leaderboard
CREATE INDEX idx_player_statistics_rating ON player_statistics(rating DESC);

-- Chat/Feed
CREATE INDEX idx_chat_messages_game_id_created ON chat_messages(game_id, created_at DESC);
```

## Performance Considerations

### Query Patterns

**Leaderboard (Top 100)**
```sql
SELECT user_id, rating, rank FROM player_statistics 
ORDER BY rating DESC LIMIT 100;
```
**Cost**: O(1) with index - no joins needed

**Game History**
```sql
SELECT * FROM games WHERE creator_id = ? ORDER BY created_at DESC;
```
**Cost**: O(n) where n = user's game count

**Active Games**
```sql
SELECT * FROM games WHERE status = 'in_progress';
```
**Cost**: O(n) where n = active game count - acceptable

**Game State**
```sql
SELECT game_state FROM games WHERE id = ?;
```
**Cost**: O(1) - single document retrieval

## Scaling Strategy

### Sharding (Future)
If data gets very large:
- **Shard Key**: user_id (vertical partitioning)
- **Reason**: Most queries filter by user_id
- **Schema**: Create separate databases per user shard

### Archival (Future)
- **Archive**: Games older than 1 year to separate table
- **Reason**: Keep active tables smaller for faster queries
- **Recovery**: Games table partitioned by created_at

### Caching (Future)
- **Cache**: Player stats, leaderboard (Redis)
- **TTL**: 5 minutes for stats, 1 hour for leaderboard
- **Invalidation**: Update on game end

## Migration Strategy

Using Alembic for schema migrations:

```bash
# Create migration
alembic revision --autogenerate -m "Add new_column to users"

# Apply
alembic upgrade head

# Rollback
alembic downgrade -1
```

**Practice**: Always test migrations on copy of production data first.

## Data Retention Policy

| Table | Retention | Reason |
|-------|-----------|--------|
| games | Forever | Game history, revenue tracking |
| rounds | Forever | Game replay, dispute resolution |
| chat_messages | 90 days | Storage cost |
| ad_servings | 365 days | Revenue/tax reporting |
| lobbies | 7 days | Cleanup of expired lobbies |
| users | Forever* | User retention, legal reasons |

*Deleted users: Soft delete (mark as inactive) or anonymize data
