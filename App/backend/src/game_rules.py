"""
Game Rules Validation
Core logic for the 10S card game
"""

from typing import List, Tuple, Optional, Dict
from dataclasses import dataclass
from enum import Enum
from .game_constants import (
    CardValue, CardSuit, CARD_POINTS,
    CONSECUTIVE_ROUNDS_FOR_CATCH, CATCH_10S_MULTIPLIER
)

# ============================================
# DATA CLASSES
# ============================================

@dataclass
class Card:
    """Represents a single card"""
    value: CardValue
    suit: CardSuit
    
    def __hash__(self):
        return hash((self.value, self.suit))
    
    def __eq__(self, other):
        return self.value == other.value and self.suit == other.suit
    
    def __repr__(self):
        return f"{self.value.name} of {self.suit.value}"
    
    def get_points(self) -> int:
        """Get points value of this card"""
        return CARD_POINTS.get(self.value, 0)

@dataclass
class RoundPlay:
    """Represents a card play in a round"""
    player_id: str
    card: Card
    play_order: int
    is_smash: bool = False  # Whether this was a trump (smash)

@dataclass
class Round:
    """Represents a single round of play"""
    round_number: int
    led_suit: CardSuit
    plays: List[RoundPlay]
    winner_id: Optional[str] = None
    trump_suit: Optional[CardSuit] = None
    
    def has_10(self) -> bool:
        """Check if a 10 was played in this round"""
        return any(play.card.value == CardValue.TEN for play in self.plays)
    
    def get_cards_played(self) -> List[Card]:
        """Get all cards played in this round"""
        return [play.card for play in self.plays]

@dataclass
class PlayerHand:
    """Represents a player's hand of cards"""
    player_id: str
    cards: List[Card]
    
    def __contains__(self, item):
        return item in self.cards
    
    def remove_card(self, card: Card) -> bool:
        """Remove a card from hand"""
        if card in self.cards:
            self.cards.remove(card)
            return True
        return False
    
    def has_suit(self, suit: CardSuit) -> bool:
        """Check if player has any card of given suit"""
        return any(card.suit == suit for card in self.cards)
    
    def get_cards_by_suit(self, suit: CardSuit) -> List[Card]:
        """Get all cards of a given suit"""
        return [card for card in self.cards if card.suit == suit]
    
    def get_cards_by_suit_value_range(self, suit: CardSuit, min_val: int, max_val: int) -> List[Card]:
        """Get cards within a value range"""
        return [
            card for card in self.cards 
            if card.suit == suit and min_val <= card.value <= max_val
        ]

# ============================================
# GAME RULES CLASS
# ============================================

