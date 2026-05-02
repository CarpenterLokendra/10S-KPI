"""
Pytest configuration and shared fixtures for all tests.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import sys
from pathlib import Path

# Add src directory to Python path BEFORE any imports
src_path = str(Path(__file__).parent.parent)
if src_path not in sys.path:
    sys.path.insert(0, src_path)

from dotenv import load_dotenv
load_dotenv()

# Now safe to import from src modules
from database import Base, get_db
from models import User, Lobby
from security import hash_password
from config import JWT_EXPIRATION_HOURS
from main import app


# Test database setup
TEST_DATABASE_URL = "postgresql://postgres:postgres@localhost/postgres_test"

engine = create_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    with engine.begin() as conn:
        conn.execute(text('CREATE SCHEMA IF NOT EXISTS "10s_schema"'))

    Base.metadata.create_all(bind=engine)

    session = TestingSessionLocal()
    yield session

    session.close()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def client(db):
    """FastAPI test client."""
    return TestClient(app, headers={"host": "localhost"})


@pytest.fixture(scope="function")
def test_user(db):
    """Create a test user."""
    user = User(
        username="testuser",
        email="test@example.com",
        phone_number="+1234567890",
        password_hash=hash_password("TestPassword123!"),
        auth_method="email"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="function")
def test_user_2(db):
    """Create a second test user."""
    user = User(
        username="testuser2",
        email="test2@example.com",
        phone_number="+1987654321",
        password_hash=hash_password("TestPassword456!"),
        auth_method="email"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="function")
def auth_token(client, test_user):
    """Get authentication token for test user."""
    response = client.post(
        "/auth/login",
        json={
            "username": "testuser",
            "password": "TestPassword123!"
        }
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    return None


@pytest.fixture(scope="function")
def auth_token_2(client, test_user_2):
    """Get authentication token for second test user."""
    response = client.post(
        "/auth/login",
        json={
            "username": "testuser2",
            "password": "TestPassword456!"
        }
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    return None


@pytest.fixture(scope="function")
def invalid_token():
    """Return an invalid/expired auth token for testing unauthorized scenarios."""
    return "invalid.token.here"


@pytest.fixture(scope="function")
def test_lobby(client, auth_token, db):
    """Create a test lobby."""
    response = client.post(
        "/lobbies",
        params={
            "max_players": 4,
            "auth_token": auth_token
        }
    )
    if response.status_code == 200:
        return response.json()
    return None
