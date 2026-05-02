"""
Authentication routes for 10S Card Game API.

Endpoints:
  POST   /auth/register    - Register new user
  POST   /auth/login       - User login
  POST   /auth/refresh     - Refresh access token
  POST   /auth/logout      - User logout
  POST   /auth/verify      - Verify token validity
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from loguru import logger
from slowapi import Limiter
from slowapi.util import get_remote_address

from database import get_db
from models import User
from schemas import UserCreate, UserLogin, TokenResponse
from security import hash_password, verify_password, create_access_token, verify_token, validate_phone_number, validate_password_strength
from config import JWT_EXPIRATION_HOURS

router = APIRouter(prefix="/auth", tags=["authentication"])
limiter = Limiter(key_func=get_remote_address)

# ============================================
# REGISTRATION
# ============================================

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.

    **Request Body**:
    - `username`: Unique username (3-20 chars)
    - `email`: Valid email address (required if phone_number not provided)
    - `phone_number`: Phone number (required if email not provided) - format: +1234567890
    - `password`: Strong password (8+ chars, mixed case, digits, special chars)
    - `auth_method`: "email" or "phone" (default: "email")

    **Response**:
    - `access_token`: JWT token for authentication
    - `token_type`: Always "bearer"
    - `user`: User object with id, username, email/phone

    **Errors**:
    - 400: Username already exists, email/phone already registered, or validation failed
    - 422: Invalid data format
    """
    from models import User

    # Validate that either email or phone is provided
    if not user_data.email and not user_data.phone_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either email or phone_number must be provided"
        )

    # Validate phone number if provided
    if user_data.phone_number:
        is_valid, error_msg = validate_phone_number(user_data.phone_number)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )

    # Validate password strength
    is_valid, error_msg = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    # Check if username already exists
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        logger.warning(f"Registration attempt with existing username: {user_data.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Check if email already exists
    if user_data.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            logger.warning(f"Registration attempt with existing email: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    # Check if phone already exists
    if user_data.phone_number:
        existing_phone = db.query(User).filter(User.phone_number == user_data.phone_number).first()
        if existing_phone:
            logger.warning(f"Registration attempt with existing phone: {user_data.phone_number}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )

    # Create new user
    try:
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            phone_number=user_data.phone_number,
            password_hash=hash_password(user_data.password),
            auth_method=user_data.auth_method
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Create JWT token
        access_token = create_access_token(str(new_user.id))

        logger.info(f"✅ User registered successfully: {user_data.username} (auth_method={user_data.auth_method})")

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": JWT_EXPIRATION_HOURS * 3600,
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "phone_number": new_user.phone_number,
                "avatar_url": new_user.avatar_url,
                "is_active": new_user.is_active,
                "is_premium": new_user.is_premium,
                "total_games": new_user.total_games,
                "total_wins": new_user.total_wins,
                "rating": new_user.rating,
                "created_at": new_user.created_at,
                "last_login": new_user.last_login,
                "auth_method": new_user.auth_method
            }
        }
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Registration failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

# ============================================
# LOGIN
# ============================================

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and get JWT token.

    **Request Body**:
    - `username`: Username, email address, or phone number (accepts any of these)
    - `password`: User password

    **Response**:
    - `access_token`: JWT token for authenticated requests
    - `token_type`: Always "bearer"
    - `user`: Authenticated user object with all user details

    **Errors**:
    - 401: Invalid username/email/phone or password
    - 429: Too many login attempts (rate limited)

    **Examples**:
    - Login with username: `{"username": "john_doe", "password": "SecurePass123!"}`
    - Login with email: `{"username": "john@example.com", "password": "SecurePass123!"}`
    - Login with phone: `{"username": "+1234567890", "password": "SecurePass123!"}`
    """
    from models import User

    # Find user by username, email, or phone number
    user = db.query(User).filter(
        (User.username == credentials.username) |
        (User.email == credentials.username) |
        (User.phone_number == credentials.username)
    ).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        logger.warning(f"Failed login attempt for: {credentials.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username, email, phone, or password"
        )

    # Create JWT token
    access_token = create_access_token(str(user.id))

    logger.info(f"✅ User logged in: {user.username}")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": JWT_EXPIRATION_HOURS * 3600,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone_number": user.phone_number,
            "avatar_url": user.avatar_url,
            "is_active": user.is_active,
            "is_premium": user.is_premium,
            "total_games": user.total_games,
            "total_wins": user.total_wins,
            "rating": user.rating,
            "created_at": user.created_at,
            "last_login": user.last_login,
            "auth_method": user.auth_method
        }
    }

# ============================================
# TOKEN REFRESH
# ============================================

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(auth_token: str, db: Session = Depends(get_db)):
    """
    Refresh an expired or expiring JWT token.

    **Query Parameters**:
    - `auth_token`: Current JWT token

    **Response**:
    - `access_token`: New JWT token
    - `token_type`: Always "bearer"
    - `user`: User object

    **Errors**:
    - 401: Invalid or expired token
    """
    from models import User

    user_id = verify_token(auth_token)

    if not user_id:
        logger.warning("Token refresh failed: invalid or expired token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    # Create new JWT token
    new_token = create_access_token(str(user.id))

    logger.info(f"✅ Token refreshed for user: {user.username}")

    return {
        "access_token": new_token,
        "token_type": "bearer",
        "expires_in": JWT_EXPIRATION_HOURS * 3600,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone_number": user.phone_number,
            "avatar_url": user.avatar_url,
            "is_active": user.is_active,
            "is_premium": user.is_premium,
            "total_games": user.total_games,
            "total_wins": user.total_wins,
            "rating": user.rating,
            "created_at": user.created_at,
            "last_login": user.last_login,
            "auth_method": user.auth_method
        }
    }

# ============================================
# TOKEN VERIFICATION
# ============================================

@router.post("/verify")
async def verify_token_endpoint(auth_token: str):
    """
    Verify if a JWT token is valid.

    **Query Parameters**:
    - `auth_token`: JWT token to verify

    **Response**:
    - `valid`: Boolean indicating token validity
    - `user_id`: User ID if valid, null otherwise
    - `message`: Status message

    **Errors**:
    - 200: Token status (check 'valid' field)
    """
    user_id = verify_token(auth_token)

    return {
        "valid": user_id is not None,
        "user_id": user_id,
        "message": "Token is valid" if user_id else "Token is invalid or expired"
    }

# ============================================
# LOGOUT
# ============================================

@router.post("/logout")
async def logout(user_id: str):
    """
    Logout user (invalidate token on client side).

    **Note**: Since we use stateless JWT tokens, logout happens on the client
    by discarding the token. This endpoint can be used for logging logout events.

    **Response**:
    - `message`: Confirmation message
    """
    logger.info(f"✅ User logged out: {user_id}")

    return {
        "message": "Successfully logged out. Please discard your token.",
        "status": "success"
    }
