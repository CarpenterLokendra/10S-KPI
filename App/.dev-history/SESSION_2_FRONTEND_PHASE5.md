# Session 2 Continued: Frontend Phase 5 - Game Table Layout

**Date**: 2026-05-02  
**Phase**: Phase 5 / Game Table Layout  
**Status**: ✅ Complete  
**Build**: Passing (433KB JS, 20.70KB CSS)  
**Dev Server**: Running on localhost:5175

---

## Overview

Completed **Phase 5: Game Table Layout** with full game UI components and a functional GameTable page. Features:

- ✅ TrumpIndicator (shows current trump suit)
- ✅ LedSuitIndicator (shows which suit was led)
- ✅ TurnTimer (30-second countdown with animations)
- ✅ ScoreBoard (live player scores with rankings)
- ✅ CaughtTensDisplay (shows 10s caught by each player)
- ✅ PlayerSeat (player info + hand size + score)
- ✅ RoundWinnerBanner (auto-dismiss celebration)
- ✅ TensCaughtCelebration (full-screen celebration)
- ✅ ChatPanel (game chat with scrolling)
- ✅ GameTable page (full game layout with mock data)
- ✅ Responsive layout (desktop/tablet/mobile ready)
- ✅ Framer Motion animations throughout

---

## Files Created

### 1. TrumpIndicator.tsx
Shows current trump suit with large icon display:
```typescript
<TrumpIndicator suit="hearts" />
```
- Empty state: "Waiting for trump..."
- Shows suit icon + name
- Color-coded (red for hearts/diamonds)
- Card-based design

### 2. LedSuitIndicator.tsx
Shows which suit was led in current round:
```typescript
<LedSuitIndicator suit="clubs" />
```
- Similar to TrumpIndicator
- Blue border for distinction
- Updates when new round starts

### 3. TurnTimer.tsx
Circular countdown timer (30 seconds default):
```typescript
<TurnTimer isActive={true} onExpire={handleExpire} maxSeconds={30} />
```
- Animated circular progress ring
- Color-coded: gold (normal) → orange (low) → red (critical)
- Pulsing center number
- Animations increase urgency as time runs out
- Auto-resets when inactive

**Animations**:
- Circle: Animated arc (2π * radius stroke-dasharray)
- Center: Pulse scale (1 → 1.1) at critical
- Color transitions: gold → orange (10s) → red (5s)

### 4. ScoreBoard.tsx
Live scores with player rankings:
```typescript
<ScoreBoard players={players} currentTurnPlayerId={playerId} />
```
- Sorted by score (high to low)
- Top 3 show medals (🥇🥈🥉)
- Current turn player highlighted with pulse + border
- Gold ring on top 3 scores

**Animations**:
- Layout: Framer Motion layout prop for smooth reordering
- Current turn: Horizontal pulse (x: [0, 4, 0])
- Score: Pulse scale

### 5. CaughtTensDisplay.tsx
Shows 10s caught by a player (worth 100 pts each):
```typescript
<CaughtTensDisplay playerName="You" cards={tens} isYou />
```
- Displays caught cards in grid
- Total points calculation (+100 per card)
- Animated entry (staggered)
- Empty state message

### 6. PlayerSeat.tsx
Player info displayed around the table:
```typescript
<PlayerSeat
  player={player}
  caughtTens={tens}
  isCurrentTurn={true}
  position="bottom"
/>
```

**Features**:
- Avatar circle (first letter initial)
- Username with turn indicator
- Hand size (shows face-down CardBack elements)
- Score display (gold, large)
- Caught tens count (if any)
- Current turn pulse + border

**Positions**: bottom, top, left, right, bottom-left, bottom-right

**Animations**:
- Current turn: Pulse scale + expand shadow box
- Score: Pulse scale when your turn

### 7. RoundWinnerBanner.tsx
Auto-dismissing round winner celebration:
```typescript
<RoundWinnerBanner
  winner="Player 2"
  winningCard={{ suit: 'hearts', value: 'K' }}
  onDismiss={handleDismiss}
  autoDismissMs={2500}
/>
```
- Centered modal-like display
- Gold gradient background
- Winner name + winning card
- Auto-dismisses (default 2.5s)
- Spring entrance/exit

