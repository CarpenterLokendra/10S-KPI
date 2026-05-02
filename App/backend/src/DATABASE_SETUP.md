# Database Setup Guide - 10S Card Game

## Overview
This guide explains how to set up and use the PostgreSQL database with the 10S Card Game backend.

## Database Connection Details

The application connects to PostgreSQL using the following credentials (from your screenshot):

```
Server: localhost
User: postgres
Password: postgres
Database: postgres
```

These are configured in the `.env` file:
```
DATABASE_URL=postgresql://postgres:postgres@localhost/postgres
```

## Installation & Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start PostgreSQL Server
Make sure your PostgreSQL server is running on `localhost:5432`. You can verify the connection using:

```bash
psql -h localhost -U postgres -d postgres
```

### 3. Initialize Database Tables
The database tables are automatically created when the FastAPI application starts up. The `@app.on_event("startup")` event in `main.py` handles this.

When you run the application:
```bash
python main.py
```

The following tables will be automatically created:
- `users` - User accounts and profiles
- `player_statistics` - Player stats and ratings
- `lobbies` - Game lobbies
- `games` - Game records
- `game_players` - Player participation in games
- `rounds` - Game round data
- `chat_messages` - In-game chat
- `ad_servings` - Ad tracking
- `premium_subscriptions` - Premium user subscriptions
- `bots` - Bot players

## Database Models

### Core Models

#### User (users table)
Stores user account information with authentication, profile, and stats.

```python
- id: UUID (Primary Key)
- username: String (unique, indexed)
- email: String (unique, indexed)
- password_hash: String
- auth_method: Enum (email, phone, google, facebook, guest)
- avatar_url: String (optional)
- is_active: Boolean
- is_premium: Boolean
- premium_expiry: DateTime (optional)
- total_games: Integer
- total_wins: Integer
- total_points: Integer
- rating: Float (ELO rating, default 1000.0)
- created_at: DateTime
- updated_at: DateTime
- last_login: DateTime (optional)
```

#### Game (games table)
Represents a single game instance.

```python
- id: UUID (Primary Key)
- lobby_id: UUID (Foreign Key to Lobby, optional)
- creator_id: UUID (Foreign Key to User)
- status: Enum (waiting, in_progress, completed, abandoned)
- game_type: Enum (bot, random, lobby)
- num_players: Integer
- current_round: Integer
- current_led_suit: String (optional)
- current_trump_suit: String (optional)
- game_state: JSON (full game state)
- winner_id: UUID (Foreign Key to User, optional)
- start_time: DateTime (optional)
- end_time: DateTime (optional)
- created_at: DateTime
- updated_at: DateTime
```

#### GamePlayer (game_players table)
Tracks player participation in games.

```python
- id: UUID (Primary Key)
- game_id: UUID (Foreign Key to Game)
- user_id: UUID (Foreign Key to User)
- player_position: Integer
- status: Enum (active, disconnected, eliminated, finished)
- hand: JSON (player's cards)
- caught_10s: JSON (caught ten cards)
- final_score: Integer
- joined_at: DateTime
- left_at: DateTime (optional)
- disconnected_at: DateTime (optional)
```

#### Round (rounds table)
Records individual rounds within a game.

```python
- id: UUID (Primary Key)
- game_id: UUID (Foreign Key to Game)
- round_number: Integer
- led_suit: String
- trump_suit: String (optional)
- plays: JSON (card plays in round)
- winner_id: String (optional)
- winning_card: String (optional)
- created_at: DateTime
```

## API Endpoints for Database Verification

### Health Check
```
GET /health
```

Returns database connection status:
```json
{
  "status": "healthy",
  "database": "connected",
  "websocket": "ready"
}
```

### Root Endpoint
```
GET /
```

Returns API status:
```json
{
  "message": "10S Card Game API is running",
  "status": "healthy",
  "version": "1.0.0"
}
```

## Database Migration with Alembic

To manage schema changes, use Alembic:

### Initialize Alembic (one-time setup)
```bash
alembic init alembic
```

### Create a Migration
```bash
alembic revision --autogenerate -m "Add new table"
```

### Apply Migrations
```bash
alembic upgrade head
```

### Revert Migrations
```bash
alembic downgrade -1
```

## Usage in Routes

Use FastAPI's dependency injection to get a database session:

```python
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/{user_id}")
async def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    return user
```

## Common Operations

### Query Examples

```python
# Get a user by username
user = db.query(User).filter(User.username == "john_doe").first()

# Get all active games
games = db.query(Game).filter(Game.status == GameStatus.IN_PROGRESS).all()

# Get player statistics
stats = db.query(PlayerStatistics).filter(
    PlayerStatistics.user_id == user_id
).first()

# Create a new user
new_user = User(
    id=str(uuid.uuid4()),
    username="new_player",
    email="player@example.com",
    password_hash="hashed_password"
)
db.add(new_user)
db.commit()
db.refresh(new_user)
```

## Troubleshooting

### Connection Error: "Cannot connect to PostgreSQL"
- Verify PostgreSQL is running
- Check if the server is accessible at `localhost:5432`
- Verify credentials in `.env` file match your PostgreSQL setup

### Tables Not Created
- Check the application logs during startup
- Verify the database user has CREATE TABLE permissions
- Try manually running: `python -c "from database import init_db; init_db()"`

### Permission Denied Error
- Ensure the PostgreSQL user (postgres) has necessary permissions
- Connect to PostgreSQL and run:
  ```sql
  ALTER USER postgres CREATEDB;
  ALTER USER postgres SUPERUSER;
  ```

## Performance Tips

1. **Indexing**: Key fields like `user_id`, `game_id`, and `username` are already indexed
2. **Connection Pooling**: The engine uses `pool_size=20` and `max_overflow=40`
3. **Query Optimization**: Use `.first()` instead of `.all()` when fetching single records
4. **Batch Operations**: Use bulk inserts for large datasets

## Security Considerations

1. **Change default password**: Update the PostgreSQL password from "postgres" to a strong password in production
2. **Environment variables**: Keep sensitive data in `.env` files (add to `.gitignore`)
3. **SQL Injection**: Always use ORM methods, never construct SQL strings
4. **Password hashing**: Always hash passwords using `passlib` before storing

## Next Steps

1. Implement authentication routes with JWT tokens
2. Create game management endpoints
3. Set up WebSocket handlers for real-time gameplay
4. Implement scoring and leaderboard functionality
5. Add ad serving and premium subscription management
