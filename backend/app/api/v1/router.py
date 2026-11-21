from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.weather import router as weather_router
from app.api.v1.soil import router as soil_router
from app.api.v1.crop_doctor import router as crop_doctor_router
from app.api.v1.satellite import router as satellite_router
from app.api.v1.crop_calendar import router as crop_calendar_router
from app.api.v1.mandi import router as mandi_router
from app.api.v1.expert_help import router as expert_help_router
from app.api.v1.schemes import router as schemes_router
from app.api.v1.community import router as community_router
from app.api.v1.farm import router as farm_router

api_router = APIRouter(prefix="/v1")
api_router.include_router(auth_router)
api_router.include_router(weather_router)
api_router.include_router(soil_router)
api_router.include_router(crop_doctor_router)
api_router.include_router(satellite_router)
api_router.include_router(crop_calendar_router)
api_router.include_router(mandi_router)
api_router.include_router(expert_help_router)
api_router.include_router(schemes_router)
api_router.include_router(community_router)
api_router.include_router(farm_router)