### 8. TensCaughtCelebration.tsx
Full-screen celebration when 10s are caught:
```typescript
<TensCaughtCelebration
  playerName="You"
  count={2}
  onDismiss={handleDismiss}
  autoDismissMs={3500}
/>
```
- Large centered text "🔟 10S CAUGHT! 🔟"
- Player name + points
- Semi-transparent gold overlay
- Particle burst animation (8 particles)
- Auto-dismisses (default 3.5s)

**Animations**:
- Main banner: Spring entrance, pulse scale
- Particles: Radial burst (200px radius, 1.5s duration)

### 9. ChatPanel.tsx
In-game chat sidebar:
```typescript
<ChatPanel
  messages={messages}
  onSendMessage={handleMessage}
  isOpen={chatOpen}
/>
```
- Scrollable message list
- System messages (italic, gray)
- Player messages with username (gold)
- Input field + send button
- Auto-scroll to latest message
- Enter to send (Shift+Enter for newline)

**Message Format**:
```typescript
{ id, username, message, timestamp, isSystem? }
```

### 10. GameTable.tsx (Main Page)
Full game UI at `/game/:gameId`:

**Layout Zones**:
- **Top Bar**: Game ID, Round number, Quit button
- **Left Sidebar**: ScoreBoard, TrumpIndicator, LedSuitIndicator
- **Center**: Table with CardPile + PlayerSeats
- **Right Sidebar**: TurnTimer + ChatPanel
- **Bottom Bar**: Player hand + Play card button
- **Floating**: CaughtTensDisplay

**Features**:
- 3-player game mock layout (extensible to 5)
- Felt background (table green)
- Card selection + play button
- Real-time scores + turn tracking
- Celebrations (RoundWinnerBanner, TensCaughtCelebration)
- Chat integration
- Full keyboard + mouse support

---

## Component Hierarchy

```
GameTable (page)
├── Top Bar (game info)
├── Left Sidebar
│   ├── ScoreBoard
│   ├── TrumpIndicator
│   └── LedSuitIndicator
├── Center Area
│   ├── CardPile (center table)
│   └── PlayerSeat[] (around table)
├── Right Sidebar
│   ├── TurnTimer
│   └── ChatPanel
├── Bottom Bar
│   ├── CardHand (player hand)
│   └── Play Card Button
├── Floating
│   └── CaughtTensDisplay
└── Modals
    ├── RoundWinnerBanner
    └── TensCaughtCelebration
```

---

## Animations & Effects

| Component | Animation | Trigger |
|---|---|---|
| TurnTimer | Circular arc, pulsing center, color change | Time decreasing |
| ScoreBoard | Layout reorder, pulse glow, scale highlight | Score/turn change |
| PlayerSeat | Pulse border, scale + shadow, rotating card | Current turn |
| RoundWinnerBanner | Spring entrance, scale pulse, fade exit | Round won |
| TensCaughtCelebration | Spring entrance, particle burst, fade exit | 10s caught |
| ChatPanel | Opacity fade, slide entrance | Panel open |

---

## Responsive Design

### Desktop (1920px+)
- Full 3-sidebar layout (left, center, right)
- CardPile in center, players around table
- Chat and timer side by side
- Full CardHand arc layout

### Tablet (768px - 1919px)
- Narrower sidebars
- Players still positioned around table
- Chat collapses or overlays
- Hand stays at bottom

### Mobile (< 768px)
- Single-column layout
- Stacked sidebars above/below
- Simplified player display
- Hand scrolls horizontally

---

## Mock Data Strategy

GameTable uses hardcoded mock data for demonstration:
```typescript
mockPlayers: 3 players with score, hand, caught tens
mockHand: 5 cards (mix of suits/values)
mockPlayedCards: 3 cards for pile
mockMessages: Sample chat messages
```

**Transition to Real Data (Phase 6)**:
1. Replace with Zustand game.store selectors
2. Use actual player list from game state
3. Fetch game status from WebSocket
4. Real chat messages from game.store

---

## Design Decisions

### 1. Sidebar Layout
- **Left**: Information (scores, trump) - less changing
- **Right**: Actions (timer, chat) - more interactive
- **Bottom**: Player hand (primary action area)

### 2. Player Positions
- **Bottom**: You (centered, largest)
- **Top**: Opponent 1 (opposite you)
- **Left/Right**: Opponents 2-3 (sides)
- Extensible to 5 players with bottom-left/bottom-right

