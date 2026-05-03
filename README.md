# 10S - Card Game

## Overview

10S is a strategic card game where players aim to catch as many 10s as possible to win.

### Game Rules

**Number of Players:** 2, 3, 4, 6, or 8 players

**Objective:** Catch as many 10s as possible

**Game Over:** When all the 10s have been caught

**Winning Conditions:**
1. The player or team with the most 10s wins
2. If two players or teams have the same count of 10s, the one with more points wins

---

## Point System

Cards are valued as follows:

- **10** = 100 points (highest value)
- **Ace** = 14 points
- **King** = 13 points
- **Queen** = 12 points
- **Jack** = 11 points
- **2, 3, 4, 5, 6, 7, 8, 9** = Face value points

### Game Features

- Card availability checker: Players can check if a particular card is left in the pile
- Time limit: Each player/team has 30 seconds per turn
- Elimination: If a player runs out of time, they (or their team) are eliminated. Their cards are redistributed to remaining players after shuffling

---

## Gameplay

### Card Distribution

| Players | Cards per Player | Deck(s) |
|---------|------------------|--------|
| 2       | 16               | 1      |
| 3       | 17               | 1      |
| 4       | 13               | 2 (highest valued) |
| 6       | 13               | 2 (highest valued) |
| 8       | 13               | 2 (highest valued) |

### Game Flow

1. Each player receives 5 cards to start
2. Players are shuffled to randomly select who starts
3. **Chaal (Round):**
   - Players must play a card of the same pattern/suit
   - Highest valued card wins the "Chaal"
4. **Trump Card:**
   - If a player doesn't have the required pattern, they can play a trump card (different pattern)
   - That pattern becomes the trump for the game
5. **Winning the Chaal:**
   - Highest card wins
   - Highest trump card wins if trumps are played
6. **Catching 10s:**
   - To catch a 10, a player must win two consecutive "Chaals" with one or more 10s

### Strategy & Communication

- Chat with teammates to share card details and plan strategy
- Coordinate with friends on when to play 10s
- Highlighted cards show which plays are legally available to you

---

## Monetization

### Revenue Model

**Advertising:** Display one advertisement before each game starts

---

## Development Setup

### Running the Application

#### Backend Server
```bash
cd App/backend
source venv/bin/activate  # or activate.bat on Windows
uvicorn src.main:app --reload
```
Backend runs on: `http://localhost:8000`

#### Frontend Server (Local Access)
```bash
cd App/frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

#### Frontend Server (Network Access - From Any Device)

**Your System IP:** `192.168.29.254`

Run the frontend with the `--host` flag to access from any device on your network:

```bash
cd App/frontend
npm run dev -- --host
```

This will display URLs like:
- Local: `http://localhost:5173`
- Network: `http://192.168.29.254:5173`

**From other devices on the same network, open:**
```
http://192.168.29.254:5173
```

### Environment Configuration

Create `.env` file in `App/frontend/` if network access is needed:
```
VITE_API_URL=http://192.168.29.254:8000
VITE_WS_URL=ws://192.168.29.254:8000
```

For local development only:
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```
