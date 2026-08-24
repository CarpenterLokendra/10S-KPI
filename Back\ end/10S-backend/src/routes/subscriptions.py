"""
Multi-currency subscription management routes.

Endpoints:
  POST   /v1/subscriptions/create-order         - Create payment order
  POST   /v1/subscriptions/verify               - Verify payment and grant premium
  GET    /v1/subscriptions/current              - Get current user's subscription
  POST   /v1/subscriptions/{id}/cancel          - Cancel subscription
  GET    /v1/subscriptions/plans                - Get available pricing plans
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Depends, Request, Body
from sqlalchemy.orm import Session
from loguru import logger
from pydantic import BaseModel

from ..database import get_db
from ..security import verify_token
from ..models import User, PremiumSubscription
from ..pricing_config import get_price, get_renewal_days, is_valid_currency, is_valid_billing_period, PRICING_TIERS, Currency, BillingPeriod
from ..rate_limiter import limiter
from ..payment_processor import RazorpayPaymentProcessor, PaymentProcessingError

router = APIRouter(prefix="/v1/subscriptions", tags=["subscriptions"])

# ============================================
# REQUEST/RESPONSE SCHEMAS
# ============================================

class CreateOrderRequest(BaseModel):
    """Request to create a payment order."""
    currency: str  # USD, EUR, GBP, INR, CAD, AUD, JPY
    billing_period: str  # monthly, yearly

class CreateOrderResponse(BaseModel):
    """Response with order details."""
    order_id: str
    razorpay_key_id: str
    amount: int
    currency: str
    billing_period: str
    description: str

class VerifyPaymentRequest(BaseModel):
    """Request to verify payment."""
    order_id: str
    payment_id: str
    signature: str
    currency: str
    billing_period: str

class SubscriptionResponse(BaseModel):
    """Active subscription details."""
    id: str
    user_id: str
    currency: str
    billing_period: str
    amount: float
    started_at: datetime
    expires_at: datetime
    is_active: bool
    payment_provider: str

class PlansResponse(BaseModel):
    """Available pricing plans."""
    plans: dict

# ============================================
# DEPENDENCY: GET CURRENT USER
# ============================================

async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Get authenticated user from JWT token."""
    token_value = request.cookies.get("auth_token")

    if not token_value:
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            token_value = auth_header[7:]

    if not token_value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user_id = verify_token(token_value)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user

# ============================================
# GET AVAILABLE PLANS
# ============================================

@router.get("/plans")
async def get_subscription_plans():
    """Get all available subscription plans with pricing."""
    plans = {}

    for currency in Currency:
        plans[currency.value] = {
            "monthly": {
                "amount": PRICING_TIERS[currency][BillingPeriod.MONTHLY],
                "currency": currency.value,
                "period": "monthly"
            },
            "yearly": {
                "amount": PRICING_TIERS[currency][BillingPeriod.YEARLY],
                "currency": currency.value,
                "period": "yearly",
                "discount_percentage": 32
            }
        }

    return PlansResponse(plans=plans)

# ============================================
# CREATE PAYMENT ORDER
# ============================================