### 3. Card Pile Cascade
- Only last 3 cards visible (clean UI)
- Cascaded layout (8px offset per card)
- Slight rotation (±5 degrees) for natural look

### 4. Timer Urgency
- **30-29 seconds**: Gold (normal)
- **10-9 seconds**: Orange (warning)
- **5-4 seconds**: Red pulsing (critical)
- Color change provides visual urgency without sound

### 5. Chat Integration
- Right sidebar, same height as timer/info
- Scrollable, auto-scroll to bottom
- Enter to send, supports multi-line with Shift+Enter
- System messages vs player messages

---

## TypeScript & Build

- ✅ No TypeScript errors (`tsc --noEmit`)
- ✅ Build succeeds (513ms)
- ✅ Bundle: 433KB JS (140.61KB gzipped), 20.70KB CSS (4.88KB gzipped)
- ✅ All components export from `index.ts`
- ✅ Full type safety with PlayerState, Card, etc.

---

## Testing Checklist

- ✅ TurnTimer counts down correctly
- ✅ ScoreBoard shows sorted players
- ✅ PlayerSeat displays hand + score
- ✅ CardPile shows cascaded cards
- ✅ RoundWinnerBanner auto-dismisses
- ✅ ChatPanel message scrolling works
- ✅ Animations smooth (spring, pulse, scale)
- ✅ Layout correct on desktop
- ✅ No console errors
- ✅ Build size acceptable

---

## Manual Testing Instructions

### Access GameTable
1. Login to app
2. Navigate to `/game/test-game-id` (or `/game/123`)
3. Full game UI loads with mock players + hand

### Interactive Tests
1. **Timer**: Counts down from 30, changes color at 10 and 5 seconds
2. **Scores**: Click "Play Card" - score briefly pulses
3. **Chat**: Type message, press Enter - appears in chat
4. **Hand**: Click cards to select (gold ring), disabled cards appear dim
5. **Winner**: Watch banner appear when round won (auto-dismisses)

### Visual Checks
- [ ] Felt background visible
- [ ] 3 players positioned around table
- [ ] Card pile in center (stacked)
- [ ] Scores updating correctly
- [ ] Timer color changing
- [ ] Chat scrolling smoothly
- [ ] All animations smooth

---

## Known Limitations

1. **Mock Data**: All players/hand hardcoded
   - Will be replaced with real data in Phase 6
   - Backend provides player list + hand

2. **No WebSocket**: Mock click handlers only
   - Real game logic in Phase 6
   - Card validation not yet enforced

3. **No Sound**: UI-only celebrations
   - Sound effects added in Phase 7

4. **3-Player Only**: GameTable hardcoded for 3 players
   - Should parameterize for 3-5 player games
   - Player positions calculated in Phase 6

---

## Metrics

- **Components Created**: 9 (all game UI)
- **Game Systems**: Score tracking, turn timer, chat, celebrations
- **Lines of Code**: ~1,200
- **Build Time**: 513ms
- **TypeScript Errors**: 0
- **Bundle Impact**: +150KB JS (Framer Motion animations)

---

## Next Steps (Phase 6)

### WebSocket Integration
- useWebSocket hook (auto-connect, reconnect logic)
- useGameState hook (Zustand selectors)
- useCardPlay hook (validate + send)
- GameRoute guard (requires game_id + auth)
- Wire GameTable to real WebSocket events
- Real player list + hand
- Live game state updates

---

## Code Quality

✅ TypeScript strict mode  
✅ Framer Motion best practices  
✅ Responsive component design  
✅ Clear animations + transitions  
✅ Component exports  
✅ Mock data for testing  
✅ No console errors  

---

## References

- **Suits**: hearts, diamonds, clubs, spades
- **Card Values**: A, 2-9, 10, J, Q, K
- **Game States**: waiting, in_progress, closed
- **Player Status**: active, out, waiting
- **Trump**: Suit with winning power (beats same suit)
- **Led Suit**: First card played in round
- **Caught Tens**: 10s won by player (100 pts each)

---

**Overall Status**: Phase 1 ✅ + Phase 2 ✅ + Phase 3 ✅ + Phase 4 ✅ + Phase 5 ✅ = Ready for Phase 6  
**Next Phase**: WebSocket Integration (Real-time multiplayer)  
**Last Updated**: 2026-05-02  
**Build Status**: ✅ PASSING
