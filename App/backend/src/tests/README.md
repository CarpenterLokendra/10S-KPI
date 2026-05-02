# API Test Suite

Comprehensive test suite for the 10S Card Game API with multiple scenarios for each endpoint.

## Overview

This test suite covers all API endpoints with various test scenarios including:
- ✅ Success cases
- ❌ Error cases
- 🔐 Authentication scenarios
- ✔️ Validation scenarios
- 🎯 Edge cases

## Test Files

### `conftest.py`
Pytest configuration and shared fixtures:
- Database setup/teardown
- Test client initialization
- User fixtures (test_user, test_user_2)
- Auth token fixtures
- Lobby fixtures

### `test_auth.py`
Authentication endpoints tests:
- **POST /auth/register** - 15 test cases
  - Success with email/phone
  - Password validation
  - Duplicate detection
  - Invalid input
- **POST /auth/login** - 6 test cases
  - Login with username/email/phone
  - Invalid credentials
  - Error handling
- **POST /auth/refresh** - 3 test cases
  - Token refresh
  - Invalid tokens
- **POST /auth/verify** - 3 test cases
  - Token verification
  - Invalid tokens
- **POST /auth/logout** - 1 test case

### `test_lobbies.py`
Lobby management endpoints tests:
- **POST /lobbies** - 10 test cases
  - Successful creation
  - Player count validation
  - Auth validation
  - Multiple lobbies
- **GET /lobbies** - 7 test cases
  - List with status filters
  - Empty results
  - Response format
- **GET /lobbies/{code}** - 3 test cases
  - Get details
  - Not found errors
- **POST /lobbies/{code}/join** - 4 test cases
  - Join success
  - Auth validation
  - Lobby not found
- **POST /lobbies/{code}/leave** - 3 test cases
  - Leave success
  - Auth validation
- **POST /lobbies/{code}/start** - 5 test cases
  - Start game
  - Creator validation
  - Auth validation

### `test_users.py`
User endpoints tests:
- **GET /users/me** - Current user
- **GET /users/{user_id}** - User profile
- **PUT /users** - Update profile
- **GET /users/{user_id}/statistics** - User stats

### `test_games.py`
Game endpoints tests:
- **POST /games** - Create game
- **GET /games** - List games
- **GET /games/{game_id}** - Game details
- **POST /games/{game_id}/play** - Play card
- **POST /games/{game_id}/chat** - Chat
- **POST /games/{game_id}/leave** - Leave game
- **GET /games/history** - Game history
- **GET /games/statistics** - Game stats

## Setup

### Prerequisites
```bash
cd /Users/lokendracarpenter/Documents/Projects/10S/App
source venv/bin/activate
```

### Create Test Database
```bash
# Create a test database in PostgreSQL
psql -U postgres -c "CREATE DATABASE postgres_test;"
```

## Running Tests

### Run All Tests
```bash
pytest src/tests/
```

### Run Specific Test File
```bash
pytest src/tests/test_auth.py
pytest src/tests/test_lobbies.py
pytest src/tests/test_users.py
pytest src/tests/test_games.py
```

### Run Specific Test Class
```bash
pytest src/tests/test_auth.py::TestUserRegistration
pytest src/tests/test_lobbies.py::TestCreateLobby
```

### Run Specific Test
```bash
pytest src/tests/test_auth.py::TestUserRegistration::test_register_with_email_success
```

### Run with Verbose Output
```bash
pytest src/tests/ -v
```

### Run with Coverage Report
```bash
pytest src/tests/ --cov=src --cov-report=html
```

### Run Tests Matching Pattern
```bash
pytest src/tests/ -k "registration"
pytest src/tests/ -k "auth"
```

## Test Scenarios Covered

### Authentication Tests (28 test cases)
| Scenario | Tests |
|----------|-------|
| Registration Success | 3 |
| Registration Validation | 6 |
| Duplicate Detection | 3 |
| Password Strength | 5 |
| Login Success | 3 |
| Login Errors | 2 |
| Token Refresh | 3 |
| Token Verification | 3 |
| Logout | 1 |

### Lobby Tests (32 test cases)
| Scenario | Tests |
|----------|-------|
| Create Lobby | 10 |
| List Lobbies | 7 |
| Get Lobby Details | 3 |
| Join Lobby | 4 |
| Leave Lobby | 3 |
| Start Game | 5 |

### User Tests (9 test cases)
- Get current user
- Get user profile
- Update profile
- User statistics

### Game Tests (12 test cases)
- Create game
- List games
- Game details
- Play card
- Chat
- Leave game
- Game history
- Statistics

## Test Results

Expected results when all tests pass:

```
======================== test session starts ==========================
collected 81 items

src/tests/test_auth.py ............................ [ 34%]
src/tests/test_lobbies.py ........................................ [ 79%]
src/tests/test_users.py ................ [ 92%]
src/tests/test_games.py ................ [100%]

======================== 81 passed in 5.23s ===========================
```

## Continuous Integration

### Pre-commit Testing
Before pushing code, run:
```bash
pytest src/tests/ -v --tb=short
```

### After Major Changes
```bash
# Run all tests with coverage
pytest src/tests/ --cov=src --cov-report=term-missing

# Check specific modules
pytest src/tests/test_auth.py -v
pytest src/tests/test_lobbies.py -v
```

## Troubleshooting

### Database Connection Error
```bash
# Make sure PostgreSQL is running
psql -U postgres -d postgres_test -c "SELECT 1"

# If test database doesn't exist, create it
createdb postgres_test -U postgres
```

### Token Issues in Tests
- Ensure `auth_token` fixture is being used
- Check JWT_SECRET_KEY in config.py
- Verify token expiration settings

### Fixture Not Found
- Verify fixtures are defined in conftest.py
- Check fixture scope (function, session, module)
- Run with `-v` flag to see fixture usage

## Best Practices

1. **Run tests before pushing code**
   ```bash
   pytest src/tests/ && git push
   ```

2. **Use descriptive test names**
   - ✅ `test_register_with_email_success`
   - ❌ `test_register`

3. **Test one thing per test**
   - ✅ Separate tests for different scenarios
   - ❌ Multiple assertions in one test

4. **Keep tests independent**
   - Use fixtures for setup
   - Don't rely on test execution order

5. **Mock external services** (when applicable)
   - Email services
   - Payment gateways
   - Push notifications

## Adding New Tests

When adding new API endpoints:

1. Create corresponding test class
2. Add test cases for:
   - ✅ Happy path (success)
   - ❌ Error cases (validation, auth, not found)
   - 🔐 Auth scenarios
   - 🎯 Edge cases

Example:
```python
class TestNewEndpoint:
    """Test POST /new-endpoint."""

    def test_success(self, client, auth_token):
        """Test successful request."""
        response = client.post(
            "/new-endpoint",
            params={"auth_token": auth_token},
            json={"field": "value"}
        )
        assert response.status_code == 200

    def test_unauthorized(self, client):
        """Test without auth token."""
        response = client.post("/new-endpoint", json={"field": "value"})
        assert response.status_code == 401

    def test_invalid_input(self, client, auth_token):
        """Test with invalid input."""
        response = client.post(
            "/new-endpoint",
            params={"auth_token": auth_token},
            json={"field": ""}
        )
        assert response.status_code == 400
```

## Contact & Support

For issues or questions about the test suite, create an issue or contact the development team.
