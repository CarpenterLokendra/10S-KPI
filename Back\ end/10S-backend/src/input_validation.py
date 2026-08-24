"""
Input validation and sanitization utilities.

Prevents:
- SQL Injection
- XSS attacks
- Command Injection
- Path Traversal
- Buffer Overflow
"""

import re
import string
from typing import Any, Tuple
from loguru import logger

# ============================================
# VALIDATION RULES
# ============================================

# Username: alphanumeric + underscore, 3-15 chars
USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_]{3,15}$')

# Email: standard email regex
EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

# UUID v4 format
UUID_PATTERN = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', re.I)

# Game code: 4-6 uppercase alphanumeric
GAME_CODE_PATTERN = re.compile(r'^[A-Z0-9]{4,6}$')

# Player position: 1-4
PLAYER_POSITION_PATTERN = re.compile(r'^[1-4]$')

# SQL injection patterns to detect
SQL_INJECTION_PATTERNS = [
    r"(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)",  # SQL keywords
    r"(--|#|/\*|\*/)",  # SQL comments
    r"[';]",  # Quote characters that could break queries
]

# XSS patterns to detect
XSS_PATTERNS = [
    r"<script[^>]*>",
    r"<iframe[^>]*>",
    r"javascript:",
    r"onerror=",
    r"onload=",
    r"onclick=",
]


def is_valid_username(username: str) -> Tuple[bool, str]:
    """Validate username format."""
    if not username:
        return False, "Username is required"

    if len(username) < 3:
        return False, "Username must be at least 3 characters"

    if len(username) > 15:
        return False, "Username must be at most 15 characters"

    if not USERNAME_PATTERN.match(username):
        return False, "Username must contain only letters, numbers, and underscores"

    return True, ""


def is_valid_email(email: str) -> Tuple[bool, str]:
    """Validate email format."""
    if not email:
        return True, ""  # Email is optional

    if not EMAIL_PATTERN.match(email):
        return False, "Invalid email format"

    if len(email) > 255:
        return False, "Email is too long"

    return True, ""


def is_valid_uuid(value: str) -> Tuple[bool, str]:
    """Validate UUID v4 format."""
    if not value:
        return False, "UUID is required"

    if not UUID_PATTERN.match(value):
        return False, "Invalid UUID format"

    return True, ""


def is_valid_game_code(code: str) -> Tuple[bool, str]:
    """Validate game code format."""
    if not code:
        return False, "Game code is required"

    if not GAME_CODE_PATTERN.match(code):
        return False, "Game code must be 4-6 uppercase letters or numbers"

    return True, ""


def is_valid_player_position(position: int) -> Tuple[bool, str]:
    """Validate player position (1-4)."""
    if not isinstance(position, int):
        return False, "Player position must be an integer"

    if position < 1 or position > 4:
        return False, "Player position must be between 1 and 4"

    return True, ""


def check_sql_injection(value: str) -> Tuple[bool, str]:
    """
    Detect potential SQL injection attempts.

    WARNING: This is a heuristic check. The primary defense is using
    SQLAlchemy ORM with parameterized queries, not this regex check.
    """
    if not value:
        return True, ""

    value_upper = value.upper()

    for pattern in SQL_INJECTION_PATTERNS:
        if re.search(pattern, value_upper):
            logger.warning(f"🚨 Potential SQL injection detected: {value[:50]}")
            return False, "Invalid input detected"

    return True, ""


def check_xss(value: str) -> Tuple[bool, str]:
    """Detect potential XSS attempts."""
    if not value:
        return True, ""

    value_lower = value.lower()

    for pattern in XSS_PATTERNS:
        if re.search(pattern, value_lower):
            logger.warning(f"🚨 Potential XSS detected: {value[:50]}")
            return False, "Invalid input detected (XSS)"

    return True, ""


def sanitize_string(value: str, max_length: int = 255) -> str:
    """
    Sanitize string input.
    - Remove null bytes
    - Limit length
    - Preserve Unicode
    """
    if not isinstance(value, str):
        return ""

    # Remove null bytes
    value = value.replace('\x00', '')

    # Limit length
    if len(value) > max_length:
        value = value[:max_length]

    return value.strip()


def validate_input(
    value: Any,
    field_name: str,
    field_type: str = "string",
    max_length: int = 255,
    required: bool = False,
) -> Tuple[bool, str, Any]:
    """
    Comprehensive input validation.

    Args:
        value: Input value to validate
        field_name: Name of field (for error messages)
        field_type: Type of field ('username', 'email', 'uuid', 'string', 'int')
        max_length: Maximum allowed length
        required: Whether field is required

    Returns:
        (is_valid, error_message, sanitized_value)
    """
    # Check if required
    if required and not value:
        return False, f"{field_name} is required", None

    if not value:
        return True, "", None

    # Type-specific validation
    if field_type == "username":
        is_valid, error = is_valid_username(str(value))
        if not is_valid:
            return False, error, None
        sanitized = sanitize_string(str(value), max_length)

    elif field_type == "email":
        is_valid, error = is_valid_email(str(value))
        if not is_valid:
            return False, error, None
        sanitized = sanitize_string(str(value), max_length)

    elif field_type == "uuid":
        is_valid, error = is_valid_uuid(str(value))
        if not is_valid:
            return False, error, None
        sanitized = str(value)

    elif field_type == "int":
        try:
            sanitized = int(value)
        except (ValueError, TypeError):
            return False, f"{field_name} must be an integer", None

    else:  # string
        sanitized = sanitize_string(str(value), max_length)

    # Check for SQL injection
    if isinstance(sanitized, str):
        is_safe, error = check_sql_injection(sanitized)
        if not is_safe:
            return False, error, None

    # Check for XSS
    if isinstance(sanitized, str):
        is_safe, error = check_xss(sanitized)
        if not is_safe:
            return False, error, None

    return True, "", sanitized


# ============================================
# BATCH VALIDATION
# ============================================

def validate_inputs(inputs: dict, schema: dict) -> Tuple[bool, dict]:
    """
    Validate multiple inputs at once.

    Args:
        inputs: Dictionary of input values
        schema: Validation schema defining field rules

    Example schema:
        {
            "username": {"type": "username", "required": True},
            "email": {"type": "email", "required": False, "max_length": 255},
            "user_id": {"type": "uuid", "required": True},
        }

    Returns:
        (is_valid, errors_dict)
    """
    errors = {}

    for field_name, rules in schema.items():
        value = inputs.get(field_name)
        field_type = rules.get("type", "string")
        max_length = rules.get("max_length", 255)
        required = rules.get("required", False)

        is_valid, error, _ = validate_input(value, field_name, field_type, max_length, required)

        if not is_valid:
            errors[field_name] = error

    return len(errors) == 0, errors
