# 10S Card Game - Technical Decisions & Rationale

This document records major architectural and technical decisions, their rationale, alternatives considered, and trade-offs.

## Decision Log

### Decision 1: SQLAlchemy ORM vs Raw SQL

**Date**: 2026-05-01  
**Status**: ✅ APPROVED  

**Problem**: Need flexible, maintainable database layer for Python FastAPI app

**Options Considered**:
1. **SQLAlchemy ORM** - Python ORM, object-oriented
2. Raw SQL with DB driver - More control, faster
3. Tortoise ORM - Async-first ORM
4. Pony ORM - Entity-relationship mapping

**Decision**: Use SQLAlchemy ORM with pure SQL queries where needed

**Rationale**:
- Largest Python ORM ecosystem, most tutorials/support
- Strong type hints support (works with mypy)
- Easy integration with FastAPI
- Migration support via Alembic
- Can drop to raw SQL for complex queries

**Trade-offs**:
- Slight performance overhead vs raw SQL (negligible for game use case)
- Learning curve for developers not familiar with ORMs
- Some query patterns harder than raw SQL

**Implementation**:
- `SQLAlchemy 2.0.25` with declarative base
- One model per table in `models.py`
- Using `Session` for dependency injection in routes

---

### Decision 2: UUID vs Auto-Increment IDs

**Date**: 2026-05-01  
**Status**: ✅ APPROVED  

**Problem**: Need to identify games, users, etc. across distributed systems

**Options Considered**:
1. **UUID (v4 Random)** - 128-bit unique
2. Auto-increment integers - Small, fast, familiar
3. UUID v1 (timestamp-based) - Sequential but less random
4. Snowflake IDs - Distributed unique IDs

**Decision**: Use UUID v4

