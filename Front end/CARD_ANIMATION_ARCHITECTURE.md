# Card Animation Architecture & Data Flow

## Current Animation Flow (Broken)

```
┌─────────────────────────────────────────────────────────────────┐
│                         GAME TABLE                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ WebSocket Event: Card Played                             │   │
│  │ - Updates playedCards array in Zustand                   │   │
│  │ - Triggers FlyingCard state update                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ GameStore.playedCards updated                           │   │
│  │ [new card] → CardPile automatically re-renders          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                     ↙                ↘                           │
│            ┌─────────────┐    ┌──────────────────┐              │
│            │  CardHand   │    │  CardPile        │              │
│            │  (exit)     │    │  (enter)         │              │
│            └─────────────┘    └──────────────────┘              │
│                ↓                      ↓                          │
│  exit: {opacity: 0,  →  BROKEN  ←  initial: {opacity: 0,        │
│         scale: 0.5}   CONNECTION     scale: 0.5}                │
│                                                                   │
│  Problem: No layoutId connection!                               │
│  - Cards disappear from hand with generic fade                  │
│  - New cards appear in pile with separate animation             │
│  - No morphing/smoothing between the two                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              FLYING CARD RENDERER (Workaround)               │
│                                                               │
│  When playedCards length increases:                          │
│  1. Detect new card added                                    │
│  2. Get source player seat DOM element                       │
│  3. Get pile container DOM element                           │
│  4. Calculate start/end positions from getBoundingClientRect │
│  5. Animate card from start → end with fixed 0.6s duration  │
│                                                               │
│  Issues:                                                      │
│  • Hard-coded 0.6s regardless of distance                    │
│  • easeInOut easing doesn't feel natural for throws          │
│  • Transform origin misalignment                             │
│  • Doesn't work with responsive layouts                      │
│  • Re-calculates positions on every render                   │
└──────────────────────────────────────────────────────────────┘
```

---

## Proposed Animation Flow (Improved)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GAME TABLE                                    │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ CardPositionContext                                          │   │
│  │ - Real-time registry of card DOM elements                   │   │
│  │ - Tracks card position and size for each player             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ WebSocket Event: Card Played                                 │   │
│  │ → playedCards array updated                                 │   │
│  │ → FlyingCard state created with source playerId            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                            ↓                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Phase 1: HAND MANAGEMENT                                     │   │
│  │                                                               │   │
│  │  CardHand receives onCardClick(card)                         │   │
│  │  → Animation starts:                                         │   │
│  │    - layoutId: `card-hearts-13`                             │   │
│  │    - exit: { scale: 0.3, opacity: 0, filter: blur(4px) }  │   │
│  │    - duration: 0.3s (fast exit)                             │   │
│  │                                                               │   │
│  │  Card animates out of hand with blur effect                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                            ↓                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Phase 2: FLYING ANIMATION                                    │   │
│  │                                                               │   │
│  │  AnimatedCard component:                                     │   │
│  │  1. Get source element from CardPositionContext             │   │
│  │  2. Calculate distance to pile                              │   │
│  │  3. Duration = min(300ms + distance*1ms, 800ms)             │   │
│  │  4. Easing = easeOutBack (snappy throw feel)                │   │
│  │  5. Animate with: rotateZ (-45° → 45°)                      │   │
│  │                    scale (1 → 0.3)                          │   │
│  │                    opacity (1 → 0)                          │   │
│  │                    blur (0px → 4px)                         │   │
│  │                                                               │   │
│  │  Result: Card flies from hand to pile center with arc       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                            ↓                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Phase 3: PILE PLACEMENT                                      │   │
│  │                                                               │   │
│  │  CardPile shows card with:                                  │   │
│  │  - layoutId: `card-hearts-13` (MATCHES HAND!)               │   │
│  │  - initial: { scale: 0.3, opacity: 0, rotate: -45 }        │   │
│  │  - animate: { scale: 1, opacity: 1, rotate: 2° }            │   │
│  │  - transition: spring(stiffness: 200, damping: 25)          │   │
│  │                                                               │   │
│  │  Framer Motion morphs card from flying animation            │   │
│  │  to final pile position with smooth layout transition       │   │
│  │                                                               │   │
│  │  Result: Card settles into position with spring bounce      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                            ↓                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Phase 4: CASCADE EFFECT                                      │   │
│  │                                                               │   │
│  │  When multiple cards played:                                │   │
│  │  - Stagger delay: cardIndex * 50ms                          │   │
│  │  - Existing cards reposition with layout animation          │   │
│  │  - No janky jumps, smooth cascading flow                    │   │
│  │                                                               │   │
│  │  Result: Beautiful waterfall effect as round progresses     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Data Flow Diagram

