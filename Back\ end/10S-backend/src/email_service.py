"""
Email service for sending verification codes and notifications
"""

import smtplib
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from loguru import logger
from .config import SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD


def generate_verification_code() -> str:
    """Generate a 6-digit numeric verification code"""
    code = secrets.randbelow(1_000_000)
    return str(code).zfill(6)


def send_verification_email(to_email: str, username: str, code: str) -> bool:
    """
    Send verification code email to user

    Args:
        to_email: recipient email address
        username: recipient username for personalization
        code: 6-digit verification code

    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        if not all([SMTP_SERVER, SMTP_USER, SMTP_PASSWORD]):
            logger.warning("❌ SMTP credentials not configured - email sending disabled")
            return False

        # Create message
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = "Verify Your Email - 10S Card Game"

        # Email body
        body = f"""
Hello {username},

Thank you for signing up for 10S Card Game!

Your email verification code is: {code}

This code will expire in 10 minutes.

Please enter this code in the app to verify your email and start playing.

If you didn't sign up for 10S Card Game, please ignore this email.

Best regards,
10S Card Game Team
"""

        msg.attach(MIMEText(body, 'plain'))

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)

        logger.info(f"✅ Verification email sent to {to_email}")
        return True

    except Exception as e:
        logger.error(f"❌ Failed to send verification email to {to_email}: {str(e)}")
        return False