**Rationale**:
- Prevents ID enumeration attacks (can't guess user IDs)
- Can generate without database (mobile apps can generate IDs)
- Ready for distributed/sharded future
- Standard across microservices

**Trade-offs**:
- Takes 16 bytes vs 8 bytes for int64
- Slightly slower sorting/indexing
- Less human-readable in logs
- No ordering information

**Implementation**:
```python
id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
```

---

### Decision 3: JSON Fields for Game State

**Date**: 2026-05-01  
**Status**: ✅ APPROVED  

**Problem**: Store flexible, complex data (player hands, game state) without over-normalizing

**Options Considered**:
1. **PostgreSQL JSON columns** - Flexible, queryable
2. Separate tables for each piece (Hand, CardInHand, etc.) - Normalized
3. Serialize to text/blob - No SQL queryability
4. NoSQL database (MongoDB) - Native JSON

**Decision**: Use PostgreSQL JSON columns

**Rationale**:
- Flexible schema without migrations for every small change
- Still queryable with SQL (some operations)
- Backup and transactions with SQL database
- Avoids over-normalization (hands are immutable during game)

**Trade-offs**:
- Can't query "games where player has King" with SQL
- Requires validation in application code
- JSON keys can't be indexed like columns

**What's Stored as JSON**:
- `game_state`: Full game state, deck, play order, etc.
- `hand`: Player's current cards
- `caught_10s`: Cards the player caught
- `plays`: Plays in a round (player_id, card, order)

**What's NOT JSON** (stored in columns):
- `game_id`, `user_id` - Need to query by these
- `status`, `player_position` - Need to filter by these
- `final_score` - Need to sort/aggregate

---

### Decision 4: Separate PlayerStatistics Table

**Date**: 2026-05-01  
**Status**: ✅ APPROVED  

**Problem**: Leaderboard queries need to be fast without aggregating all games

**Options Considered**:
1. **Separate statistics table** - Denormalized, fast reads
2. Calculate on-the-fly - No duplicated data, slow reads
3. Cache in Redis - Fast but requires cache invalidation
4. Materialized view - Database-level aggregation

**Decision**: Separate PlayerStatistics table, updated after each game

**Rationale**:
- Leaderboard queries O(1) vs O(n) aggregation
- Supports seasonal resets (create new stats)
- Analytics queries don't hit games table
- Can denormalize more stats (tens_caught, win_rate) without cost

**Trade-offs**:
- Double-write on game end (update both users and statistics)
- Risk of getting out of sync
- More storage for duplicated data
- Requires sync job if stats become inconsistent

**Implementation**:
```python
# After game ends
player_stats.total_games_played += 1
player_stats.total_points_scored += points
player_stats.total_games_won += (1 if won else 0)
player_stats.win_rate = total_wins / total_games
db.commit()
```

---

### Decision 5: WebSocket for Real-Time Updates

**Date**: 2026-05-01  
**Status**: ✅ APPROVED  

**Problem**: Need real-time player notifications (card plays, turn changes, etc.)

**Options Considered**:
1. **WebSocket** - Full duplex, always connected
2. Server-Sent Events (SSE) - Server to client only
3. Long polling - No persistent connection
4. MQTT - Publish-subscribe protocol

**Decision**: WebSocket

**Rationale**:
- True real-time (no polling delay)
- Bi-directional (clients can send too)
- Industry standard for games
- FastAPI has native WebSocket support

**Trade-offs**:
- Persistent connections = more server memory
- Can't scale easily (need session sharing/Redis)
- Harder to debug than REST API
- Client must reconnect on disconnect

**Architecture**:
- One WebSocket per game per user: `/ws/{game_id}/{user_id}`
- ConnectionManager broadcasts to all players in game
- Future: Use Redis pub/sub for multi-server setup

---

### Decision 6: JWT for Authentication

**Date**: 2026-05-01  
**Status**: 🔄 PLANNED (not yet implemented)  

**Problem**: Users need to authenticate and maintain sessions across requests

**Options Considered**:
1. **JWT (JSON Web Tokens)** - Stateless, scalable
2. Session cookies - Stateful, traditional
3. OAuth (Google, Facebook) - Third-party auth
4. API keys - Simple, less secure

**Decision**: JWT tokens with refresh tokens

**Rationale**:
- Stateless (API can scale without session storage)
- Secure with HMAC-SHA256
- Works across devices (mobile + web)
- Industry standard
- Can include claims (user_id, role)

**Trade-offs**:
- Tokens can't be revoked immediately
- Slightly larger request size
- Requires secure key management
- Token expiration adds complexity

**Implementation Plan**:
```
POST /auth/login → returns { access_token, refresh_token }
GET /games → requires Authorization: Bearer <access_token>
POST /auth/refresh → returns new access_token
```

---

### Decision 7: Bcrypt for Password Hashing

**Date**: 2026-05-01  
**Status**: 🔄 PLANNED (not yet implemented)  

**Problem**: Need to securely store passwords

**Options Considered**:
1. **Bcrypt** - Purpose-built, slow
2. PBKDF2 - NIST standard
3. Argon2 - Modern, resistant to GPU attacks
4. SCrypt - Crypto-secure

**Decision**: Bcrypt

**Rationale**:
- Industry standard for passwords
- Includes salt automatically
- Adaptive (slower as computers get faster)
- Widely supported, vetted

**Trade-offs**:
- Slower than alternatives (not a con - intentional)
- Can't upgrade existing hashes without user reauth
- Should increase rounds over time (current: 12)

---

### Decision 8: PostgreSQL (not MySQL, MongoDB, etc.)

**Date**: 2026-05-01  
**Status**: ✅ APPROVED  

**Problem**: Need persistent, relational database

**Options Considered**:
1. **PostgreSQL** - Advanced open-source RDBMS
2. MySQL - Simpler, more common
3. MongoDB - NoSQL, flexible
4. Cloud databases (Firebase, Supabase) - Managed

**Decision**: PostgreSQL

**Rationale**:
- JSON support (for flexible game data)
- Full-text search (for player names, lobbies)
- JSONB indexing (queryable)
- Superior reliability & features
- Self-hosted (full control)
- Zero cost

**Trade-offs**:
- More complex than MySQL
- Larger installation footprint
- Fewer managed hosting options than MySQL
- Slightly steeper learning curve

---

### Decision 9: ConnectionManager for WebSocket Rooms

**Date**: 2026-05-01  
**Status**: 🔄 PARTIAL  

**Problem**: Need to broadcast messages to specific players in a game

**Options Considered**:
1. **In-Memory ConnectionManager** - Simple, current
2. Redis pub/sub - Distributed, scales
3. RabbitMQ - Message queue
4. Each connection polls database - Inefficient

**Decision**: In-memory ConnectionManager, upgrade to Redis later

**Rationale**:
- Simple to implement and understand
- Works fine for single-server setup
- Can upgrade to Redis without changing API
- No external dependencies

**Trade-offs**:
- Only works on single server (no horizontal scaling)
- Memory used per connection (~1KB per user)
- No persistence if server restarts

**Future Migration**: When scaling needed, use Redis:
```python
redis = Redis()
# Publish to channel "game:123"
redis.publish(f"game:{game_id}", json.dumps(message))
```

---

### Decision 10: Game State in JSON vs Separate Records

**Date**: 2026-05-01  
**Status**: ✅ APPROVED  

**Problem**: Store game progression (hands, plays, state)

**Options Considered**:
1. **Single JSON object** - Flexible, fewer writes
2. Separate records (Hand, CardPlayed, etc.) - Normalized
3. Event sourcing - Append-only log
4. Two-tier (JSON + denormalized columns) - Hybrid

**Decision**: Game state as JSON (hands, discard), Rounds as separate records

**Rationale**:
- Hands change many times per game (avoid many writes)
- Rounds are immutable snapshots (separate table)
- Can replay game from rounds table
- JSON doesn't need indexing
- Reduces transaction contention

**Trade-offs**:
- Can't query "games where X has King" without deserialization
- Consistency responsibility on app (no DB constraints)

**Recovery Strategy**: If game_state corrupts, reconstruct from rounds

---

## Rejected Decisions

### Rejected: Real-time Persistence (every action to database)
**Why Rejected**: Too many database writes, transaction overhead
**Alternative Chosen**: Persist rounds, update game_state at end of round

### Rejected: Microservices Architecture
**Why Rejected**: Premature optimization, adds complexity
**Alternative Chosen**: Monolithic FastAPI, can split later

### Rejected: GraphQL API
**Why Rejected**: Added complexity for game use case, REST better for WebSocket pairing
**Alternative Chosen**: REST + WebSocket hybrid

---

## Future Decision Points

1. **Caching Layer**: When do we add Redis?
   - Trigger: Leaderboard queries taking >100ms
   - Plan: Cache top 100 players, invalidate on game end

2. **Search**: When do we add full-text search?
   - Trigger: Can't efficiently search players by username
   - Plan: Use PostgreSQL TSVECTOR

3. **Microservices**: When do we split into services?
   - Trigger: Auth service needs separate scaling
   - Plan: Auth service → separate container, JWT validation

4. **Analytics**: When do we add analytics database?
   - Trigger: Need to analyze player behavior without OLTP queries
   - Plan: Extract to analytics database, nightly sync

---

## Decision Making Framework

For future architectural decisions, follow this process:

1. **State the problem** - What constraint are we hitting?
2. **List alternatives** - At least 3 options
3. **Evaluate trade-offs** - For each option, what do we gain/lose?
4. **Choose based on current needs** - Not future-proofing
5. **Document** - Add to this file
6. **Revisit** - Quarterly, check if decision still makes sense

**Principle**: Make the simplest decision that solves today's problem, with a clear upgrade path for tomorrow.
