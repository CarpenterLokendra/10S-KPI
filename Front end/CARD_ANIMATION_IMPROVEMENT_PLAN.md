# Card Animation Improvement Plan

## Current State Analysis

### Problem Summary
The card animation when playing cards (from player hand to card pile) has the following issues:
1. **Missing source position tracking**: Cards don't smoothly animate from player seat position to pile
2. **No shared layout animations**: Each component handles animations independently, missing Framer Motion's shared layout capability
3. **Inconsistent layoutId usage**: Only CardPile assigns layoutIds; CardHand doesn't track played cards for animation
4. **Fixed animation parameters**: Hard-coded 0.6s duration and easeInOut timing not optimized for distance
5. **Positioning context issues**: Flying card animation uses absolute positioning but doesn't properly account for viewport changes

### Current Implementation Architecture

#### 1. Card Components Structure
```
PlayingCard (motion.div with layoutId prop)
├─ Renders card image
├─ Has shadow and scale animations
├─ Supports isInPile and isPlayable states

CardHand (card selection container)
├─ Fan layout for <= 7 cards
├─ Scrollable layout for > 7 cards on mobile
├─ AnimatePresence with initial/animate/exit states
├─ NO layoutId tracking for exit animation

CardPile (card display container)
├─ Cascade or stack layout
├─ AnimatePresence mode="popLayout"
├─ Assigns layoutId: `pile-${suit}-${value}-${index}`
├─ Uses spring animation (stiffness: 200, damping: 25)
```

#### 2. Flying Card Animation (Current Implementation)
- **Location**: GameTable.tsx, FlyingCardRenderer component (lines 873-943)
- **Method**: Calculates start/end positions from DOM refs
- **Issues**:
  - Uses fixed positioning with absolute X/Y coordinates
  - Duration hardcoded to 0.6s regardless of distance
  - Only animates opacity/scale, not 3D perspective
  - Doesn't account for card size in position calculation
  - No easing curve optimization for natural feel

#### 3. Layout ID Strategy (Broken)
- **CardPile assigns**: `pile-${card.suit}-${card.value}-${index}`
- **CardHand assigns**: None (cards just exit with scale/opacity)
- **Problem**: No matching layoutId between hand exit and pile entry
  - CardHand's exit animation doesn't connect to CardPile's entrance
  - This prevents Framer Motion's morphing animation

### Detailed Current Code Issues

#### Issue 1: CardHand Exit Animation
```typescript
// Lines 157-159 (scrollable mode)
initial={{ opacity: 0, scale: 0.5 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.5 }}
```
**Problem**: No layoutId, so when card is removed from CardHand, no connection to CardPile

#### Issue 2: CardPile Entry Animation
```typescript
// Lines 143-163 (CardPile.tsx)
initial={{
  opacity: 0,
  scale: 0.5,
  rotate: -30,
}}
animate={{
  opacity: 1,
  scale: 1,
  rotate: rotationVariation,
}}
```
**Problem**: layoutId exists but has no matching source in CardHand

#### Issue 3: Flying Card Animation Math
```typescript
// Lines 889-892 (GameTable.tsx)
const startX = sourceRect.left + sourceRect.width / 2
const startY = sourceRect.top + sourceRect.height / 2
const endX = pileRect.left + pileRect.width / 2
const endY = pileRect.top + pileRect.height / 2
```
**Problem**: 
- Doesn't account for transform origin of cards
- Doesn't scale for card size differences
- No variable duration based on distance
- Transform is translate(-50%, -50%) which doesn't match actual card origin

#### Issue 4: Animation Timing
```typescript
// Lines 911-914 (GameTable.tsx)
transition={{
  duration: 0.6,
  ease: 'easeInOut',
}}
```
**Problem**: 
- Fixed duration regardless of start/end distance
- easeInOut doesn't feel natural for fast card plays
- No consideration for cascade stagger effect

---

## Implementation Plan

### Phase 1: Establish Proper LayoutId Strategy

#### Step 1.1: Modify CardHand to Assign LayoutIds
**File**: `/Users/lokendracarpenter/Documents/Projects/10S/Front end/10S-frontend/src/components/playing-card/CardHand.tsx`

Add layoutId tracking to support shared layout animations:
```typescript
interface CardHandProps {
  // ... existing props ...
  cardLayoutIds?: Record<string, string>  // Map card key to layoutId
}

// In map function, assign layoutId based on card position
const cardKey = `${card.suit}-${card.value}-${index}`
const layoutId = cardLayoutIds?.[cardKey] || undefined

<motion.div
  layoutId={layoutId}  // Add this
  // ... rest of component
>
```

