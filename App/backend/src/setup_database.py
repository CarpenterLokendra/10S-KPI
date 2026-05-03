#!/usr/bin/env python3
"""
Database setup script - Creates 10s_schema and all tables.
Run this once after setting up the database.
"""

from loguru import logger
from sqlalchemy import text, inspect
from .database import engine, Base
from . import models  # Import all models to register them

SCHEMA_NAME = "10s_schema"

def create_schema():
    """Create the 10s_schema if it doesn't exist."""
    logger.info(f"Creating schema: {SCHEMA_NAME}...")

    try:
        with engine.connect() as conn:
            # Check if schema exists
            inspector = inspect(conn)
            existing_schemas = inspector.get_schema_names()

            if SCHEMA_NAME in existing_schemas:
                logger.info(f"✅ Schema '{SCHEMA_NAME}' already exists")
                return True

            # Create schema (quote the name since it starts with a digit)
            conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{SCHEMA_NAME}"'))
            conn.commit()
            logger.info(f"✅ Schema '{SCHEMA_NAME}' created successfully")
            return True

    except Exception as e:
        logger.error(f"❌ Error creating schema: {str(e)}")
        return False

def create_tables():
    """Create all SQLAlchemy tables in the 10s_schema."""
    logger.info(f"Creating tables in schema '{SCHEMA_NAME}'...")

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ All tables created successfully!")

        # List created tables
        with engine.connect() as conn:
            inspector = inspect(conn)
            tables = inspector.get_table_names(schema=SCHEMA_NAME)

            logger.info(f"📋 Tables in {SCHEMA_NAME} ({len(tables)}):")
            for table in sorted(tables):
                logger.info(f"   ✓ {table}")

        return True

    except Exception as e:
        logger.error(f"❌ Error creating tables: {str(e)}")
        return False

def main():
    """Run the complete database setup."""
    logger.info("=" * 70)
    logger.info("🗄️  10S Card Game Database Setup")
    logger.info("=" * 70)

    # Step 1: Create schema
    if not create_schema():
        logger.error("Failed to create schema. Aborting.")
        return False

    # Step 2: Create tables
    if not create_tables():
        logger.error("Failed to create tables. Aborting.")
        return False

    logger.info("=" * 70)
    logger.info("✅ Database setup complete!")
    logger.info("=" * 70)
    logger.info("")
    logger.info("Next steps:")
    logger.info("1. Start the server: uvicorn main:app --reload")
    logger.info("2. Check tables in PostgreSQL:")
    logger.info(f"   SELECT * FROM information_schema.tables WHERE table_schema = '{SCHEMA_NAME}';")
    logger.info("")

    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
