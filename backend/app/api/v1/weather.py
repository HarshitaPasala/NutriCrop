from fastapi import APIRouter, Query
from typing import Optional
from app.schemas.weather import CurrentWeather, ExtendedWeatherForecast
from app.services.adapters.weather_service import get_weather_service

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/current", response_model=CurrentWeather)
def get_current_weather(
    village: Optional[str] = Query(None, description="Village name"),
    district: Optional[str] = Query(None, description="District name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude")
):
    weather_service = get_weather_service()
    weather_data = weather_service.get_current_weather(
        village=village,
        district=district,
        lat=lat,
        lon=lon
    )
    return weather_data

@router.get("/forecast", response_model=ExtendedWeatherForecast)
def get_extended_forecast(
    village: Optional[str] = Query(None, description="Village name"),
    district: Optional[str] = Query(None, description="District name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude")
):
    weather_service = get_weather_service()
    return weather_service.get_extended_forecast(
        village=village,
        district=district,
        lat=lat,
        lon=lon
    )
