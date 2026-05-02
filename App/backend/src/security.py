"""
Security utilities for authentication and password management.

This module provides:
- Password hashing and verification with bcrypt
- JWT token creation and verification
- User authentication helpers
"""

from datetime import datetime, timedelta
from typing import Optional
from loguru import logger
import hashlib

from jose import JWTError, jwt
from passlib.context import CryptContext
from config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRATION_HOURS, BCRYPT_ROUNDS

# ============================================
# PASSWORD HASHING
# ============================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=BCRYPT_ROUNDS
)


def hash_password(password: str) -> str:
    """
    Hash a password using SHA256 + bcrypt.

    Args:
        password: Plain text password to hash

    Returns:
        Bcrypt hashed password

    Security notes:
    - First hashes with SHA256 to bypass bcrypt's 72-byte limit
    - Then hashes with bcrypt for adaptive security
    - Uses configurable rounds (default 12)
    """
    sha256_hash = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(sha256_hash)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a SHA256 + bcrypt hash.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Previously hashed password (SHA256 + bcrypt)

    Returns:
        True if password matches, False otherwise

    Security notes:
    - First hashes plain password with SHA256 to match storage format
    - Then verifies against bcrypt hash using constant-time comparison
    """
    try:
        sha256_hash = hashlib.sha256(plain_password.encode()).hexdigest()
        return pwd_context.verify(sha256_hash, hashed_password)
    except Exception as e:
        logger.error("Password verification error", exc_info=False)
        return False


# ============================================
# JWT TOKEN MANAGEMENT
# ============================================


def create_access_token(
    user_id: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.

    Args:
        user_id: User ID to encode in token
        expires_delta: Custom expiration time (uses config default if None)

    Returns:
        Encoded JWT token

    Security notes:
    - Token includes expiration time
    - Token is signed with secret key
    - Never share JWT_SECRET_KEY!
    """
    if expires_delta is None:
        expires_delta = timedelta(hours=JWT_EXPIRATION_HOURS)

    expire = datetime.utcnow() + expires_delta
    to_encode = {
        "sub": user_id,  # Subject (user ID)
        "exp": expire,   # Expiration time
        "iat": datetime.utcnow()  # Issued at
    }

    try:
        encoded_jwt = jwt.encode(
            to_encode,
            JWT_SECRET_KEY,
            algorithm=JWT_ALGORITHM
        )
        return encoded_jwt
    except Exception as e:
        logger.error("Token creation failed", exc_info=False)
        raise


def verify_token(token: str) -> Optional[str]:
    """
    Verify and decode a JWT token.

    Args:
        token: JWT token to verify

    Returns:
        User ID if token is valid, None if invalid/expired

    Security notes:
    - Validates signature with secret key
    - Checks expiration time
    - Returns None on any error (don't expose details)
    """
    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("Token missing user ID claim")
            return None
        return user_id
    except JWTError as e:
        logger.debug(f"Token verification failed: {type(e).__name__}")
        return None
    except Exception as e:
        logger.error("Unexpected token error", exc_info=False)
        return None


# ============================================
# AUTHENTICATION HELPERS
# ============================================


def authenticate_user(db_session, username: str, password: str):
    """
    Authenticate user with username and password.

    To use:
    1. Query user from database by username
    2. Verify password with verify_password()
    3. Return user if verified

    Args:
        db_session: SQLAlchemy session
        username: User's username
        password: Plain text password

    Returns:
        User object if authenticated, None otherwise

    Implementation example:
    ```python
    from models import User

    user = db_session.query(User).filter(User.username == username).first()
    if user and verify_password(password, user.password_hash):
        return user
    return None
    ```
    """
    # TODO: Implement after User model and login endpoint are created
    pass


# ============================================
# SECURITY VALIDATION
# ============================================


def validate_phone_number(phone: str) -> tuple[bool, str]:
    """
    Validate phone number format.

    Accepts:
    - International format: +1234567890 (with + prefix)
    - US format: 1234567890 (10 digits)
    - International: 9-15 digits with optional + prefix

    Args:
        phone: Phone number to validate

    Returns:
        (is_valid, error_message) tuple
    """
    import re
    # Allow +, spaces, dashes, and parentheses for formatting
    cleaned = re.sub(r"[\s\-().]", "", phone)

    if not re.match(r"^\+?1?\d{9,15}$", cleaned):
        return False, "Phone number must be 9-15 digits, optionally with + prefix"

    return True, ""


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength.

    Requirements:
    - At least 8 characters
    - Contains uppercase letter
    - Contains lowercase letter
    - Contains digit
    - Contains special character

    Args:
        password: Password to validate

    Returns:
        (is_valid, error_message) tuple
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters"

    if not any(c.isupper() for c in password):
        return False, "Password must contain uppercase letter"

    if not any(c.islower() for c in password):
        return False, "Password must contain lowercase letter"

    if not any(c.isdigit() for c in password):
        return False, "Password must contain digit"

    special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    if not any(c in special_chars for c in password):
        return False, "Password must contain special character"

    return True, ""


# ============================================
# EXAMPLE USAGE (for reference)
# ============================================

"""
# In your routes/auth.py file:

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from security import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token
)
from database import get_db
from schemas import UserCreate, TokenResponse

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Create new user with hashed password
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )
    db.add(user)
    db.commit()

    # Return JWT token
    access_token = create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login", response_model=TokenResponse)
async def login(username: str, password: str, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Return JWT token
    access_token = create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


# For protecting endpoints:
from fastapi.security import HTTPBearer, HTTPAuthCredentials

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    user_id = verify_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return user_id


@app.get("/users/me")
async def get_current_user_info(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
"""