**Why**: Enables Framer Motion to track the same card component as it moves from hand to pile, allowing for morphing animation.

#### Step 1.2: Modify CardPile to Use Consistent LayoutIds
**File**: `/Users/lokendracarpenter/Documents/Projects/10S/Front end/10S-frontend/src/components/playing-card/CardPile.tsx`

Update layoutId assignment to match the hand's format:
```typescript
// Current: pile-${card.suit}-${card.value}-${index}
// New: should be consistent with hand's layoutId when same card is played

// When card is played (newly added to pile), use:
layoutId={`card-${card.suit}-${card.value}`}  // Simplified, unique per card
```

**Why**: Simpler identifier that works regardless of position changes, makes matching easier.

#### Step 1.3: Create SharedLayoutAnimationWrapper
**New File**: `/Users/lokendracarpenter/Documents/Projects/10S/Front end/10S-frontend/src/components/playing-card/CardAnimationContext.tsx`

```typescript
import { createContext, useContext } from 'react'

interface CardLayoutId {
  suit: string
  value: number
  layoutId: string
}

const CardLayoutContext = createContext<{
  registerCardLayout: (card: Card, layoutId: string) => void
  unregisterCardLayout: (card: Card) => void
  getCardLayoutId: (card: Card) => string
}>({
  registerCardLayout: () => {},
  unregisterCardLayout: () => {},
  getCardLayoutId: () => '',
})

export const useCardLayout = () => useContext(CardLayoutContext)
export const CardLayoutProvider = CardLayoutContext.Provider
```

**Why**: Centralized tracking of layoutIds across components ensures consistency and allows real-time coordination.

---

### Phase 2: Improve Flying Card Animation

#### Step 2.1: Create AnimatedCard Component
**New File**: `/Users/lokendracarpenter/Documents/Projects/10S/Front end/10S-frontend/src/components/playing-card/AnimatedCard.tsx`

```typescript
interface AnimatedCardProps {
  suit: CardSuit
  value: CardValue
  sourceElement: HTMLElement
  targetElement: HTMLElement
  duration?: number
  onAnimationComplete?: () => void
}

export function AnimatedCard({
  suit,
  value,
  sourceElement,
  targetElement,
  duration,
  onAnimationComplete,
}: AnimatedCardProps) {
  const sourceRect = sourceElement.getBoundingClientRect()
  const targetRect = targetElement.getBoundingClientRect()

  // Calculate actual card dimensions
  const cardWidth = sourceRect.width
  const cardHeight = sourceRect.height

  // Calculate distance for dynamic duration
  const distance = Math.hypot(
    targetRect.left - sourceRect.left,
    targetRect.top - sourceRect.top
  )
  
  // Dynamic duration: 300ms base + 1ms per pixel (capped at 800ms)
  const calculatedDuration = Math.min(0.3 + distance / 1000, 0.8)
  const finalDuration = duration || calculatedDuration

  // Starting position (center of source card)
  const startX = sourceRect.left + cardWidth / 2
  const startY = sourceRect.top + cardHeight / 2
  
  // Ending position (center of target)
  const endX = targetRect.left + targetRect.width / 2
  const endY = targetRect.top + targetRect.height / 2

  // Easing: easeOut feels better for card throws
  const easeFunction = 'cubic-bezier(0.34, 1.56, 0.64, 1)' // easeOutBack

  return (
    <motion.div
      initial={{
        position: 'fixed',
        left: startX,
        top: startY,
        x: -cardWidth / 2,
        y: -cardHeight / 2,
        opacity: 1,
        scale: 1,
        rotateZ: -45,
      }}
      animate={{
        left: endX,
        top: endY,
        x: -cardWidth / 2,
        y: -cardHeight / 2,
        opacity: 0,
        scale: 0.3,
        rotateZ: 45,
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: finalDuration,
        ease: easeFunction,
        type: 'tween', // Use tween for position, not spring
      }}
      onAnimationComplete={onAnimationComplete}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 50,
        perspective: '1200px',
      }}
    >
      <PlayingCard
        suit={suit}
        value={value}
        size="sm"
        isPlayable={false}
      />
    </motion.div>
  )
}
```

**Why**: 
- Encapsulates animation logic in reusable component
- Calculates duration based on distance for natural feel
- Uses better easing curve (easeOutBack instead of easeInOut)
- Handles all position calculations in one place
- Adds 3D rotation for visual interest

