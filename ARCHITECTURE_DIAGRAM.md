# 10S Card Game - System Architecture

## 🏗️ High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Web Frontend          Mobile Frontend      Admin Dashboard    │
│   (React)              (React Native)        (React Web)        │
│                                                                 │
└───────────────────────────────────────────────────────────────┬─┘
                                                                  │
                                                                  ▼
                        ┌──────────────────────┐
                        │   Shared Code Lib    │
                        │  (Game Logic, Types) │
                        └──────────────────────┘
                                 ▲
                                 │
┌────────────────────────────────┼────────────────────────────────┐
│                    APPLICATION LAYER (Backend)                  │
├────────────────────────────────┼────────────────────────────────┤
│                                │                                │
│  ┌──────────────────────┐      ▼      ┌──────────────────────┐ │
│  │   FastAPI Server     │             │   Bot Engine         │ │
│  │                      │             │                      │ │
│  │ • Authentication     │             │ • Decision Making    │ │
│  │ • Game Management    │             │ • Card AI Logic      │ │
│  │ • Real-time Updates  │             │ • Difficulty Levels  │ │
│  │ • Player Services    │             │ • Game Integration   │ │
│  └──────────────────────┘             └──────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────┬───┘
                                                              │
                                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (Persistence)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   PostgreSQL Database              Redis Cache                 │
│   • Users & Auth                   • Sessions                  │
│   • Games & History                • Game State                │
│   • Lobbies & Matches              • Leaderboard              │
│   • Leaderboards                   • Rate Limiting             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Breakdown

### **1. Frontend Components**

#### **Web Frontend (`10S-frontend`)**
- **Framework**: React 18 + TypeScript
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Build Tool**: Vite

**Key Features:**
- Game UI with animated card dealing
- Real-time turn timer with color-coded feedback
- Chat system
- Player lobbies
- User profiles & leaderboards

**Recent Implementations:**
- Circular countdown timer (green → orange → red → blinking)
- Smooth 10 FPS timer updates
- Bot player names without ID suffixes
- Card pile elevation based on round

#### **Mobile Frontend (`10S-IOS`)**
- **Framework**: React Native + Expo
- **Features**: Same game experience optimized for mobile
- **Shares**: Common code from `10s-shared` library

#### **Shared Code (`10s-shared`)**
- **Purpose**: Centralized game logic and types
- **Components**:
  - Game rules & validation
  - Zustand stores (game state, auth, theme)
  - WebSocket event handlers
  - TypeScript interfaces
  - Utility functions

---

### **2. Backend Components**

#### **FastAPI Server (`10S-backend`)**
- **Language**: Python 3.x
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM

**API Endpoints:**
```
Authentication:
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout

Games:
  POST   /api/games/create
  GET    /api/games/{game_id}
  GET    /api/games/{game_id}/state

Lobbies:
  GET    /api/lobbies
  POST   /api/lobbies/create
  POST   /api/lobbies/{lobby_id}/join

Players:
  GET    /api/players/{player_id}
  PUT    /api/players/{player_id}/profile

WebSocket:
  WS     /ws/{game_id}/{user_id}?token={jwt}
```

**Message Types:**
```
game-state       → Full game state update
play-notification → Card played
trump-decided    → Trump suit announced
round-starting   → New round begins
game-ended       → Game over
```

#### **Bot Engine (`10S-bot-engine`)**
- **Language**: Python 3.x
- **Algorithm**: Heuristic-based decision making

**Difficulty Levels:**
1. **Easy**: Random valid moves
2. **Medium**: Basic strategy (follow rules + simple tactics)
3. **Hard**: Advanced analysis (hand assessment + probability)

**Integration:**
- Receives game state via API
- Makes decisions based on visible cards
- Sends moves to backend via REST/WebSocket
- Runs independently or embedded in backend

---

### **3. Admin Dashboard (`10S-admin`)**
- **Purpose**: System management & analytics
- **Features**:
  - User management
  - Bot configuration
  - Game statistics
  - Leaderboard management
  - Player reports

