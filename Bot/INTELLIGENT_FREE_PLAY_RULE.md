# Intelligent Free Play Rule #3 - Hard Difficulty Bot

## Rule Definition

### When Free Play Occurs
**Free Play = No led suit has been established**

This happens when:
1. It's the first card of the round (first player can play anything)
2. Led suit was set but no trump yet (first player's turn in new round)

### Original Rule
"If no led suit, player can play any card"

### Enhanced Rule (New Intelligence)
**If no led suit (free play):**
- **WHEN 10 is in pile:** Use trump to WIN the round (use LOWEST trump)
- **WHEN no 10 in pile:** Play LOWEST valued card (preserve strength)

---

## Strategy Examples

### Example 1: Free Play WITH 10 in Pile
```
Situation:
- No led suit (free play)
- Trump: Hearts
- 10♦ in pile (must win to catch it!)
- Bot hand: K♥, Q♥, 10♥, 5♠, 3♦, 2♣

Strategy Decision:
1. Detect: Free play + 10 in pile + trump set
2. Get trump cards: [K♥, Q♥, 10♥]
3. Pick LOWEST trump: 10♥
4. Play: 10♥ (wins round with minimum trump waste)

Result:
✅ Wins the round and catches the 10♦
✅ Preserves K♥, Q♥ for future critical rounds
✅ Used minimum value trump (10 < Q < K)
```

### Example 2: Free Play WITHOUT 10 in Pile
```
Situation:
- No led suit (free play)
- Trump: Hearts
- No 10 in pile
- Bot hand: K♥, Q♥, 10♥, 5♠, 3♦, 2♣

Strategy Decision:
1. Detect: Free play + NO 10 in pile
2. Don't waste trump
3. Get all cards: [K♥, Q♥, 10♥, 5♠, 3♦, 2♣]
4. Pick LOWEST overall: 2♣
5. Play: 2♣ (preserve all strength)

Result:
✅ Doesn't waste trump when unnecessary
✅ Preserves ALL high cards for future rounds
✅ Minimal resource commitment
```

### Example 3: Free Play with 10 but No Trump Yet
```
Situation:
- No led suit (free play)
- Trump: NOT SET YET
- 10♠ in pile
- Bot hand: K♥, Q♥, 5♠, 3♦, 2♣

Strategy Decision:
1. Detect: Free play + 10 in pile + NO TRUMP
2. Can't use trump (not set)
3. Must play something to win or participate
4. Play lowest to preserve: 2♣
5. After play, if plays different suit → becomes trump

Result:
ℹ️ This sets trump as a side effect (intelligent!)
```

---

## Implementation Details

### Code Location
**File:** `src/strategy/hard/__init__.py`

### Method: `_get_lowest_trump_card()`
```python
def _get_lowest_trump_card(self, valid_moves: List[Card], game_state: GameState) -> Card:
    """
    Get LOWEST valued trump card to win round with 10 in pile.
    Preserves high trumps for future critical rounds.
    """
    trump_cards = [card for card in valid_moves if card.suit == game_state.trump_suit]
    
    if trump_cards:
        # Pick LOWEST trump
        lowest_trump = min(trump_cards, key=lambda c: c.value)
        return lowest_trump
    
    return None
```

### Integration in `decide()` Method
```python
# Detect free play
is_free_play = game_state.led_suit is None

if is_free_play and len(valid_moves) > 0:
    pile_has_10 = analysis["pile"].ten_in_pile
    
    if pile_has_10 and game_state.trump_suit:
        # 10 in pile + trump set = use lowest trump
        chosen_card = self._get_lowest_trump_card(valid_moves, game_state)
    else:
        # No 10 or no trump = play lowest card
        chosen_card = min(valid_moves, key=lambda c: c.value)
```

---

## Strategic Benefits

### 1. Efficient Trump Usage
- Only uses trump when necessary (when 10 is present)
- Doesn't waste trump on regular rounds
- Saves trump for critical moments

### 2. Optimal Card Preservation
- Uses lowest value when forced to use resource
- Never uses high cards when low cards work
- Builds strength for endgame

### 3. Winning Probability
- When 10 is present, ALWAYS tries to win with trump
- When no 10, doesn't risk resources
- Maximizes 10-catching opportunities

### 4. Resource Management
- Tracks trump availability
- Adapts to what's in pile
- Balances immediate goals with future flexibility

---

## Decision Tree

```
Is it FREE PLAY? (no led suit)
│
├─ YES
│  │
│  ├─ Is there a 10 in the pile?
│  │  │
│  │  ├─ YES + Trump set
│  │  │  └─ Use LOWEST trump card ✅ WIN round & catch 10
│  │  │
│  │  ├─ YES + No Trump yet
│  │  │  └─ Play lowest card (will set trump as side effect)
│  │  │
│  │  └─ NO
│  │     └─ Play LOWEST valued card (preserve everything)
│  │
│  └─ Strategy: Intelligent free play
│
└─ NO
   └─ Use normal scoring (other rules apply)
```

---

## Logging Output

### When Using Trump for 10-Catching
```
🎯 FREE PLAY WITH 10 IN PILE: Using lowest trump K♥ to WIN
🎯 10 IN PILE STRATEGY:
   Available trumps: [K♥, Q♥, 10♥]
   Playing LOWEST trump: 10♥
   ✅ High trumps preserved for future 10-catching rounds
```

### When Playing Without 10
```
ℹ️ FREE PLAY (no 10): Using lowest card 2♣ to preserve resources
```

### When No Trump Available
```
ℹ️ No trump available, using lowest: 3♦
```

---

## Comparison: Old vs New

### Old Behavior
```
Free play + 10 in pile?
→ Use weighted scoring
→ Might play any card (not optimized for 10-catching)
→ Might waste high trump unnecessarily
→ Might not win critical rounds
```

### New Behavior
```
Free play + 10 in pile + trump set?
→ Immediately use lowest trump
→ Guaranteed to win the round
→ Preserves high trumps for later
→ Maximizes 10-catching chances
```

---

## Test Cases

### Test 1: Free Play with 10 and Trump
```
Setup:
- Led suit: None (free play)
- Trump: Spades
- Pile: 10♥ (need to catch!)
- Hand: K♠, J♠, 5♠, 3♦, 2♣

Expected:
✅ Detect 10 in pile
✅ Detect trump set
✅ Get spade cards: [K♠, J♠, 5♠]
✅ Pick lowest: 5♠
✅ Play 5♠ (wins with minimum trump)
```

### Test 2: Free Play without 10
```
Setup:
- Led suit: None (free play)
- Trump: Spades
- Pile: No 10 (just regular round)
- Hand: K♠, J♠, 5♠, 3♦, 2♣

Expected:
✅ Detect NO 10 in pile
✅ Don't use trump
✅ Pick lowest overall: 2♣
✅ Play 2♣ (preserve all strength)
```

### Test 3: Free Play with 10 but No Trump
```
Setup:
- Led suit: None (free play)
- Trump: None (not set yet)
- Pile: 10♠ (need to catch!)
- Hand: K♥, Q♥, 5♦, 3♣, 2♣

Expected:
✅ Detect 10 in pile
✅ Detect NO trump
✅ Can't use trump strategy
✅ Play lowest: 2♣
✅ Sets trump as side effect (intelligent!)
```

---

## Why This Matters

This rule embodies **intelligent strategic thinking**:
1. **Knows when to fight** - When 10 is in pile, uses trump to WIN
2. **Knows when to conserve** - When no 10, doesn't waste resources
3. **Optimizes long-term** - Uses lowest value when forced, saves high cards
4. **Adapts to situation** - Different strategy based on game state

This makes the hard difficulty bot significantly more competitive against human players who might waste resources or miss 10-catching opportunities.
