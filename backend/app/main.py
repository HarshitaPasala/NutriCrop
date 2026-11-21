import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import Base, engine
from app.models.user import User
from app.models.soil import SoilReport
from app.models.crop_doctor import CropDiagnosis
from app.api.v1.router import api_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Auto-migrate SQLite schema for missing columns
try:
    from sqlalchemy import text
    with engine.connect() as conn:
        res = conn.execute(text("PRAGMA table_info(users)"))
        existing_cols = [r[1] for r in res.fetchall()]
        for col in ["mandal", "pincode", "country"]:
            if col not in existing_cols:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} VARCHAR(100)"))
                conn.commit()
except Exception as e:
    print(f"Database migration error: {e}")

app = FastAPI(
    title="NutriCrop API",
    description="Backend API for NutriCrop - Soil Health First Smart Farming Platform",
    version=settings.VERSION
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
],
allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "name": "NutriCrop API",
        "tagline": "Grow healthy. Harvest better.",
        "positioning": "Soil Health First – Smart Farming Platform",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "integrations": {
            "auth": settings.FIREBASE_AUTH_MODE,
            "weather": settings.WEATHER_API_PROVIDER,
            "sentinel": settings.SENTINEL_MODE,
            "agmarknet": settings.AGMARKNET_MODE,
            "notifications": settings.NOTIFICATION_MODE,
            "vision": settings.VISION_MODEL_MODE
        }
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "NutriCrop FastAPI Engine"}