@router.post("/create-order")
@limiter.limit("10/minute")
async def create_subscription_order(
    request: Request,
    payload: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Create a Razorpay order for subscription.

    **Request body**:
    - `currency`: Currency code (USD, EUR, GBP, INR, CAD, AUD, JPY)
    - `billing_period`: 'monthly' or 'yearly'

    **Response**: Order details including order_id and amount
    """

    # Validate currency and billing period
    if not is_valid_currency(payload.currency):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid currency: {payload.currency}"
        )

    if not is_valid_billing_period(payload.billing_period):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid billing period: {payload.billing_period}"
        )

    try:
        # Get pricing
        amount, currency = get_price(payload.currency, payload.billing_period)

        # Create order via Razorpay
        order_data = RazorpayPaymentProcessor.create_order(
            amount=amount,
            currency=currency,
            billing_period=payload.billing_period
        )

        logger.info(
            f"Order created for user {current_user.id}: "
            f"{order_data['order_id']} - {currency} {amount} ({payload.billing_period})"
        )

        return CreateOrderResponse(
            order_id=order_data['order_id'],
            razorpay_key_id=order_data['razorpay_key_id'],
            amount=amount,
            currency=currency,
            billing_period=payload.billing_period,
            description=f"Ad-Free Subscription - {payload.billing_period.capitalize()}"
        )

    except PaymentProcessingError as e:
        logger.warning(f"Failed to create order for user {current_user.id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error creating order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")

# ============================================
# VERIFY PAYMENT
# ============================================

@router.post("/verify")
@limiter.limit("10/minute")
async def verify_subscription_payment(
    request: Request,
    payload: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify Razorpay payment and grant premium subscription.

    **Request body**:
    - `order_id`: Razorpay order ID
    - `payment_id`: Razorpay payment ID
    - `signature`: Razorpay signature for verification
    - `currency`: Currency code
    - `billing_period`: 'monthly' or 'yearly'

    **Response**: User subscription details
    """

    try:
        # Validate inputs
        if not is_valid_currency(payload.currency):
            raise HTTPException(status_code=400, detail=f"Invalid currency: {payload.currency}")

        if not is_valid_billing_period(payload.billing_period):
            raise HTTPException(status_code=400, detail=f"Invalid billing period: {payload.billing_period}")

        # Verify payment signature
        success, payment_id = RazorpayPaymentProcessor.verify_payment(
            payload.order_id,
            payload.payment_id,
            payload.signature
        )

        if not success:
            raise HTTPException(status_code=400, detail="Payment verification failed")

        # Get pricing and calculate expiry
        amount, currency = get_price(payload.currency, payload.billing_period)
        renewal_days = get_renewal_days(payload.billing_period)

        now = datetime.utcnow()
        expires_at = now + timedelta(days=renewal_days)

        # Update user premium status
        current_user.is_premium = True
        current_user.premium_expiry = expires_at

        # Update or create subscription record
        existing = db.query(PremiumSubscription).filter(
            PremiumSubscription.user_id == current_user.id
        ).first()

        if existing:
            existing.is_active = True
            existing.started_at = now
            existing.expires_at = expires_at
            existing.last_renewed_at = now
            existing.payment_provider = "razorpay"
            existing.payment_reference = payment_id
            existing.currency = payload.currency
            existing.billing_period = payload.billing_period
            existing.amount = amount / 100.0  # Convert paise/cents to decimal
            subscription = existing
        else:
            subscription = PremiumSubscription(
                user_id=current_user.id,
                subscription_tier="premium",
                price_usd=amount / 100.0,
                currency=payload.currency,
                billing_period=payload.billing_period,
                amount=amount / 100.0,
                is_active=True,
                started_at=now,
                expires_at=expires_at,
                payment_provider="razorpay",
                payment_reference=payment_id,
                platform="web"
            )
            db.add(subscription)

        db.commit()
        db.refresh(current_user)
        db.refresh(subscription)

        logger.info(
            f"✅ Premium granted to user {current_user.id} via Razorpay: "
            f"{payment_id} - {payload.currency} {payload.billing_period}"
        )

        return SubscriptionResponse(
            id=subscription.id,
            user_id=subscription.user_id,
            currency=subscription.currency,
            billing_period=subscription.billing_period,
            amount=subscription.amount,
            started_at=subscription.started_at,
            expires_at=subscription.expires_at,
            is_active=subscription.is_active,
            payment_provider=subscription.payment_provider
        )

    except HTTPException:
        raise
    except PaymentProcessingError as e:
        logger.warning(f"Payment verification failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error verifying payment: {e}")
        raise HTTPException(status_code=500, detail="Payment verification failed")

# ============================================
# GET CURRENT SUBSCRIPTION
# ============================================

@router.get("/current")
async def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's active subscription.

    **Response**: Subscription details or null if not subscribed
    """

    subscription = db.query(PremiumSubscription).filter(
        PremiumSubscription.user_id == current_user.id,
        PremiumSubscription.is_active == True
    ).first()

    if not subscription:
        return {
            "is_active": False,
            "subscription": None
        }

    return {
        "is_active": True,
        "subscription": SubscriptionResponse(
            id=subscription.id,
            user_id=subscription.user_id,
            currency=subscription.currency,
            billing_period=subscription.billing_period,
            amount=subscription.amount,
            started_at=subscription.started_at,
            expires_at=subscription.expires_at,
            is_active=subscription.is_active,
            payment_provider=subscription.payment_provider
        )
    }

# ============================================
# CANCEL SUBSCRIPTION
# ============================================

@router.post("/{subscription_id}/cancel")
@limiter.limit("5/minute")
async def cancel_subscription(
    subscription_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel an active subscription.

    **Path parameters**:
    - `subscription_id`: ID of subscription to cancel

    **Response**: Cancellation confirmation
    """

    subscription = db.query(PremiumSubscription).filter(
        PremiumSubscription.id == subscription_id,
        PremiumSubscription.user_id == current_user.id
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=404,
            detail="Subscription not found"
        )

    if not subscription.is_active:
        raise HTTPException(
            status_code=400,
            detail="Subscription is already cancelled"
        )

    # Cancel subscription
    subscription.is_active = False
    subscription.renewal_enabled = False

    # Keep premium until expiry (don't revoke immediately)
    # User keeps access until current period ends

    db.commit()
    db.refresh(subscription)

    logger.info(f"✅ Subscription cancelled for user {current_user.id}: {subscription_id}")

    return {
        "success": True,
        "message": "Subscription cancelled successfully",
        "subscription_id": subscription_id,
        "access_until": subscription.expires_at
    }