#### Step 2.2: Update FlyingCardRenderer in GameTable.tsx
**File**: `/Users/lokendracarpenter/Documents/Projects/10S/Front end/10S-frontend/src/pages/GameTable.tsx` (lines 873-943)

Replace with:
```typescript
const FlyingCardRenderer = () => {
  if (flyingCards.length === 0) return null

  return (
    <AnimatePresence>
      {flyingCards.map((flyingCard) => {
        const sourceElement = playerSeatsRef.current.get(flyingCard.sourcePlayerId)
        const pileElement = pileContainerRef.current

        if (!sourceElement || !pileElement) return null

        return (
          <AnimatedCard
            key={flyingCard.id}
            suit={flyingCard.card.suit}
            value={flyingCard.card.value}
            sourceElement={sourceElement}
            targetElement={pileElement}
            onAnimationComplete={() => {
              // Card animation done, now revealed in pile
              soundService.cardPlayed()
            }}
          />
        )
      })}
    </AnimatePresence>
  )
}
```

**Why**: Uses new component, cleaner code, better separation of concerns.

---

### Phase 3: Enhance CardPile Layout Animations

#### Step 3.1: Update CardPile Cascade Animation
**File**: `/Users/lokendracarpenter/Documents/Projects/10S/Front end/10S-frontend/src/components/playing-card/CardPile.tsx` (lines 141-185)

```typescript
// Current spring animation (good baseline)
transition={{
  type: 'spring',
  stiffness: 200,
  damping: 25,
  duration: 0.4,
}}

// Enhanced with layout animation
<motion.div
  key={`${card.suit}-${card.value}-${index}`}
  layoutId={`card-${card.suit}-${card.value}`}  // Consistent with hand
  initial={{
    opacity: 0,
    scale: 0.3,
    rotate: -45,
    filter: 'blur(4px)',
  }}
  animate={{
    opacity: 1,
    scale: 1,
    rotate: rotationVariation,
    filter: 'blur(0px)',
  }}
  exit={{
    opacity: 0,
    scale: 0,
    rotate: 20,
  }}
  transition={{
    type: 'spring',
    stiffness: 200,
    damping: 25,
    duration: 0.5,
    // Stagger new cards
    delay: index === displayCards.length - 1 ? 0 : 0.05,
  }}
  className="absolute"
  style={{
    position: 'absolute',
    top: `calc(50% - ${cardHeight / 2}px + ${yOffset}px)`,
    left: `calc(50% + ${cardX}px - ${cardWidth / 2}px)`,
    zIndex: index,
  }}
>
```

**Why**:
- layoutId enables Framer Motion's morphing when card moves from hand
- Added blur transition for depth
- Stagger effect makes card entry more elegant
- Better initial/exit scale values for cohesion with flying animation

---

### Phase 4: Optimize CardHand Exit Animation

#### Step 4.1: Update CardHand Exit Animations
**File**: `/Users/lokendracarpenter/Documents/Projects/10S/Front end/10S-frontend/src/components/playing-card/CardHand.tsx`

For scrollable mode (lines 155-197):
```typescript
<motion.div
  key={`${card.suit}-${card.value}-${index}`}
  layoutId={cardLayoutIds?.[`${card.suit}-${card.value}`]}  // Add layout ID
  initial={{ opacity: 0, scale: 0.5, filter: 'blur(2px)' }}
  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
  exit={{ 
    opacity: 0, 
    scale: 0.3, 
    filter: 'blur(4px)',
    transition: { duration: 0.3 }  // Faster exit
  }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  // ... rest of props
>
```

For fan layout (lines 240-304):
```typescript
<motion.div
  key={`${card.suit}-${card.value}-${index}`}
  layoutId={cardLayoutIds?.[`${card.suit}-${card.value}`]}  // Add layout ID
  initial={{ opacity: 0, scale: 0.5, filter: 'blur(2px)' }}
  animate={{
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  }}
  exit={{ 
    opacity: 0, 
    scale: 0.3, 
    filter: 'blur(4px)',
    transition: { duration: 0.3 }  // Faster exit
  }}
  transition={{
    type: 'spring',
    stiffness: 300,
    damping: 30,
  }}
  className="absolute"
  style={{
    left: `${x}px`,
    top: `${y}px`,
    zIndex: isSelected ? 200 : isHovered ? 150 : zIndexBase,
    pointerEvents: 'auto',
    touchAction: 'manipulation',
    cursor: showBacks ? 'default' : 'pointer',
    perspective: '1000px',
  }}
>
```

**Why**:
- layoutId enables morphing to pile
- Filter blur on exit creates smooth fade effect
- Faster exit (0.3s) complements flying animation timing

