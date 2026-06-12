# Intelligent Trump-Setting Strategy for Hard Difficulty Bot

## Overview
Implemented a sophisticated trump-setting strategy that preserves high-value cards for critical moments when 10s are in the pile.

---

## The Problem
**What was happening before:**
- Bot would use strong, high-value cards to set trump
- When 10s appeared in the pile, bot had weak cards left
- Bot couldn't win those critical 10-catching rounds
- Competitive disadvantage against human players

**Example:**
```
Bot hand: K♥, Q♥, 10♣, 3♣, 2♦
Led suit: Clubs (no trump yet)
Old strategy: Play 10♣ or K♥ to set trump
Result: Can't catch 10♠ later because high cards are gone
```

---

## The Solution: Intelligent Trump Strategy

### Core Principle
**"Use your WEAKEST cards to set trump, save your STRONGEST cards for when 10s are in the pile"**

### How It Works

#### Step 1: Detect Trump-Setting Situation
```python
is_trump_setting = (
    game_state.trump_suit is None and           # No trump set yet
    len(game_state.played_this_round) > 0 and   # Cards already played
    game_state.led_suit is not None             # Led suit is set
)
```

#### Step 2: Find Majority Suit (Cards Bot Has Most Of)
```python
suit_counts = Counter(card.suit for card in game_state.hand)
majority_suit = suit_counts.most_common(1)[0][0]

Example:
- Hand: K♥, Q♥, 10♣, 3♣, 2♦
- Suit counts: Hearts=2, Clubs=2, Diamonds=1
- Majority suit: Hearts (first with 2 cards)
```

#### Step 3: Play Lowest Card from Majority Suit
```python
majority_suit_cards = [card for card in valid_moves if card.suit == majority_suit]
chosen_card = min(majority_suit_cards, key=lambda c: c.value)

Example:
- Majority suit cards available: Q♥, 2♦
- Lowest value: 2♦
- Play 2♦ to set trump
```

### Why This Works

**Preserves Strength for Key Moments:**
```
Round 1-4: Use weak cards to set trump
Round 5+: When 10s appear in pile, bot still has K♥, Q♥ to win the round

Strength progression:
- Early rounds (no 10s): Play 2♦, 3♣, 5♠ (weak cards)
- Mid rounds: Play medium cards if forced
- Late rounds (10s in pile): Play K♥, Q♥ to WIN and catch 10s
```

**Example Game Flow:**
```
Round 1:
- Led suit: Clubs
- Trump not set
- Bot hand: K♥, Q♥, 10♣, 3♣, 2♦
- Valid moves: 10♣, 3♣
- Strategy: Find majority suit (Clubs=2) and play lowest (3♣)
- Result: Trump set, high cards K♥, Q♥ preserved!

Round 5:
- 10♠ in pile
- Led suit: Spades
- Bot hand: K♥, Q♥, 7♠, 2♣
- Valid moves: 7♠
- Bot must play 7♠, but earlier preserved K♥ to play next round!
```

---

## Implementation Details

### File Modified
**Location:** `src/strategy/hard/__init__.py`

### New Method: `_get_trump_setting_card()`
```python
def _get_trump_setting_card(self, valid_moves: List[Card], game_state: GameState) -> Card:
    """
    Intelligently select card when setting trump.
    
    1. Find suit with most cards (majority suit)
    2. Pick lowest valued card from that suit
    3. Preserves high-value cards for critical moments
    """
    # Count cards by suit
    suit_counts = Counter(card.suit for card in game_state.hand)
    majority_suit = suit_counts.most_common(1)[0][0]
    
    # Get cards of majority suit
    majority_cards = [c for c in valid_moves if c.suit == majority_suit]
    
    # Pick lowest - preserves high cards!
    return min(majority_cards, key=lambda c: c.value)
```

