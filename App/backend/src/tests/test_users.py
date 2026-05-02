"""
Tests for user endpoints (/users).
"""

import pytest


class TestGetCurrentUser:
    """Test GET /users/me endpoint."""

    def test_get_current_user_success(self, client, auth_token):
        """Test getting current user info successfully."""
        response = client.get(
            "/users/me",
            params={"auth_token": auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"

    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without auth token."""
        response = client.get("/users/me")
        assert response.status_code == 401

    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token."""
        response = client.get(
            "/users/me",
            params={"auth_token": "invalid.token"}
        )
        assert response.status_code == 401

    def test_get_current_user_response_format(self, client, auth_token):
        """Test response contains all user fields."""
        response = client.get(
            "/users/me",
            params={"auth_token": auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "username" in data
        assert "email" in data
        assert "phone_number" in data
        assert "avatar_url" in data
        assert "is_active" in data
        assert "is_premium" in data
        assert "total_games" in data


class TestGetUserProfile:
    """Test GET /users/{user_id} endpoint."""

    def test_get_user_profile_success(self, client, test_user):
        """Test getting user profile successfully."""
        response = client.get(f"/users/{test_user.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"

    def test_get_user_profile_not_found(self, client):
        """Test getting profile for non-existent user."""
        response = client.get("/users/invalid-user-id")
        assert response.status_code == 404

    def test_get_user_profile_response_format(self, client, test_user):
        """Test response contains user fields."""
        response = client.get(f"/users/{test_user.id}")
        assert response.status_code == 200
        data = response.json()
        assert "username" in data
        assert "email" in data
        assert "is_active" in data


class TestUpdateUserProfile:
    """Test PUT/PATCH /users endpoint."""

    def test_update_avatar_success(self, client, auth_token):
        """Test updating user avatar successfully."""
        response = client.put(
            "/users",
            params={"auth_token": auth_token},
            json={
                "avatar_url": "https://example.com/avatar.jpg"
            }
        )
        assert response.status_code == 200

    def test_update_username_success(self, client, auth_token):
        """Test updating username successfully."""
        response = client.put(
            "/users",
            params={"auth_token": auth_token},
            json={
                "username": "newusername"
            }
        )
        assert response.status_code == 200

    def test_update_unauthorized(self, client):
        """Test updating profile without auth token."""
        response = client.put(
            "/users",
            json={"username": "newname"}
        )
        assert response.status_code == 401

    def test_update_invalid_token(self, client):
        """Test updating with invalid token."""
        response = client.put(
            "/users",
            params={"auth_token": "invalid.token"},
            json={"username": "newname"}
        )
        assert response.status_code == 401


class TestUserStatistics:
    """Test user statistics endpoints."""

    def test_get_user_statistics_success(self, client, test_user):
        """Test getting user statistics."""
        response = client.get(f"/users/{test_user.id}/statistics")
        assert response.status_code == 200
        data = response.json()
        assert "total_games_played" in data
        assert "total_games_won" in data
        assert "win_rate" in data
        assert "rating" in data

    def test_get_user_statistics_not_found(self, client):
        """Test getting statistics for non-existent user."""
        response = client.get("/users/invalid-user-id/statistics")
        assert response.status_code == 404