---

### Phase 5: Positioning & Transform Context Fix

#### Step 5.1: Create CardPositionContext
**New File**: `/Users/lokendracarpenter/Documents/Projects/10S/Front end/10S-frontend/src/context/CardPositionContext.ts`

```typescript
import { createContext, useContext, useCallback } from 'react'

interface CardElement {
  ref: HTMLElement
  suit: string
  value: number
  playerId: string
}

interface CardPositionContextType {
  registerCardElement: (card: CardElement) => void
  unregisterCardElement: (key: string) => void
  getCardElement: (suit: string, value: number) => CardElement | null
}

const CardPositionContext = createContext<CardPositionContextType>({
  registerCardElement: () => {},
  unregisterCardElement: () => {},
  getCardElement: () => null,
})

export const useCardPosition = () => useContext(CardPositionContext)

export const CardPositionProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const cardElements = new Map<string, CardElement>()

  const registerCardElement = useCallback((card: CardElement) => {
    const key = `${card.suit}-${card.value}`
    cardElements.set(key, card)
  }, [])

  const unregisterCardElement = useCallback((key: string) => {
    cardElements.delete(key)
  }, [])

  const getCardElement = useCallback(
    (suit: string, value: number) => {
      return cardElements.get(`${suit}-${value}`) || null
    },
    []
  )

  return (
    <CardPositionContext.Provider
      value={{
        registerCardElement,
        unregisterCardElement,
        getCardElement,
      }}
    >
      {children}
    </CardPositionContext.Provider>
  )
}
```

**Why**: Provides real-time access to card DOM elements for animation calculations, replacing static refs.

#### Step 5.2: Update PlayingCard to Register Position
```typescript
// In PlayingCard.tsx
const ref = useRef<HTMLDivElement>(null)
const { registerCardElement, unregisterCardElement } = useCardPosition()

useEffect(() => {
  if (ref.current) {
    registerCardElement({
      ref: ref.current,
      suit,
      value,
      playerId: currentPlayerId || '',
    })

    return () => {
      unregisterCardElement(`${suit}-${value}`)
    }
  }
}, [suit, value])

return (
  <motion.div ref={ref} // ... rest
)
```

---

### Phase 6: Responsive Animation Easing

#### Step 6.1: Create Animation Utilities
**New File**: `/Users/lokendracarpenter/Documents/Projects/10S/Front end/10S-frontend/src/utils/cardAnimationUtils.ts`

```typescript
export const CARD_EASING = {
  // Smooth ease-out for throwing cards
  throw: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  // Gentle ease-in-out for placement
  place: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Quick snappy for UI feedback
  snap: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const

export const calculateAnimationDuration = (
  distance: number,
  baseMs: number = 300,
  maxMs: number = 800
): number => {
  // 1ms per pixel of distance
  const durationMs = Math.min(baseMs + distance, maxMs)
  return durationMs / 1000 // Convert to seconds
}

export const calculateCardEasing = (
  playerCount: number,
  isCurrentPlayer: boolean
): string => {
  // Current player's throws are faster and snappier
  if (isCurrentPlayer) {
    return CARD_EASING.throw
  }
  // Other players' cards are slower and smoother
  return CARD_EASING.place
}

export const calculateAnimationDelay = (
  cardIndex: number,
  totalCards: number,
  baseDelayMs: number = 50
): number => {
  // Stagger cards for visual effect
  return (baseDelayMs * cardIndex) / 1000
}
```

**Why**: Centralizes animation parameters for consistency and easy tweaking across app.

---

## Implementation Priority & Complexity

### Critical (Phase 1 & 2) - Must Have
1. **LayoutId Strategy** (Medium complexity)
   - Modify CardHand to assign layoutIds
   - Update CardPile to use consistent IDs
   - Enable card morphing between states

2. **Flying Card Animation** (High complexity)
   - Create AnimatedCard component
   - Implement distance-based duration
   - Improve easing curves

### Important (Phase 3 & 4) - Should Have
3. **Enhanced Pile Animations** (Low complexity)
   - Add blur transitions
   - Implement stagger effect
   - Better initial/exit states

4. **CardHand Exit Improvements** (Low complexity)
   - Add blur filters
   - Faster exit timing
   - Better scale transitions

### Nice to Have (Phase 5 & 6) - Could Have
5. **Positioning Context** (Medium complexity)
   - Better element tracking
   - Real-time position access

6. **Animation Utilities** (Low complexity)
   - Centralized easing values
   - Duration calculation helpers

---

## File Changes Summary