---

### **4. Data Layer**

#### **PostgreSQL Database**
```sql
-- Core Tables
users                    -- User accounts, auth
games                    -- Game instances
lobbies                  -- Lobby rooms
players_in_game          -- Player-game relationships
played_cards             -- Card play history
game_history             -- Completed games
leaderboards             -- Ranking data
```

#### **Redis Cache (Optional)**
- Session tokens
- Active game states
- Leaderboard cache
- Rate limiting

---

## 🔄 Data Flow Scenarios

### **Scenario 1: Player Joins Lobby**
```
1. Client: POST /api/lobbies/{id}/join
2. Backend: Validate player → Create player_in_game record
3. Backend: Broadcast via WebSocket: player-joined event
4. All Clients: Update lobby UI with new player
```

### **Scenario 2: Game Round Execution**
```
1. Backend: Trump decided → Set trump_suit
2. Backend: Broadcast: trump-decided event
3. Current Player Gets Turn:
   └─ Backend sends: turn-started event with hand
   └─ Frontend starts timer (60 seconds)
   └─ Timer updates 10x/second with color feedback
4. Player Plays Card:
   └─ WebSocket: play-card message
   └─ Backend validates move
   └─ Backend broadcasts: play-notification
   └─ All clients update card pile
5. Round Completes:
   └─ Backend: Calculate winner
   └─ Backend: Update scores
   └─ Broadcast: round-winner event
6. New Round:
   └─ Backend: Deal cards
   └─ Broadcast: round-starting event
   └─ Animation plays: "Dealing cards..."
```

### **Scenario 3: Bot Player Turn**
```
1. Backend: Game state updated, bot's turn
2. Backend → Bot Engine: Current game state
3. Bot Engine: Analyze hand + board state
4. Bot Engine: Decision making (heuristics)
5. Bot Engine → Backend: Play card action
6. Backend: Validate move (same as human)
7. Backend: Broadcast card play to all clients
8. Clients: Animate bot's card (with bot name)
```

### **Scenario 4: Game Completion**
```
1. Last round ends
2. Backend: Calculate final scores
3. Backend: Update leaderboard
4. Backend: Update user stats
5. Broadcast: game-ended event
6. All Clients: Show game summary with results
7. Admin Dashboard: Receives game completion event
8. Update analytics & statistics
```

---

## 🔐 Authentication & Security

```
Registration:
  User → Client (React)
         → Backend: Hash password
         → DB: Store user
         ← Return user_id

Login:
  User → Client: email + password
         → Backend: Verify credentials
         ← JWT Token (access_token + refresh_token)
         Client stores in localStorage/secure storage

Game Join:
  Client: Include JWT in WebSocket header
  Backend: Validate token
  Backend: Verify user in database
  Backend: Grant game access
```

---

## 📊 Performance Considerations

### **Real-time Updates**
- **WebSocket** for game state changes (latency < 100ms)
- **10 FPS timer updates** for smooth animations
- **Debounced state syncs** to reduce DB writes

### **Scaling Strategy**
```
Horizontal Scaling:
├─ Multiple FastAPI instances (load balanced)
├─ PostgreSQL with read replicas
├─ Redis for distributed caching
├─ Bot Engine as separate service

Vertical Scaling:
├─ Database optimization (indexing)
├─ Connection pooling
├─ Query optimization
└─ Caching strategy
```

---

## 🚀 Deployment Architecture

