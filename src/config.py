import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = ""
    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD_HASH: str = ""
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env.analytics"
        case_sensitive = True


def get_settings() -> Settings:
    return Settings()


settings = get_settings()
