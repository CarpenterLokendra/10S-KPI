# 10S Card Game - System Architecture

## Overview

The 10S Card Game is a multiplayer real-time card game backend built with FastAPI and PostgreSQL. The system handles user authentication, game management, real-time player interactions via WebSockets, and game state persistence.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React/Flutter)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  REST API (HTTPS)              WebSocket (WSS)              │
│  ├── Authentication             ├── Real-time Events        │
│  ├── User Management            ├── Game State Updates      │
│  ├── Lobby Management           ├── Chat Messages           │
│  ├── Game State                 └── Player Notifications    │
│  └── Statistics                                             │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                      FASTAPI APPLICATION                    │
│  ├── Routes Layer (to be implemented)                       │
│  ├── Business Logic Layer                                   │
│  ├── Data Validation (Pydantic Schemas)                     │
│  └── Database Abstraction (SQLAlchemy ORM)                  │
├─────────────────────────────────────────────────────────────┤
│                       DATABASE LAYER                        │
│  PostgreSQL with 10 Main Tables:                            │
│  • users, player_statistics                                 │
│  • lobbies, games, game_players, rounds                     │
│  • chat_messages, ad_servings, premium_subscriptions        │
│  • bots                                                     │
├─────────────────────────────────────────────────────────────┤
│                   EXTERNAL SERVICES (Optional)              │
│  • Redis (caching, sessions, real-time)                     │
│  • Firebase (authentication)                                │
│  • Ad Networks (monetization)                               │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | FastAPI | 0.109.0 | REST API & WebSockets |
| **Server** | Uvicorn | 0.27.0 | ASGI Server |
| **Database** | PostgreSQL | 16+ | Data persistence |
| **ORM** | SQLAlchemy | 2.0.25 | Database abstraction |
| **Driver** | Psycopg | 3.2.0 | PostgreSQL adapter |
| **Validation** | Pydantic | 2.4.2 | Request/response schemas |
| **Auth** | Python-Jose | 3.3.0 | JWT tokens |
| **Hashing** | Bcrypt | 4.1.1 | Password hashing |
| **WebSocket** | Websockets | 12.0 | Real-time communication |
| **Cache** | Redis | 5.0.1 | (Optional) caching layer |

## Core Components

### 1. Authentication & Authorization

**Current Status**: Schemas defined, endpoints not yet implemented

- JWT-based token authentication
- Password hashing with bcrypt
- OAuth support (Google, Facebook) - planned
- User registration and login

**Files**:
- `schemas.py` - UserCreate, UserLogin, TokenResponse
- `database.py` - SessionLocal for DB access
- `models.py` - User model with password_hash

### 2. Database Layer

**Current Status**: Fully implemented

- SQLAlchemy ORM models
- Connection pooling (20 connections, 40 overflow)
- Automatic table creation on startup
- Support for JSON columns for flexible data

**Key Design Decisions**:
- Used JSON fields for game state and cards (flexibility)
- Separate PlayerStatistics table (allows efficient ranking queries)
- UUID primary keys (distributed-system ready)
- Timestamps on all tables (audit trail)

**Files**:
- `database.py` - Connection setup
- `models.py` - All 10 tables

### 3. Game Logic

**Current Status**: Game rules defined, not integrated with API

- Card validation
- Round winner determination
- 10s catching mechanics
- Scoring calculation
- Deck management by player count

**Files**:
- `game_rules.py` - GameRules class with static methods
- `game_constants.py` - Enums and game config

### 4. Real-time Communication

**Current Status**: WebSocket infrastructure in place, game events not wired

- ConnectionManager for tracking active connections
- Broadcast messaging to game rooms
- Player disconnection handling

**Files**:
- `main.py` - ConnectionManager class and WebSocket endpoint

### 5. API Routes (To Be Implemented)