```
┌────────────────────────────────────────┐
│         GitHub Repositories            │
│  • 10S-frontend    (Web)               │
│  • 10S-IOS         (Mobile)            │
│  • 10s-shared      (Shared code)       │
│  • 10S-backend     (API)               │
│  • 10S-bot-engine  (AI)                │
│  • 10S-admin       (Admin panel)       │
└────────────────────────────────────────┘
              ▼ (CI/CD)
┌────────────────────────────────────────┐
│      GitHub Actions / Workflows        │
│  • Lint & Test                         │
│  • Build Docker images                 │
│  • Push to registry                    │
│  • Deploy to cloud                     │
└────────────────────────────────────────┘
              ▼
┌────────────────────────────────────────┐
│      Cloud Infrastructure              │
│  • Docker Containers                   │
│  • Kubernetes Orchestration            │
│  • Load Balancing                      │
│  • Auto-scaling                        │
└────────────────────────────────────────┘
              ▼
┌────────────────────────────────────────┐
│       Running Services                 │
│  • Web Server (Frontend)               │
│  • API Server (Backend)                │
│  • Bot Service                         │
│  • Database                            │
│  • Cache                               │
│  • Admin Dashboard                     │
└────────────────────────────────────────┘
```

---

## 📈 Technology Stack Matrix

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, TypeScript | Web UI |
| **Mobile** | React Native, Expo | iOS/Android apps |
| **Shared** | TypeScript, Zustand | Common code |
| **Backend** | FastAPI, Python | API server |
| **Bot** | Python, Heuristics | AI opponent |
| **Admin** | React, TypeScript | Management UI |
| **Database** | PostgreSQL | Persistent data |
| **Cache** | Redis | Session & state cache |
| **Real-time** | WebSocket | Live game updates |
| **Auth** | JWT, OAuth2 | User authentication |
| **DevOps** | Docker, GitHub Actions | Deployment pipeline |

---

## 📝 Environment Configuration

### **Development**
```
Frontend:   localhost:5173 (Vite dev server)
Backend:    localhost:8000 (FastAPI)
Database:   localhost:5432 (PostgreSQL local)
Bot:        localhost:8001 (Optional)
```

### **Production**
```
Frontend:   https://game.example.com
Backend:    https://api.example.com
WebSocket:  wss://api.example.com/ws
Database:   Managed PostgreSQL (Cloud provider)
Cache:      Managed Redis (Cloud provider)
```

---

## 🔗 Inter-Service Communication

```
┌─────────────────────────────────────────────────────────────┐
│                  Communication Protocols                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Web → Backend:      HTTP/HTTPS (REST)                     │
│  Web → Backend:      WebSocket Upgrade (Real-time)         │
│  Mobile → Backend:   HTTP/HTTPS (REST)                     │
│  Mobile → Backend:   WebSocket Upgrade (Real-time)         │
│  Bot → Backend:      HTTP/REST (Poll game state)           │
│  Backend ← Bot:      HTTP/REST (Accept moves)              │
│  Backend → Database: SQL (Direct connection)               │
│  Backend → Cache:    Protocol (Memcached/Redis)            │
│  Admin ← Backend:    HTTP/HTTPS (Admin API)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Future Enhancements

- [ ] Machine Learning for bot improvements
- [ ] Tournament mode & rankings
- [ ] Replay system with card-by-card review
- [ ] In-game voice/video chat
- [ ] Social features (friend lists, guilds)
- [ ] Monetization (cosmetics, passes)
- [ ] Mobile app optimization
- [ ] Advanced analytics dashboard

---

## 📚 Repository Links

| Component | Repository | Status |
|-----------|-----------|--------|
| Web Frontend | [10S-frontend](https://github.com/CarpenterLokendra/10S-frontend) | ✅ Active |
| Mobile | [10S-IOS](https://github.com/CarpenterLokendra/10S-IOS) | ✅ Active |
| Shared Code | [10s-shared](https://github.com/CarpenterLokendra/10s-shared) | ✅ Active |
| Backend API | [10S-backend](https://github.com/CarpenterLokendra/10S-backend) | ✅ Active |
| Bot Engine | [10S-bot-engine](https://github.com/CarpenterLokendra/10S-bot-engine) | ✅ Active |
| Admin Panel | [10S-admin](https://github.com/CarpenterLokendra/10S-admin) | ✅ Active |

---

**Last Updated**: June 2026
**Architecture Version**: 2.0