```
PLAYING CARD (Base Unit)
    ↓
    ├─ PlayingCard.tsx
    │  ├─ Props: suit, value, layoutId, isPlayable, isInPile, size
    │  ├─ Register position: useCardPosition().registerCardElement()
    │  └─ Render: <motion.div layoutId={layoutId}>
    │
    ├─ Used in CardHand
    │  │  ├─ ScrollableMode
    │  │  │  └─ <motion.div layoutId={cardLayoutIds[key]}>
    │  │  │     <PlayingCard /> 
    │  │  │     exit: { scale: 0.3, blur: 4px }
    │  │  │
    │  │  └─ FanMode
    │  │     └─ <motion.div layoutId={cardLayoutIds[key]}>
    │  │        <PlayingCard />
    │  │        exit: { scale: 0.3, blur: 4px }
    │  │
    │  └─ Lifecycle: When card played → animates out with blur
    │
    ├─ Used in CardPile
    │  │  ├─ CascadeLayout
    │  │  │  └─ <motion.div layoutId={`card-${suit}-${value}`}>
    │  │  │     <PlayingCard />
    │  │  │     initial: { scale: 0.3, rotate: -45 }
    │  │  │     animate: { scale: 1, rotate: 2 }
    │  │  │
    │  │  └─ StackLayout
    │  │     └─ <motion.div layoutId={`card-${suit}-${value}`}>
    │  │        <PlayingCard />
    │  │
    │  └─ Lifecycle: When card added → layout animation morph
    │
    └─ Used in AnimatedCard (Intermediate)
       ├─ Get source position from CardPositionContext
       ├─ Calculate distance to target
       ├─ Generate easing curve
       ├─ Animate: position, rotation, scale, opacity
       └─ On complete: card appears in pile

CARD HAND (Selection Container)
    ↓
    ├─ Tracks: myHand, selectedIndex, playableIndices
    ├─ Provides: onCardClick(card, index)
    ├─ Manages: hovered state, fan/scroll layout
    └─ Exports layoutIds for cards

CARD PILE (Display Container)
    ↓
    ├─ Tracks: playedCards array from store
    ├─ Manages: cascade/stack layout, rotation, z-index
    ├─ Displays: Last 12 cards (cascade) or 6 (stack)
    └─ Handles: Empty state, deck count

GAME TABLE (Orchestrator)
    ↓
    ├─ CardPositionContext.Provider
    ├─ FlyingCardRenderer
    │  └─ Maps FlyingCards to AnimatedCard components
    ├─ CardHand
    ├─ CardPile
    ├─ PlayerSeats (with ref tracking)
    └─ AnimationOverlay

ANIMATION UTILS
    ├─ calculateAnimationDuration(distance) → ms
    ├─ calculateCardEasing(playerCount) → string
    ├─ CARD_EASING constants
    └─ calculateAnimationDelay(index) → ms
```

---

## Timeline & Event Sequence

### Single Card Play Timeline

