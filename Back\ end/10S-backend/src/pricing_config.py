"""
Multi-currency and multi-period subscription pricing configuration.

Pricing tiers for 7 currencies with monthly and yearly billing periods.
All currencies maintain 32% yearly discount.
"""

from typing import Dict, Tuple
from enum import Enum

class Currency(str, Enum):
    """Supported currencies for subscription."""
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    INR = "INR"
    CAD = "CAD"
    AUD = "AUD"
    JPY = "JPY"

class BillingPeriod(str, Enum):
    """Supported billing periods."""
    MONTHLY = "monthly"
    YEARLY = "yearly"

# Pricing tiers: { currency: { period: amount_in_lowest_denomination } }
# For currencies with decimal places (USD, EUR, etc.), amounts are in cents
# For currencies without decimals (JPY), amounts are in base units
PRICING_TIERS: Dict[Currency, Dict[BillingPeriod, int]] = {
    Currency.USD: {
        BillingPeriod.MONTHLY: 49,      # $0.49
        BillingPeriod.YEARLY: 399,      # $3.99 (32% discount)
    },
    Currency.EUR: {
        BillingPeriod.MONTHLY: 49,      # €0.49
        BillingPeriod.YEARLY: 399,      # €3.99 (32% discount)
    },
    Currency.GBP: {
        BillingPeriod.MONTHLY: 49,      # £0.49
        BillingPeriod.YEARLY: 399,      # £3.99 (32% discount)
    },
    Currency.INR: {
        BillingPeriod.MONTHLY: 4900,    # ₹49
        BillingPeriod.YEARLY: 39900,    # ₹399 (32% discount)
    },
    Currency.CAD: {
        BillingPeriod.MONTHLY: 49,      # C$0.49
        BillingPeriod.YEARLY: 399,      # C$3.99 (32% discount)
    },
    Currency.AUD: {
        BillingPeriod.MONTHLY: 49,      # A$0.49
        BillingPeriod.YEARLY: 399,      # A$3.99 (32% discount)
    },
    Currency.JPY: {
        BillingPeriod.MONTHLY: 49,      # ¥49
        BillingPeriod.YEARLY: 399,      # ¥399 (32% discount)
    },
}

# Renewal duration in days: { period: days }
RENEWAL_DURATION: Dict[BillingPeriod, int] = {
    BillingPeriod.MONTHLY: 30,
    BillingPeriod.YEARLY: 365,
}

def get_price(currency: str, billing_period: str) -> Tuple[int, str]:
    """
    Get the price for a given currency and billing period.

    Args:
        currency: Currency code (e.g., 'USD', 'INR')
        billing_period: 'monthly' or 'yearly'

    Returns:
        Tuple of (amount_in_lowest_denomination, display_currency_code)

    Raises:
        ValueError: If currency or billing_period is invalid
    """
    try:
        currency_enum = Currency[currency.upper()]
        period_enum = BillingPeriod[billing_period.upper()]
    except KeyError:
        raise ValueError(f"Invalid currency or billing period: {currency}, {billing_period}")

    amount = PRICING_TIERS[currency_enum][period_enum]
    return amount, currency_enum.value

def get_renewal_days(billing_period: str) -> int:
    """Get the number of days for a billing period."""
    try:
        period_enum = BillingPeriod[billing_period.upper()]
        return RENEWAL_DURATION[period_enum]
    except KeyError:
        raise ValueError(f"Invalid billing period: {billing_period}")

def is_valid_currency(currency: str) -> bool:
    """Check if a currency is supported."""
    return currency.upper() in Currency.__members__

def is_valid_billing_period(period: str) -> bool:
    """Check if a billing period is supported."""
    return period.lower() in BillingPeriod.__members__

def get_supported_currencies() -> list:
    """Get list of all supported currencies."""
    return [c.value for c in Currency]

def get_supported_periods() -> list:
    """Get list of all supported billing periods."""
    return [p.value for p in BillingPeriod]
