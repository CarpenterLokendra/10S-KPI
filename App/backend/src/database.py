"""
Database connection and session configuration
"""

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from loguru import logger
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/postgres")

logger.debug(f"Database URL configured: {DATABASE_URL.split('@')[0] + '@***'}...")

# Create engine
try:
    engine = create_engine(
        DATABASE_URL,
        echo=False,  # Set to True for SQL query logging
        pool_size=20,
        max_overflow=40,
        pool_pre_ping=True,  # Verify connections before using them
    )
    logger.info("✅ Database engine created successfully")
except Exception as e:
    logger.error(f"❌ Failed to create database engine: {str(e)}")
    raise

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """Get database session for dependency injection"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database - create schema and tables"""
    try:
        with engine.begin() as conn:
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS \"10s_schema\""))
            logger.info("✅ Schema '10s_schema' created or already exists")

        Base.metadata.create_all(bind=engine)
        logger.info("✅ All database tables created successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")
        raise

def drop_db():
    """Drop all tables - use with caution!"""
    Base.metadata.drop_all(bind=engine)
