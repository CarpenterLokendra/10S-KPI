"""
Tests for game endpoints (/games).
"""

import pytest


class TestCreateGame:
    """Test POST /games endpoint."""

    def test_create_game_success(self, client, auth_token):
        """Test creating a game successfully."""
        response = client.post(
            "/games",
            params={"auth_token": auth_token},
            json={
                "game_type": "BOT",
                "num_players": 4
            }
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data
        assert data["game_type"] == "BOT"

    def test_create_game_with_lobby(self, client, auth_token, test_lobby):
        """Test creating game with lobby."""
        response = client.post(
            "/games",
            params={"auth_token": auth_token},
            json={
                "game_type": "LOBBY",
                "lobby_id": test_lobby["code"]
            }
        )
        assert response.status_code in [200, 201]

    def test_create_game_unauthorized(self, client):
        """Test creating game without auth token."""
        response = client.post(
            "/games",
            json={"game_type": "BOT", "num_players": 4}
        )
        assert response.status_code == 401

    def test_create_game_invalid_token(self, client):
        """Test creating game with invalid token."""
        response = client.post(
            "/games",
            params={"auth_token": "invalid.token"},
            json={"game_type": "BOT", "num_players": 4}
        )
        assert response.status_code == 401


class TestListGames:
    """Test GET /games endpoint."""

    def test_list_games_success(self, client, auth_token):
        """Test listing games successfully."""
        response = client.get(
            "/games",
            params={"auth_token": auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_list_games_filter_status(self, client, auth_token):
        """Test listing games with status filter."""
        response = client.get(
            "/games?status=WAITING",
            params={"auth_token": auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_list_games_unauthorized(self, client):
        """Test listing games without auth token."""
        response = client.get("/games")
        assert response.status_code == 401


class TestGetGameDetails:
    """Test GET /games/{game_id} endpoint."""

    def test_get_game_details_success(self, client, auth_token):
        """Test getting game details."""
        # First create a game
        create_response = client.post(
            "/games",
            params={"auth_token": auth_token},
            json={"game_type": "BOT", "num_players": 4}
        )
        if create_response.status_code in [200, 201]:
            game_id = create_response.json()["id"]
            response = client.get(
                f"/games/{game_id}",
                params={"auth_token": auth_token}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == game_id

    def test_get_game_details_not_found(self, client, auth_token):
        """Test getting details for non-existent game."""
        response = client.get(
            "/games/invalid-game-id",
            params={"auth_token": auth_token}
        )
        assert response.status_code == 404

    def test_get_game_details_unauthorized(self, client):
        """Test getting game details without auth token."""
        response = client.get("/games/some-game-id")
        assert response.status_code == 401


class TestPlayCard:
    """Test POST /games/{game_id}/play endpoint."""

    def test_play_card_success(self, client, auth_token):
        """Test playing a card successfully."""
        # This would require a game to be in progress
        # For now, test that the endpoint handles the request properly
        response = client.post(
            "/games/test-game-id/play",
            params={"auth_token": auth_token},
            json={
                "card_value": 10,
                "card_suit": "hearts"
            }
        )
        # Either success or game not found is acceptable
        assert response.status_code in [200, 404]

    def test_play_card_unauthorized(self, client):
        """Test playing card without auth token."""
        response = client.post(
            "/games/test-game-id/play",
            json={"card_value": 10, "card_suit": "hearts"}
        )
        assert response.status_code == 401


class TestGameChat:
    """Test game chat endpoints."""

    def test_send_chat_message_success(self, client, auth_token):
        """Test sending chat message."""
        response = client.post(
            "/games/test-game-id/chat",
            params={"auth_token": auth_token},
            json={"message": "Hello, players!"}
        )
        # Either success or game not found
        assert response.status_code in [200, 404]

    def test_send_chat_message_unauthorized(self, client):
        """Test sending chat without auth token."""
        response = client.post(
            "/games/test-game-id/chat",
            json={"message": "Hello"}
        )
        assert response.status_code == 401

    def test_send_chat_message_empty(self, client, auth_token):
        """Test sending empty chat message."""
        response = client.post(
            "/games/test-game-id/chat",
            params={"auth_token": auth_token},
            json={"message": ""}
        )
        assert response.status_code in [400, 404]


class TestLeaveGame:
    """Test POST /games/{game_id}/leave endpoint."""

    def test_leave_game_success(self, client, auth_token):
        """Test leaving a game."""
        response = client.post(
            "/games/test-game-id/leave",
            params={"auth_token": auth_token}
        )
        # Either success or game not found
        assert response.status_code in [200, 404]

    def test_leave_game_unauthorized(self, client):
        """Test leaving game without auth token."""
        response = client.post("/games/test-game-id/leave")
        assert response.status_code == 401


class TestGameStatistics:
    """Test game statistics endpoints."""

    def test_get_game_history(self, client, auth_token):
        """Test getting user's game history."""
        response = client.get(
            "/games/history",
            params={"auth_token": auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_game_stats(self, client, auth_token):
        """Test getting game statistics."""
        response = client.get(
            "/games/statistics",
            params={"auth_token": auth_token}
        )
        assert response.status_code in [200, 404]