### Existing Files to Modify
| File | Changes | Complexity |
|------|---------|-----------|
| CardHand.tsx | Add layoutId assignment, exit animations | Low |
| CardPile.tsx | Update layoutId format, enhance animations | Low |
| PlayingCard.tsx | Add layoutId prop pass-through | Trivial |
| GameTable.tsx | Replace FlyingCardRenderer | Medium |

### New Files to Create
| File | Purpose | Size |
|------|---------|------|
| AnimatedCard.tsx | Flying card animation component | ~80 lines |
| cardAnimationUtils.ts | Animation helpers & constants | ~40 lines |
| CardPositionContext.ts | Position tracking (optional) | ~50 lines |

---

## Testing Strategy

### Unit Tests
- [ ] AnimatedCard component renders correctly
- [ ] Distance-based duration calculation works
- [ ] Easing functions apply correctly

### Integration Tests
- [ ] Cards play from hand to pile smoothly
- [ ] Multiple cards animate in sequence
- [ ] Different player positions work correctly
- [ ] Mobile (sm size) animations are smooth

### Manual Testing
- [ ] Single card play (quick feedback)
- [ ] Multiple card cascade effect
- [ ] High-distance animations (player at opposite end)
- [ ] Low-distance animations (quick plays)
- [ ] Rapid card plays (7+ cards)
- [ ] Responsive across breakpoints

### Visual Regression
- [ ] No layout shifts during animation
- [ ] Cards don't overlap unexpectedly
- [ ] Blur effects render correctly
- [ ] Z-index ordering is correct

---

## Rollback Plan

If issues arise during implementation:
1. Keep backup of original CardHand.tsx, CardPile.tsx
2. flying card animation can be disabled by removing AnimatePresence wrapper
3. LayoutIds can be removed without breaking functionality (falls back to scale/opacity)
4. AnimatedCard is additive - doesn't affect existing code if not used

---

## Performance Considerations

### Current Performance Issues
- FlyingCardRenderer recalculates on every render
- DOM refs updated every frame
- No memoization of animation parameters

### Improvements
- Use useCallback for card position getter
- Memoize AnimatedCard with React.memo
- Calculate distance once at animation start
- Use will-change CSS hint on flying cards

### Expected Impact
- Smoother 60fps animations (currently dropping frames at card play)
- Reduced re-renders (AnimatePresence mode optimization)
- Better mobile performance (smaller animated element count)

---

## Implementation Checklist

### Phase 1: LayoutId Strategy
- [ ] Add cardLayoutIds prop to CardHand
- [ ] Generate layoutIds in CardHand render
- [ ] Pass layoutId to motion.div in CardHand
- [ ] Update CardPile to use simple layoutId format
- [ ] Test card identification across moves

### Phase 2: Flying Card Animation
- [ ] Create AnimatedCard.tsx component
- [ ] Implement distance calculation
- [ ] Add easing curve selection
- [ ] Update FlyingCardRenderer to use AnimatedCard
- [ ] Test with different player distances

### Phase 3: Pile Animations
- [ ] Add blur to CardPile initial state
- [ ] Add stagger delay to new cards
- [ ] Update exit animation
- [ ] Test cascade effect

### Phase 4: Hand Animations
- [ ] Update scrollable layout exit
- [ ] Update fan layout exit
- [ ] Add blur transitions
- [ ] Test card selection -> play flow

### Phase 5 & 6: Polish (Optional)
- [ ] Create CardPositionContext
- [ ] Create animation utilities
- [ ] Add memoization
- [ ] Profile performance

---

## Expected Outcomes

After full implementation:
1. **Visual**: Cards smoothly animate from hand position to pile, with natural arc
2. **Feel**: Animations respond to distance, faster throws feel snappier
3. **Performance**: No frame drops during card plays (maintain 60fps)
4. **Polish**: Blur transitions, rotation, and scale create cinematic effect
5. **Accessibility**: No animation changes for reduced-motion users

---

## References

### Framer Motion Docs
- [Shared Layout Animations](https://www.framer.com/motion/component/api/#layout)
- [AnimatePresence](https://www.framer.com/motion/animate-presence/)
- [Easing Curves](https://www.framer.com/motion/easing/)

### Related Codebase Files
- `/src/components/playing-card/PlayingCard.tsx` - Base card component
- `/src/components/playing-card/CardHand.tsx` - Hand layout
- `/src/components/playing-card/CardPile.tsx` - Pile display
- `/src/pages/GameTable.tsx` - Animation orchestration
- `/src/types/game.ts` - Card type definitions