class GameRules:
    """
    Enforces all game rules for 10S card game
    """
    
    @staticmethod
    def is_valid_first_card(card: Card) -> bool:
        """
        Check if card is valid for starting first round
        (Any card is valid to start)
        """
        return True
    
    @staticmethod
    def is_valid_move(
        player_hand: PlayerHand,
        led_suit: CardSuit,
        trump_suit: Optional[CardSuit],
        card_to_play: Card
    ) -> bool:
        """
        Validate if a card play follows the rules:
        1. If you have led suit, you must play it
        2. If you don't have led suit but have trump, you can play trump
        3. If you have neither, you can play any card
        """
        
        # Check if player has the led suit
        if player_hand.has_suit(led_suit):
            # Must play the led suit
            return card_to_play.suit == led_suit
        
        # Check if player has trump
        if trump_suit and player_hand.has_suit(trump_suit):
            # Can play trump or any other card
            return True
        
        # If neither led suit nor trump, any card is valid
        return card_to_play in player_hand.cards
    
    @staticmethod
    def get_round_winner(
        plays: List[RoundPlay],
        led_suit: CardSuit,
        trump_suit: Optional[CardSuit]
    ) -> Tuple[str, Card]:
        """
        Determine the winner of a round
        
        Rules:
        1. Trump cards beat all non-trump cards
        2. Among trump cards, highest value wins
        3. Among led suit cards (no trump), highest value wins
        4. Non-trump, non-led cards lose automatically
        
        Returns: (winner_player_id, winning_card)
        """
        
        # Separate cards by category
        trump_plays = [p for p in plays if p.card.suit == trump_suit] if trump_suit else []
        led_suit_plays = [p for p in plays if p.card.suit == led_suit]
        
        # If any trump was played, highest trump wins
        if trump_plays:
            winning_play = max(trump_plays, key=lambda p: p.card.value)
            return winning_play.player_id, winning_play.card
        
        # Otherwise, highest led suit card wins
        if led_suit_plays:
            winning_play = max(led_suit_plays, key=lambda p: p.card.value)
            return winning_play.player_id, winning_play.card
        
        # Should not reach here in normal gameplay
        raise ValueError("No valid plays to determine winner")
    
    @staticmethod
    def check_10s_caught(
        last_two_rounds: List[Round],
        catching_player_id: str
    ) -> bool:
        """
        Check if a player has caught 10s
        
        Rules:
        - Player must win 2 CONSECUTIVE rounds
        - At least ONE of those rounds must have a 10 played
        - All 10s in those 2 rounds are caught by the player
        
        Returns: True if 10s were caught, False otherwise
        """
        
        if len(last_two_rounds) < CONSECUTIVE_ROUNDS_FOR_CATCH:
            return False
        
        # Take the last 2 rounds
        round_1, round_2 = last_two_rounds[-2:]
        
        # Check if player won both rounds
        if round_1.winner_id != catching_player_id or round_2.winner_id != catching_player_id:
            return False
        
        # Check if at least one round has a 10
        if not (round_1.has_10() or round_2.has_10()):
            return False
        
        return True
    
    @staticmethod
    def get_caught_10s(
        last_two_rounds: List[Round]
    ) -> List[Card]:
        """
        Get all 10s that were played in the last 2 rounds
        These are the 10s that will be caught if the winner wins both rounds
        """
        
        tens = []
        for round_obj in last_two_rounds[-2:]:
            for play in round_obj.plays:
                if play.card.value == CardValue.TEN:
                    tens.append(play.card)
        
        return tens
    
    @staticmethod
    def calculate_player_score(
        caught_10s: List[Card],
        remaining_cards: List[Card]
    ) -> int:
        """
        Calculate final score for a player
        
        Score = (sum of caught 10s points) + (sum of remaining cards points)
        """
        
        score = 0
        
        # Points from caught 10s
        for card in caught_10s:
            score += CATCH_10S_MULTIPLIER if card.value == CardValue.TEN else card.get_points()
        
        # Points from remaining cards
        for card in remaining_cards:
            score += card.get_points()
        
        return score
    
    @staticmethod
    def is_game_over(
        caught_10s_total: Dict[str, List[Card]],
        total_10s_in_deck: int = 4
    ) -> bool:
        """
        Check if game is over (all 10s have been caught)
        """
        
        total_caught = sum(len(tens) for tens in caught_10s_total.values())
        return total_caught >= total_10s_in_deck
    
    @staticmethod
    def get_game_winner(
        player_scores: Dict[str, int]
    ) -> str:
        """
        Determine the winner based on scores
        Returns: winning_player_id
        """
        
        if not player_scores:
            raise ValueError("No players to determine winner")
        
        return max(player_scores.items(), key=lambda x: x[1])[0]
    
    @staticmethod
    def validate_trump_setting(
        card_played: Card,
        led_suit: CardSuit,
        player_hand: PlayerHand
    ) -> bool:
        """
        Validate if a player can set trump by playing a different suit
        
        Rules:
        - Trump can only be set if player doesn't have the led suit
        - Trump card must be from player's hand
        """
        
        # Player must not have led suit to set trump
        if player_hand.has_suit(led_suit):
            return False
        
        # Card must be from different suit
        if card_played.suit == led_suit:
            return False
        
        # Card must be in player's hand
        if card_played not in player_hand.cards:
            return False
        
        return True

# ============================================
# HELPER FUNCTIONS
# ============================================

def create_deck() -> List[Card]:
    """Create a standard 52-card deck"""
    deck = []
    for suit in CardSuit:
        for value in CardValue:
            deck.append(Card(value=value, suit=suit))
    return deck

def remove_cards_from_deck(deck: List[Card], cards_to_remove: List[Card]) -> List[Card]:
    """Remove specific cards from deck"""
    for card in cards_to_remove:
        if card in deck:
            deck.remove(card)
    return deck

def get_deck_for_player_count(num_players: int) -> List[Card]:
    """
    Get the appropriate deck based on number of players
    
    3 players: Remove 2 random cards (51 total)
    4 players: Use full deck (52 total)
    5 players: Remove 2 of clubs (50 total)
    """
    
    deck = create_deck()
    
    if num_players == 3:
        # Remove 2 random cards (implementation will pick random)
        return deck[2:]  # Placeholder, actual should be random
    
    elif num_players == 4:
        # Use full deck
        return deck
    
    elif num_players == 5:
        # Remove 2 of clubs (if it exists)
        deck = [card for card in deck if not (card.value == CardValue.TWO and card.suit == CardSuit.CLUBS)]
        return deck
    
    else:
        raise ValueError(f"Invalid number of players: {num_players}")

def deal_cards(deck: List[Card], num_players: int, cards_per_player: int) -> Dict[int, List[Card]]:
    """
    Deal cards to players
    
    Returns: Dictionary mapping player position to their cards
    """
    
    hands = {}
    card_index = 0
    
    for player_pos in range(num_players):
        hands[player_pos] = []
        for _ in range(cards_per_player):
            if card_index < len(deck):
                hands[player_pos].append(deck[card_index])
                card_index += 1
    
    return hands

# ============================================
# EXAMPLE USAGE
# ============================================

if __name__ == "__main__":
    # Create a deck
    deck = create_deck()
    print(f"Deck size: {len(deck)}")
    
    # Create a player hand
    hand = PlayerHand("player_1", deck[:5])
    print(f"Player hand: {hand.cards}")
    
    # Check if valid move
    led_suit = CardSuit.HEARTS
    trump_suit = None
    card_to_play = hand.cards[0]
    
    is_valid = GameRules.is_valid_move(hand, led_suit, trump_suit, card_to_play)
    print(f"Valid move: {is_valid}")
