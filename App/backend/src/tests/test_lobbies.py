"""
Tests for lobby endpoints (/lobbies).
"""

import pytest


class TestCreateLobby:
    """Test POST /lobbies endpoint."""

    def test_create_lobby_success(self, client, auth_token):
        """Test successful lobby creation."""
        response = client.post(
            "/lobbies",
            params={
                "max_players": 4,
                "auth_token": auth_token
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "code" in data
        assert data["max_players"] == 4
        assert data["current_players"] == 1
        assert data["status"] == "waiting"
        assert "creator_id" in data
        assert "created_at" in data

    def test_create_lobby_default_players(self, client, auth_token):
        """Test lobby creation with default max_players."""
        response = client.post(
            "/lobbies",
            params={"auth_token": auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["max_players"] == 4  # Default

    def test_create_lobby_min_players(self, client, auth_token):
        """Test lobby creation with minimum players."""
        response = client.post(
            "/lobbies",
            params={
                "max_players": 2,
                "auth_token": auth_token
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["max_players"] == 2

    def test_create_lobby_max_players(self, client, auth_token):
        """Test lobby creation with maximum players."""
        response = client.post(
            "/lobbies",
            params={
                "max_players": 6,
                "auth_token": auth_token
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["max_players"] == 6

    def test_create_lobby_players_too_low(self, client, auth_token):
        """Test lobby creation fails with too few players."""
        response = client.post(
            "/lobbies",
            params={
                "max_players": 1,
                "auth_token": auth_token
            }
        )
        assert response.status_code == 400
        assert "between 2 and 6" in response.json()["detail"]

    def test_create_lobby_players_too_high(self, client, auth_token):
        """Test lobby creation fails with too many players."""
        response = client.post(
            "/lobbies",
            params={
                "max_players": 7,
                "auth_token": auth_token
            }
        )
        assert response.status_code == 400
        assert "between 2 and 6" in response.json()["detail"]

    def test_create_lobby_unauthorized(self, client):
        """Test lobby creation fails without auth token."""
        response = client.post(
            "/lobbies",
            params={"max_players": 4}
        )
        assert response.status_code == 401
        assert "Authentication required" in response.json()["detail"]

    def test_create_lobby_invalid_token(self, client):
        """Test lobby creation fails with invalid token."""
        response = client.post(
            "/lobbies",
            params={
                "max_players": 4,
                "auth_token": "invalid.token"
            }
        )
        assert response.status_code == 401

    def test_create_multiple_lobbies(self, client, auth_token):
        """Test creating multiple lobbies."""
        response1 = client.post(
            "/lobbies",
            params={"max_players": 4, "auth_token": auth_token}
        )
        response2 = client.post(
            "/lobbies",
            params={"max_players": 5, "auth_token": auth_token}
        )
        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response1.json()["code"] != response2.json()["code"]

    def test_lobby_code_format(self, client, auth_token):
        """Test that lobby code is 6 characters."""
        response = client.post(
            "/lobbies",
            params={"max_players": 4, "auth_token": auth_token}
        )
        assert response.status_code == 200
        code = response.json()["code"]
        assert len(code) == 6
        assert code.isupper()


class TestListLobbies:
    """Test GET /lobbies endpoint."""

    def test_list_lobbies_default(self, client, test_lobby):
        """Test listing lobbies with default status."""
        response = client.get("/lobbies")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["status"] == "waiting"

    def test_list_lobbies_waiting_status(self, client, test_lobby):
        """Test listing lobbies with waiting status filter."""
        response = client.get("/lobbies?lobby_status=waiting")
        assert response.status_code == 200
        data = response.json()
        assert all(lobby["status"] == "waiting" for lobby in data)

    def test_list_lobbies_playing_status(self, client):
        """Test listing lobbies with playing status."""
        response = client.get("/lobbies?lobby_status=in_progress")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert all(lobby["status"] == "in_progress" for lobby in data)

    def test_list_lobbies_finished_status(self, client):
        """Test listing lobbies with finished status."""
        response = client.get("/lobbies?lobby_status=closed")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert all(lobby["status"] == "closed" for lobby in data)

    def test_list_lobbies_invalid_status(self, client):
        """Test listing lobbies with invalid status."""
        response = client.get("/lobbies?lobby_status=invalid")
        assert response.status_code == 400
        assert "Invalid status" in response.json()["detail"]

    def test_list_empty_lobbies(self, client):
        """Test listing when no lobbies exist."""
        response = client.get("/lobbies?lobby_status=in_progress")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0

    def test_list_lobbies_response_format(self, client, test_lobby):
        """Test response format for list lobbies."""
        response = client.get("/lobbies")
        assert response.status_code == 200
        data = response.json()
        lobby = data[0]
        assert "code" in lobby
        assert "creator_id" in lobby
        assert "max_players" in lobby
        assert "current_players" in lobby
        assert "status" in lobby
        assert "created_at" in lobby


class TestGetLobbyDetails:
    """Test GET /lobbies/{code} endpoint."""

    def test_get_lobby_details_success(self, client, test_lobby):
        """Test getting lobby details successfully."""
        code = test_lobby["code"]
        response = client.get(f"/lobbies/{code}")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == code
        assert data["status"] == "waiting"
        assert "creator_id" in data
        assert "max_players" in data

    def test_get_lobby_details_not_found(self, client):
        """Test getting details for non-existent lobby."""
        response = client.get("/lobbies/NOTFND")
        assert response.status_code == 404
        assert "Lobby not found" in response.json()["detail"]

    def test_get_lobby_details_invalid_code(self, client):
        """Test with invalid lobby code format."""
        response = client.get("/lobbies/invalid")
        assert response.status_code == 404


class TestJoinLobby:
    """Test POST /lobbies/{code}/join endpoint."""

    def test_join_lobby_success(self, client, test_lobby, auth_token_2):
        """Test successfully joining a lobby."""
        code = test_lobby["code"]
        response = client.post(
            f"/lobbies/{code}/join",
            params={"auth_token": auth_token_2}
        )
        assert response.status_code == 200
        assert "Successfully joined" in response.json()["message"]

    def test_join_lobby_unauthorized(self, client, test_lobby):
        """Test joining lobby without auth token."""
        code = test_lobby["code"]
        response = client.post(f"/lobbies/{code}/join")
        assert response.status_code == 401
        assert "Authentication required" in response.json()["detail"]

    def test_join_lobby_invalid_token(self, client, test_lobby):
        """Test joining lobby with invalid token."""
        code = test_lobby["code"]
        response = client.post(
            f"/lobbies/{code}/join",
            params={"auth_token": "invalid.token"}
        )
        assert response.status_code == 401

    def test_join_nonexistent_lobby(self, client, auth_token_2):
        """Test joining a lobby that doesn't exist."""
        response = client.post(
            "/lobbies/NOTFND/join",
            params={"auth_token": auth_token_2}
        )
        assert response.status_code == 404
        assert "Lobby not found" in response.json()["detail"]


class TestLeaveLobby:
    """Test POST /lobbies/{code}/leave endpoint."""

    def test_leave_lobby_success(self, client, test_lobby, auth_token):
        """Test successfully leaving a lobby."""
        code = test_lobby["code"]
        response = client.post(
            f"/lobbies/{code}/leave",
            params={"auth_token": auth_token}
        )
        assert response.status_code == 200
        assert "Successfully left" in response.json()["message"]

    def test_leave_lobby_unauthorized(self, client, test_lobby):
        """Test leaving lobby without auth token."""
        code = test_lobby["code"]
        response = client.post(f"/lobbies/{code}/leave")
        assert response.status_code == 401
        assert "Authentication required" in response.json()["detail"]

    def test_leave_nonexistent_lobby(self, client, auth_token):
        """Test leaving a lobby that doesn't exist."""
        response = client.post(
            "/lobbies/NOTFND/leave",
            params={"auth_token": auth_token}
        )
        assert response.status_code == 404
        assert "Lobby not found" in response.json()["detail"]


class TestStartGame:
    """Test POST /lobbies/{code}/start endpoint."""

    def test_start_game_success(self, client, test_lobby, auth_token):
        """Test successfully starting a game from lobby."""
        code = test_lobby["code"]
        response = client.post(
            f"/lobbies/{code}/start",
            params={"auth_token": auth_token}
        )
        assert response.status_code == 200
        assert "Game started successfully" in response.json()["message"]
        assert "game_id" in response.json()

    def test_start_game_unauthorized(self, client, test_lobby):
        """Test starting game without auth token."""
        code = test_lobby["code"]
        response = client.post(f"/lobbies/{code}/start")
        assert response.status_code == 401
        assert "Authentication required" in response.json()["detail"]

    def test_start_game_invalid_token(self, client, test_lobby):
        """Test starting game with invalid token."""
        code = test_lobby["code"]
        response = client.post(
            f"/lobbies/{code}/start",
            params={"auth_token": "invalid.token"}
        )
        assert response.status_code == 401

    def test_start_game_not_creator(self, client, test_lobby, auth_token_2):
        """Test non-creator cannot start game."""
        code = test_lobby["code"]
        response = client.post(
            f"/lobbies/{code}/start",
            params={"auth_token": auth_token_2}
        )
        assert response.status_code == 403
        assert "Only lobby creator can start" in response.json()["detail"]

    def test_start_nonexistent_lobby(self, client, auth_token):
        """Test starting game in non-existent lobby."""
        response = client.post(
            "/lobbies/NOTFND/start",
            params={"auth_token": auth_token}
        )
        assert response.status_code == 404
        assert "Lobby not found" in response.json()["detail"]
