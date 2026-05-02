"""
10S Card Game Backend Package
"""

__version__ = "1.0.0"
__author__ = "10S Game Development Team"

__all__ = [
    "SessionLocal",
    "engine",
    "init_db",
    "User",
    "Game",
    "GamePlayer",
    "Lobby",
    "Round",
    "ChatMessage",
    "PlayerStatistics",
    "Bot",
    "AdServing",
    "PremiumSubscription",
]

# Lazy imports to avoid circular dependencies and import issues
def __getattr__(name):
    if name == "SessionLocal":
        from database import SessionLocal
        return SessionLocal
    elif name == "engine":
        from database import engine
        return engine
    elif name == "init_db":
        from database import init_db
        return init_db
    elif name == "User":
        from models import User
        return User
    elif name == "Game":
        from models import Game
        return Game
    elif name == "GamePlayer":
        from models import GamePlayer
        return GamePlayer
    elif name == "Lobby":
        from models import Lobby
        return Lobby
    elif name == "Round":
        from models import Round
        return Round
    elif name == "ChatMessage":
        from models import ChatMessage
        return ChatMessage
    elif name == "PlayerStatistics":
        from models import PlayerStatistics
        return PlayerStatistics
    elif name == "Bot":
        from models import Bot
        return Bot
    elif name == "AdServing":
        from models import AdServing
        return AdServing
    elif name == "PremiumSubscription":
        from models import PremiumSubscription
        return PremiumSubscription
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