**Planned structure**:
```
/auth/
  POST /register    - User registration
  POST /login       - User login
  POST /refresh     - Token refresh

/users/
  GET /{id}         - Get user profile
  PUT /{id}         - Update profile
  GET /{id}/stats   - Get player statistics

/games/
  POST /            - Create game
  GET /             - List games
  GET /{id}         - Get game state
  PUT /{id}/state   - Update game state

/lobbies/
  POST /            - Create lobby
  POST /{code}/join - Join lobby
  GET /{code}       - Get lobby info

/leaderboard/
  GET /             - Top 100 players
  GET /global       - Global stats

/admin/
  GET /health       - System health (implemented)
```

## Data Flow

### Game Creation Flow
```
Client → POST /games
    ↓
FastAPI Route Handler
    ↓
Pydantic Validation (schemas.py)
    ↓
Business Logic Layer
    ↓
SQLAlchemy Model → INSERT into games table
    ↓
PostgreSQL
    ↓
Response → {game_id, status, players: []}
    ↓
Client
```

### Real-time Play Flow
```
Player 1 → WebSocket: {type: "play-card", card: {...}}
    ↓
ConnectionManager.broadcast()
    ↓
All players in game receive: {type: "play-notification", user_id, card}
    ↓
Game State Updated (rounds table)
    ↓
Next player notified → {type: "your-turn"}
```

### Database Design Principles

1. **Normalization**: Separated concerns (User, Game, Round)
2. **Flexibility**: JSON fields for cards and game state
3. **Auditability**: Timestamps on all records
4. **Performance**: Strategic indexing on frequently queried fields
5. **Scalability**: UUID keys, connection pooling

## File Organization

```
src/
├── main.py                 # FastAPI app, startup events, routes
├── database.py             # DB connection, session management
├── models.py               # SQLAlchemy ORM models (10 tables)
├── schemas.py              # Pydantic validation schemas
├── config.py               # Configuration from environment
├── game_rules.py           # Game logic and validation
├── game_constants.py       # Game enums and constants
├── __init__.py             # Package initialization
├── requirements.txt        # Python dependencies
├── .env                    # Environment secrets (not committed)
└── test_database.py        # Database verification tests
```

## Configuration Management

Environment variables defined in `.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost/postgres
JWT_SECRET_KEY=...
JWT_ALGORITHM=HS256
TURN_TIMEOUT_SECONDS=30
CATCH_10S_MULTIPLIER=100
```

All config centralized in `config.py` with defaults.

## Error Handling Strategy

**Current**: Global exception handler in main.py

**Planned**:
- Custom exception classes for different error types
- Proper HTTP status codes (400, 401, 403, 404, 500)
- Structured error responses with error codes
- Logging of all errors

## Testing Strategy

**Current**:
- Manual testing via test_database.py
- Health endpoint for connectivity check

**Planned**:
- Unit tests for game_rules.py
- Integration tests for all API endpoints
- WebSocket connection tests
- Database transaction tests

## Scalability Considerations

1. **Database**: Connection pooling, query optimization, indexing
2. **Real-time**: Redis Pub/Sub for distributed WebSocket servers
3. **Sessions**: Redis for session storage (stateless API)
4. **Caching**: Redis for frequently accessed data (leaderboards)
5. **Async**: FastAPI's native async support for concurrent requests

## Security Measures

1. **Authentication**: JWT tokens with expiration
2. **Passwords**: Bcrypt hashing with configurable rounds
3. **Database**: Connection pooling, parameterized queries (SQLAlchemy)
4. **Validation**: Pydantic schemas validate all inputs
5. **CORS**: Configured but needs domain whitelisting in production

## Development Workflow

1. Define schema in `schemas.py`
2. Implement database access in route
3. Add business logic if needed
4. Write tests
5. Update API documentation
6. Commit with descriptive message

## Future Architecture Changes

- **Caching Layer**: Redis for performance
- **Message Queue**: Celery for async tasks
- **Monitoring**: Prometheus + Grafana
- **API Versioning**: /v1/, /v2/ prefixes
- **GraphQL**: Alternative to REST API
- **Microservices**: Separate auth, game, stats services
