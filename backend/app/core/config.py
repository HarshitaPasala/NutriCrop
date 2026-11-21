import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "NutriCrop API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nutricrop-secret-key-production-ready-agricultural-service-2026")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./nutricrop.db")
    
    # Integration Modes: 'mock' or 'live'
    FIREBASE_AUTH_MODE: str = os.getenv("FIREBASE_AUTH_MODE", "mock")
    WEATHER_API_PROVIDER: str = os.getenv("WEATHER_API_PROVIDER", "mock")
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    SENTINEL_MODE: str = os.getenv("SENTINEL_MODE", "mock")
    AGMARKNET_MODE: str = os.getenv("AGMARKNET_MODE", "mock")
    NOTIFICATION_MODE: str = os.getenv("NOTIFICATION_MODE", "mock")
    STORAGE_MODE: str = os.getenv("STORAGE_MODE", "local")
    VISION_MODEL_MODE: str = os.getenv("VISION_MODEL_MODE", "local_expert")
    VISION_MODEL_NAME: str = os.getenv("VISION_MODEL_NAME", "gemini-3.8-flash")
    VISION_MODEL_API_KEY: str = os.getenv("VISION_MODEL_API_KEY", "")
    # Explicit demo mode only recognizes the licensed, bundled test images by SHA-256.
    CROP_DOCTOR_MOCK: bool = os.getenv("CROP_DOCTOR_MOCK", "false").lower() in ("1", "true", "yes")

settings = Settings()