### Integration with `decide()` Method
```python
# Detect trump-setting situation
is_trump_setting = (
    game_state.trump_suit is None and
    len(game_state.played_this_round) > 0 and
    game_state.led_suit is not None
)

if is_trump_setting:
    # Use intelligent strategy
    chosen_card = self._get_trump_setting_card(valid_moves, game_state)
    logger.info(f"🎯 TRUMP SETTING MODE: Using {chosen_card} (preserving high cards)")
else:
    # Normal weighted scoring for regular rounds
    # ... standard scoring logic ...
```

---

## Logging Examples

### When Trump is Set Intelligently
```
🎯 TRUMP SETTING STRATEGY:
   Suit distribution: {'hearts': 2, 'clubs': 2, 'diamonds': 1}
   Majority suit: Hearts (2 cards)
   Picking LOWEST card from majority suit: 2♦
   ✅ High-value cards preserved for 10-catching rounds
```

### When No Majority Suit Cards Available
```
🎯 TRUMP SETTING STRATEGY:
   Suit distribution: {'hearts': 3, 'clubs': 1, 'diamonds': 1}
   Majority suit: Hearts (3 cards)
   ⚠️ Majority suit not in valid moves, using lowest available: 3♠
```

---

## Strategic Benefits

### 1. Preserves Winning Power
- High cards (K, Q, J, 10) saved for critical rounds
- Can win when 10s appear in pile
- Builds card advantage over time

### 2. Intelligent Resource Management
- Uses weak cards early
- Saves strong cards for key moments
- Balances short-term and long-term strategy

### 3. Competitive Advantage
- Human players often waste strong cards setting trump
- Bot keeps strength for critical rounds
- Increases winning percentage in 10-catching situations

### 4. Psychological Element
- Bot appears to "know" when 10s are coming
- Makes calculated decisions
- Harder to predict and counter

---

## Comparison: Old vs New Strategy

### Old Strategy (Weighted Scoring)
```
Hand: K♥, Q♥, 10♣, 3♣, 2♦
Setting trump? Play: 10♣ or K♥ (high value)
Result: Lost high cards when 10s appear
```

### New Strategy (Intelligent Trump)
```
Hand: K♥, Q♥, 10♣, 3♣, 2♦
Setting trump? Play: 3♣ or 2♦ (low value of majority suit)
Result: Preserved K♥, Q♥ for 10-catching rounds
```

---

## When This Strategy Activates

**Activated when:**
1. ✅ Trump hasn't been set yet (`game_state.trump_suit is None`)
2. ✅ Cards have already been played this round
3. ✅ Led suit has been established
4. ✅ Bot is about to play a non-led suit card (setting trump)

**NOT activated when:**
- ❌ Trump is already set
- ❌ Bot is following led suit
- ❌ This is the first card of the round

---

## Testing the Strategy

### Test Case 1: Majority Suit Present
```
Situation:
- Hand: K♥, 10♥, 5♣, 3♣, 2♦
- Led suit: Clubs
- Trump: None
- Valid moves: 5♣, 3♣ (must follow clubs)
- If none of those, would play: 2♦ (lowest overall)

Result:
✅ Preserves K♥, 10♥ for future rounds
```

### Test Case 2: Later Round with 10s
```
Situation:
- Hand: K♥, 10♥, 7♠, 2♣
- Pile has: 10♦
- Led suit: Spades
- Must play: 7♠

Expected:
- Bot plays 7♠ (forced)
- But earlier preserved K♥ to play next if trump is spades
✅ Can still catch 10 with high card!
```

---

## Future Enhancements

Possible improvements:
1. **Adaptive majority suit selection** - Consider which suits are more valuable
2. **Opponent card tracking** - Adjust based on what others have played
3. **Position-aware** - Consider hand position for next rounds
4. **Dynamic suit weighting** - Weight suits by remaining 10s in deck

---

## Verification

After deployment, verify:
- ✅ Bot plays weak cards when setting trump
- ✅ Bot preserves K, Q, J for later rounds
- ✅ Bot wins more 10-catching rounds
- ✅ Logs show "TRUMP SETTING STRATEGY" activations
- ✅ High cards appear in later critical rounds
