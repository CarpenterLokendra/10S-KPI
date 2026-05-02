"""
Database connectivity test script
Run this to verify PostgreSQL connection is working
"""

import sys
from database import SessionLocal, Base, engine
from models import User, Game, Lobby, PlayerStatistics
from sqlalchemy import inspect, text
from datetime import datetime
import uuid

def test_connection():
    """Test database connection"""
    print("\n" + "="*50)
    print("Testing PostgreSQL Connection")
    print("="*50)

    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        print("✓ Successfully connected to PostgreSQL")
        db.close()
        return True
    except Exception as e:
        print(f"✗ Failed to connect to PostgreSQL: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check the DATABASE_URL in .env file")
        print("3. Verify credentials: user=postgres, password=postgres, host=localhost")
        print("4. Try connecting manually: psql -h localhost -U postgres -d postgres")
        return False

def test_table_creation():
    """Test if tables can be created"""
    print("\n" + "="*50)
    print("Testing Table Creation")
    print("="*50)

    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Tables created/verified successfully")
        return True
    except Exception as e:
        print(f"✗ Failed to create tables: {str(e)}")
        return False

def show_tables():
    """Show all tables in database"""
    print("\n" + "="*50)
    print("Database Tables")
    print("="*50)

    try:
        db = SessionLocal()
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        if tables:
            print(f"Found {len(tables)} tables:")
            for table in sorted(tables):
                print(f"  • {table}")
        else:
            print("No tables found in database")

        db.close()
        return True
    except Exception as e:
        print(f"✗ Failed to list tables: {str(e)}")
        return False

def test_create_user():
    """Test creating a user"""
    print("\n" + "="*50)
    print("Testing User Creation")
    print("="*50)

    try:
        db = SessionLocal()

        # Create a test user
        test_user = User(
            id=str(uuid.uuid4()),
            username="test_player",
            email="test@example.com",
            password_hash="hashed_password_here",
            total_games=0,
            total_wins=0,
            total_points=0,
            rating=1000.0
        )

        db.add(test_user)
        db.commit()

        print(f"✓ Successfully created test user")
        print(f"  User ID: {test_user.id}")
        print(f"  Username: {test_user.username}")
        print(f"  Email: {test_user.email}")
        print(f"  Rating: {test_user.rating}")

        # Clean up
        db.delete(test_user)
        db.commit()
        print("  (Test user cleaned up)")

        db.close()
        return True
    except Exception as e:
        print(f"✗ Failed to create user: {str(e)}")
        db.close()
        return False

def test_relationships():
    """Test database relationships"""
    print("\n" + "="*50)
    print("Testing Database Relationships")
    print("="*50)

    try:
        db = SessionLocal()

        # Create test data
        user_id = str(uuid.uuid4())
        game_id = str(uuid.uuid4())
        lobby_id = str(uuid.uuid4())

        test_user = User(
            id=user_id,
            username="relationship_test_user",
            email="relationship@test.com",
            password_hash="test_hash"
        )

        test_lobby = Lobby(
            id=lobby_id,
            code="TEST01",
            creator_id=user_id
        )

        test_game = Game(
            id=game_id,
            lobby_id=lobby_id,
            creator_id=user_id,
            num_players=0
        )

        test_stats = PlayerStatistics(
            user_id=user_id
        )

        db.add(test_user)
        db.add(test_lobby)
        db.add(test_game)
        db.add(test_stats)
        db.commit()

        # Verify relationships
        fetched_user = db.query(User).filter(User.id == user_id).first()
        print(f"✓ User relationships working")
        print(f"  User has {len(fetched_user.games)} games")
        print(f"  User has statistics: {fetched_user.statistics is not None}")

        # Clean up
        db.delete(fetched_user)
        db.commit()
        print("  (Test data cleaned up)")

        db.close()
        return True
    except Exception as e:
        print(f"✗ Failed relationship test: {str(e)}")
        db.close()
        return False

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*70)
    print("10S CARD GAME - DATABASE SETUP VERIFICATION")
    print("="*70)

    results = []

    # Run tests
    results.append(("Connection Test", test_connection()))

    if results[-1][1]:  # Only continue if connection works
        results.append(("Table Creation", test_table_creation()))
        results.append(("Show Tables", show_tables()))
        results.append(("User Creation", test_create_user()))
        results.append(("Relationships", test_relationships()))

    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n✓ All tests passed! Database is properly configured.")
        print("\nNext steps:")
        print("1. Run: python main.py")
        print("2. Visit: http://localhost:8000/health")
        print("3. Check the health endpoint for database status")
        return 0
    else:
        print("\n✗ Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