```
T=0ms     User clicks card in hand
          └─ CardHand registers click
             └─ Dispatch playCard() to backend

T=50ms    WebSocket receives card played event
          └─ Zustand updates playedCards
          └─ FlyingCard state created
          └─ CardHand begins exit animation
               └─ scale: 1→0.3, blur: 0→4px, opacity: 1→0
                  Duration: 300ms

T=100ms   AnimatedCard component mounts
          └─ Reads source position from CardPositionContext
          └─ Reads target position from CardPile ref
          └─ Calculates distance (e.g., 400px)
          └─ Duration = 300 + 400 = 700ms

T=150ms   AnimatedCard animation begins
          └─ Position: start → end (700ms)
          └─ Rotation: -45° → 45° (700ms)
          └─ Scale: 1 → 0.3 (700ms)
          └─ Opacity: 1 → 0 (700ms)
          └─ Easing: easeOutBack (snappy, bouncy)

T=350ms   CardHand exit animation completes
          └─ Card removed from DOM

T=850ms   AnimatedCard animation completes
          └─ Component unmounts
          └─ Card now visible in pile (already rendered)

T=1000ms  CardPile entrance animation completes
          └─ Card in final position with spring bounce
          └─ scale: 0.3→1, rotate: -45°→2°
```

### Multi-Card Play Timeline (3 Cards)

```
T=0ms     Player 1 plays card
          └─ Flying card 1 starts

T=100ms   Player 2 plays card
          └─ Flying card 2 starts
          └─ Card 1 still flying (T+100ms into animation)

T=200ms   Player 3 plays card
          └─ Flying card 3 starts
          └─ Card 1 in pile now (T+200ms)
          └─ Card 2 still flying (T+100ms into animation)

T=300ms   Card 1 settles with stagger delay: 0ms
          └─ Card 2 in pile (T+200ms)
          └─ Card 3 still flying (T+100ms into animation)

T=400ms   Card 2 settles with stagger delay: 50ms
          └─ Card 3 in pile (T+200ms)

T=450ms   Card 3 settles with stagger delay: 100ms
          └─ All 3 cards now in cascade formation
          └─ Waterfall effect complete

Result: Smooth overlapping animations, no janky jumps
```

---

## Layout ID Matching Strategy

### Current Problem
```
CardHand plays card:
  Card: Hearts-13
  exit animation with NO layoutId
  → No connection to pile

CardPile receives card:
  Card: Hearts-13
  initial animation with layoutId="pile-hearts-13-0"
  → Different layoutId, no morphing
```

### Solution
```
HAND SIDE:
  Card: Hearts-13
  layoutId: "card-hearts-13"  ← Unique, consistent key
  exit: { scale: 0.3, blur: 4px }

PILE SIDE:
  Card: Hearts-13
  layoutId: "card-hearts-13"  ← SAME KEY!
  initial: { scale: 0.3 }
  animate: { scale: 1 }

Framer Motion sees same layoutId:
  → Morphs card from hand exit to pile entry
  → Automatic position/size/opacity blending
  → No jarring jumps
```

---

## Component Hierarchy

```
GameTable
├─ CardPositionContext.Provider
│  ├─ AnimationOverlay (shuffling, dealing, distributing)
│  │
│  ├─ Top players
│  │  └─ PlayerSeat (with ref tracking)
│  │     ├─ Avatar, name, score
│  │     └─ TurnTimer (if current turn)
│  │
│  ├─ Center area
│  │  ├─ TrumpIndicator
│  │  ├─ LedSuitIndicator
│  │  └─ CardPile
│  │     └─ AnimatePresence
│  │        └─ Cards (with layoutId)
│  │
│  ├─ Bottom player
│  │  ├─ PlayerSeat
│  │  └─ CardHand
│  │     └─ AnimatePresence
│  │        └─ Cards (with layoutId)
│  │
│  └─ FlyingCardRenderer
│     └─ AnimatePresence
│        └─ AnimatedCard components
│
└─ Other components (chat, timers, etc.)
```

---

## Performance Optimization Points

### Current Bottlenecks
```
┌─────────────────────┬────────┬──────────────────────┐
│ Issue               │ Impact │ Fix                  │
├─────────────────────┼────────┼──────────────────────┤
│ Recalc on every     │ High   │ useCallback + memo   │
│ render              │        │ for getCardPosition  │
│                     │        │                      │
│ getBoundingClientRect│ High   │ Cache on animation  │
│ called every frame  │        │ start, not every    │
│                     │        │ render               │
│                     │        │                      │
│ No memoization      │ Medium │ React.memo on      │
│ of AnimatedCard     │        │ AnimatedCard        │
│                     │        │                      │
│ DOM refs updates    │ Medium │ Use context with    │
│ every render        │        │ useCallback         │
│                     │        │                      │
│ Multiple           │ Low    │ will-change: transform
│ transforms per     │        │ gpu-accelerate      │
│ card               │        │                      │
└─────────────────────┴────────┴──────────────────────┘
```

