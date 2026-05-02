"""
Tests for authentication endpoints (/auth).
"""

import pytest
from datetime import datetime


class TestUserRegistration:
    """Test POST /auth/register endpoint."""

    def test_register_with_email_success(self, client):
        """Test successful user registration with email."""
        response = client.post(
            "/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "SecurePassword123!",
                "auth_method": "email"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert data["user"]["username"] == "newuser"
        assert data["user"]["email"] == "newuser@example.com"

    def test_register_with_phone_success(self, client):
        """Test successful user registration with phone number."""
        response = client.post(
            "/auth/register",
            json={
                "username": "phoneuser",
                "phone_number": "+1234567890",
                "password": "SecurePassword123!",
                "auth_method": "phone"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["phone_number"] == "+1234567890"

    def test_register_with_both_email_and_phone(self, client):
        """Test registration with both email and phone."""
        response = client.post(
            "/auth/register",
            json={
                "username": "bothuser",
                "email": "both@example.com",
                "phone_number": "+1112223333",
                "password": "SecurePassword123!",
                "auth_method": "email"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == "both@example.com"
        assert data["user"]["phone_number"] == "+1112223333"

    def test_register_missing_email_and_phone(self, client):
        """Test registration fails when both email and phone are missing."""
        response = client.post(
            "/auth/register",
            json={
                "username": "nocontact",
                "password": "SecurePassword123!"
            }
        )
        assert response.status_code == 400
        assert "Either email or phone_number must be provided" in response.json()["detail"]

    def test_register_duplicate_username(self, client, test_user):
        """Test registration fails with duplicate username."""
        response = client.post(
            "/auth/register",
            json={
                "username": "testuser",
                "email": "different@example.com",
                "password": "SecurePassword123!"
            }
        )
        assert response.status_code == 400
        assert "Username already registered" in response.json()["detail"]

    def test_register_duplicate_email(self, client, test_user):
        """Test registration fails with duplicate email."""
        response = client.post(
            "/auth/register",
            json={
                "username": "newusername",
                "email": "test@example.com",
                "password": "SecurePassword123!"
            }
        )
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_register_duplicate_phone(self, client, test_user):
        """Test registration fails with duplicate phone."""
        response = client.post(
            "/auth/register",
            json={
                "username": "newusername",
                "phone_number": "+1234567890",
                "password": "SecurePassword123!"
            }
        )
        assert response.status_code == 400
        assert "Phone number already registered" in response.json()["detail"]

    def test_register_weak_password_too_short(self, client):
        """Test registration fails with password too short."""
        response = client.post(
            "/auth/register",
            json={
                "username": "weakpass",
                "email": "weak@example.com",
                "password": "Short1!", "auth_method": "email"
            }
        )
        assert response.status_code == 400
        assert "at least 8 characters" in response.json()["detail"]

    def test_register_weak_password_no_uppercase(self, client):
        """Test registration fails without uppercase letter."""
        response = client.post(
            "/auth/register",
            json={
                "username": "noupper",
                "email": "noupper@example.com",
                "password": "lowercase123!"
            }
        )
        assert response.status_code == 400
        assert "uppercase letter" in response.json()["detail"]

    def test_register_weak_password_no_lowercase(self, client):
        """Test registration fails without lowercase letter."""
        response = client.post(
            "/auth/register",
            json={
                "username": "nolower",
                "email": "nolower@example.com",
                "password": "UPPERCASE123!"
            }
        )
        assert response.status_code == 400
        assert "lowercase letter" in response.json()["detail"]

    def test_register_weak_password_no_digit(self, client):
        """Test registration fails without digit."""
        response = client.post(
            "/auth/register",
            json={
                "username": "nodigit",
                "email": "nodigit@example.com",
                "password": "OnlyLetters!"
            }
        )
        assert response.status_code == 400
        assert "digit" in response.json()["detail"]

    def test_register_weak_password_no_special_char(self, client):
        """Test registration fails without special character."""
        response = client.post(
            "/auth/register",
            json={
                "username": "nospecial",
                "email": "nospecial@example.com",
                "password": "OnlyLetters123"
            }
        )
        assert response.status_code == 400
        assert "special character" in response.json()["detail"]

    def test_register_invalid_email(self, client):
        """Test registration with invalid email format."""
        response = client.post(
            "/auth/register",
            json={
                "username": "invalidemail",
                "email": "not-an-email",
                "password": "SecurePassword123!"
            }
        )
        assert response.status_code == 422  # Validation error

    def test_register_invalid_phone(self, client):
        """Test registration with invalid phone format."""
        response = client.post(
            "/auth/register",
            json={
                "username": "invalidphone",
                "phone_number": "123",  # Too short
                "password": "SecurePassword123!"
            }
        )
        assert response.status_code == 400
        assert "Phone number" in response.json()["detail"]


class TestUserLogin:
    """Test POST /auth/login endpoint."""

    def test_login_with_username_success(self, client, test_user):
        """Test successful login with username."""
        response = client.post(
            "/auth/login",
            json={
                "username": "testuser",
                "password": "TestPassword123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == "testuser"

    def test_login_with_email_success(self, client, test_user):
        """Test successful login with email."""
        response = client.post(
            "/auth/login",
            json={
                "username": "test@example.com",
                "password": "TestPassword123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["username"] == "testuser"

    def test_login_with_phone_success(self, client, test_user):
        """Test successful login with phone number."""
        response = client.post(
            "/auth/login",
            json={
                "username": "+1234567890",
                "password": "TestPassword123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["username"] == "testuser"

    def test_login_invalid_password(self, client, test_user):
        """Test login fails with wrong password."""
        response = client.post(
            "/auth/login",
            json={
                "username": "testuser",
                "password": "WrongPassword123!"
            }
        )
        assert response.status_code == 401
        assert "Invalid" in response.json()["detail"]

    def test_login_nonexistent_user(self, client):
        """Test login fails for nonexistent user."""
        response = client.post(
            "/auth/login",
            json={
                "username": "doesnotexist",
                "password": "AnyPassword123!"
            }
        )
        assert response.status_code == 401
        assert "Invalid" in response.json()["detail"]

    def test_login_empty_credentials(self, client):
        """Test login with empty credentials."""
        response = client.post(
            "/auth/login",
            json={
                "username": "",
                "password": ""
            }
        )
        assert response.status_code == 401

    def test_token_contains_expiration(self, client, test_user):
        """Test that token response includes expiration."""
        response = client.post(
            "/auth/login",
            json={
                "username": "testuser",
                "password": "TestPassword123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "expires_in" in data
        assert data["expires_in"] == 24 * 3600  # 24 hours in seconds


class TestTokenRefresh:
    """Test POST /auth/refresh endpoint."""

    def test_refresh_token_success(self, client, auth_token):
        """Test successful token refresh."""
        response = client.post(
            "/auth/refresh",
            params={"auth_token": auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_refresh_invalid_token(self, client):
        """Test refresh with invalid token."""
        response = client.post(
            "/auth/refresh",
            params={"auth_token": "invalid.token.here"}
        )
        assert response.status_code == 401
        assert "Invalid or expired token" in response.json()["detail"]

    def test_refresh_empty_token(self, client):
        """Test refresh with empty token."""
        response = client.post(
            "/auth/refresh",
            params={"auth_token": ""}
        )
        assert response.status_code == 401


class TestTokenVerify:
    """Test POST /auth/verify endpoint."""

    def test_verify_valid_token(self, client, auth_token):
        """Test token verification with valid token."""
        response = client.post(
            "/auth/verify",
            params={"auth_token": auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["user_id"] is not None

    def test_verify_invalid_token(self, client):
        """Test token verification with invalid token."""
        response = client.post(
            "/auth/verify",
            params={"auth_token": "invalid.token.here"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert data["user_id"] is None

    def test_verify_empty_token(self, client):
        """Test token verification with empty token."""
        response = client.post(
            "/auth/verify",
            params={"auth_token": ""}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False


class TestLogout:
    """Test POST /auth/logout endpoint."""

    def test_logout_success(self, client, auth_token):
        """Test successful logout."""
        response = client.post(
            "/auth/logout",
            params={"user_id": "test-user-id"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "Successfully logged out" in data["message"]
        assert data["status"] == "success"
