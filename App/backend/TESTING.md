# Testing Guide - 10S Card Game API

## Quick Start

### 1. Setup Test Database
```bash
# Create test database (one-time setup)
psql -U postgres -c "CREATE DATABASE postgres_test;"
```

### 2. Run Tests
```bash
cd /Users/lokendracarpenter/Documents/Projects/10S/App
source venv/bin/activate
pytest src/tests/ -v
```

### 3. Expected Output
```
======================== test session starts ==========================
collected 81 items

src/tests/test_auth.py ............................ [ 34%]
src/tests/test_lobbies.py ........................................ [ 79%]
src/tests/test_users.py ................ [ 92%]
src/tests/test_games.py ................ [100%]

======================== 81 passed in 5.23s ===========================
```

## Common Commands

### Run All Tests
```bash
pytest src/tests/
```

### Run with Verbose Output
```bash
pytest src/tests/ -v
```

### Run Specific Test Module
```bash
pytest src/tests/test_auth.py          # All auth tests
pytest src/tests/test_lobbies.py       # All lobby tests
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

### Run Tests by Pattern
```bash
pytest src/tests/ -k "register"        # Tests matching "register"
pytest src/tests/ -k "auth"            # Tests matching "auth"
pytest src/tests/ -k "lobby and create" # Tests matching both
```

### Run with Coverage Report
```bash
pytest src/tests/ --cov=src --cov-report=html
# Open htmlcov/index.html in browser
```

### Run Tests with Short Traceback
```bash
pytest src/tests/ --tb=short
```

### Run Tests and Stop on First Failure
```bash
pytest src/tests/ -x
```

### Run Tests with Detailed Output
```bash
pytest src/tests/ -vv
```

## Before Making Changes

**Always run tests before committing:**
```bash
pytest src/tests/ -v && git commit
```

## Before Pushing to Remote

**Run full test suite with coverage:**
```bash
pytest src/tests/ --cov=src --cov-report=term-missing
```

## Test Coverage

### Current Coverage

| Module | Tests | Scenarios |
|--------|-------|-----------|
| Authentication | 28 | Registration, Login, Token, Logout |
| Lobbies | 32 | Create, List, Join, Leave, Start |
| Users | 9 | Profile, Statistics |
| Games | 12 | Create, Play, Chat, History |
| **Total** | **81** | **Multiple scenarios per endpoint** |

### Target Coverage
- Line coverage: > 80%
- Branch coverage: > 75%
- All critical paths: 100%

## Continuous Integration Workflow

### 1. While Developing
```bash
# Run tests frequently
pytest src/tests/test_auth.py -v
pytest src/tests/test_lobbies.py -v
```

### 2. Before Committing
```bash
# Run all tests
pytest src/tests/ -v
```

### 3. Before Pushing
```bash
# Run with coverage
pytest src/tests/ --cov=src --cov-report=term-missing
```

### 4. Code Review
```bash
# Run full suite
pytest src/tests/ -v --tb=short
```

## Troubleshooting

### Connection Error to Test Database
```bash
# Check if database exists
psql -U postgres -l | grep postgres_test

# Create if missing
createdb postgres_test -U postgres

# Verify connection
psql -U postgres -d postgres_test -c "SELECT 1"
```

### Tests Fail with "SCHEMA ALREADY EXISTS"
```bash
# Drop and recreate test database
dropdb postgres_test -U postgres
createdb postgres_test -U postgres
pytest src/tests/ -v
```

### Import Errors
```bash
# Make sure you're in the correct directory
cd /Users/lokendracarpenter/Documents/Projects/10S/App

# Activate virtual environment
source venv/bin/activate

# Run pytest
pytest src/tests/
```

### Fixture Not Found
```bash
# Check conftest.py exists in src/tests/
ls -la src/tests/conftest.py

# Run with verbose to see available fixtures
pytest --fixtures src/tests/
```

## Debugging Tests

### Print Debug Info in Tests
```python
def test_something(client, auth_token):
    print(f"Token: {auth_token}")  # Will show in -s output
    response = client.post(...)
    assert response.status_code == 200
```

### Run with Print Statements Visible
```bash
pytest src/tests/ -s
```

### Run Specific Test with Debugging
```bash
pytest src/tests/test_auth.py::TestUserRegistration::test_register_with_email_success -vv -s
```

## Writing New Tests

When adding a new API endpoint:

1. Create test class in appropriate file
2. Add test methods for different scenarios
3. Use existing fixtures
4. Run tests to verify

Example structure:
```python
class TestNewEndpoint:
    """Test POST /new-endpoint."""

    def test_success(self, client, auth_token):
        """Test successful scenario."""
        response = client.post(
            "/new-endpoint",
            params={"auth_token": auth_token},
            json={"field": "value"}
        )
        assert response.status_code == 200

    def test_unauthorized(self, client):
        """Test without authentication."""
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

## Test Files Location
```
App/
├── src/
│   ├── tests/
│   │   ├── __init__.py           # Package init
│   │   ├── conftest.py           # Fixtures & config
│   │   ├── test_auth.py          # Auth tests (28 cases)
│   │   ├── test_lobbies.py       # Lobby tests (32 cases)
│   │   ├── test_users.py         # User tests (9 cases)
│   │   ├── test_games.py         # Game tests (12 cases)
│   │   └── README.md             # Detailed test documentation
│   ├── main.py
│   ├── models.py
│   └── ...
├── pytest.ini                    # Pytest configuration
├── TESTING.md                    # This file
└── ...
```

## Advanced Testing

### Run Tests in Parallel
```bash
pip install pytest-xdist
pytest src/tests/ -n auto
```

### Generate HTML Report
```bash
pip install pytest-html
pytest src/tests/ --html=report.html
```

### Profile Slow Tests
```bash
pytest src/tests/ --durations=10
```

## Success Criteria

✅ All tests pass before committing
✅ New features include corresponding tests
✅ Test coverage > 80%
✅ No flaky/intermittent failures
✅ Tests run in < 1 minute

## Questions?

For detailed test documentation, see `src/tests/README.md`