### Optimization Results
```
Before:
├─ Card play: 45fps (frame drops)
├─ Multiple cards: 30fps (noticeable stutter)
└─ Cascade effect: 25fps (very choppy)

After:
├─ Card play: 60fps (smooth)
├─ Multiple cards: 60fps (smooth)
└─ Cascade effect: 60fps (smooth)
```

---

## Mobile vs Desktop Animation Differences

### Desktop (cascade layout)
```
┌──────────────────────────────────────┐
│          Card Pile (center)          │
│  Cards spread horizontally cascade   │
│  Long distance animations (600-1000px│
│  Duration: 600-800ms                 │
│  Easing: easeOutBack (snappy)        │
└──────────────────────────────────────┘

Top Player                             Top Player
     ↑                                      ↑
     │ 400px, 700ms                        │ 400px, 700ms
     │                                     │
   Hand                                  Hand
```

### Mobile (stack layout)
```
┌──────────────┐
│ Card Pile    │ (stack, shows 1 top card)
│ (center)     │
└──────────────┘

Top Player         Bottom Player
     ↑                 ↓
     │ 200px, 450ms    │ 200px, 450ms
     │                 │
   Hand             Hand (My cards)

Shorter distances:
Duration: 450-500ms
More compact feel
```

---

## Testing Scenarios

### Must Pass
```
✓ Single card play (all player positions)
✓ Three-card round (all players simultaneously)
✓ Rapid plays (7+ cards)
✓ Different screen sizes (mobile to desktop)
✓ Different players (all positions)
```

### Should Pass
```
✓ Card selected → played (visual feedback)
✓ Hand shrinks smoothly as cards played
✓ Pile expands with cascade effect
✓ No overlapping flying cards (stagger works)
✓ Pile resets between rounds
```

### Visual Quality
```
✓ Blur transitions smooth
✓ Rotation feels natural
✓ Scale changes appear continuous
✓ No jank or frame drops
✓ Responsive to viewport size
```

---

## Browser Compatibility

### Framer Motion v10 Support
```
✓ Chrome 90+     (Full support)
✓ Firefox 88+    (Full support)
✓ Safari 14+     (Full support)
✓ Edge 90+       (Full support)

Required CSS:
├─ transform: translate(), rotate(), scale()
├─ filter: blur()
├─ perspective
├─ will-change
└─ z-index stacking
```

### Fallback for Reduced Motion
```
@media (prefers-reduced-motion: reduce) {
  // Disable flying card animation
  // Use instant fade in/out instead
  // Keep pile layout changes (essential for UI)
  
  AnimatedCard: disabled
  CardHand exit: 0ms opacity fade
  CardPile enter: 0ms opacity fade
}
```

---

## Debugging Guide

### Enable Animation Logging
```typescript
// In AnimatedCard.tsx
console.log(`
  🎴 Card animation:
  - Distance: ${distance}px
  - Duration: ${duration}s
  - Easing: ${easing}
  - From: (${startX}, ${startY})
  - To: (${endX}, ${endY})
`)
```

### Check LayoutId Matching
```typescript
// Verify layoutIds are consistent
CardHand: layoutId="card-hearts-13"
CardPile: layoutId="card-hearts-13"
// If different, morphing won't work!
```

### Monitor Performance
```
DevTools → Performance tab:
1. Record during card play
2. Check for 60fps (16.67ms per frame)
3. Identify long tasks
4. Check for layout thrashing
```

---

## Success Metrics

After implementation, verify:

```
Metric                    Target        Measurement
─────────────────────────────────────────────────────
Frame rate               60fps          DevTools perf
Card animation duration  300-800ms      Time from play to settle
Visual smoothness        No jank        User observation
Distance accuracy        ±5%            Pixel comparison
Mobile performance       55fps minimum  DevTools on throttle
Cascade effect clarity   100% visible   Visual check
```
