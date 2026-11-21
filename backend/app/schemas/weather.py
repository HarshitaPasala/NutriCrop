from pydantic import BaseModel
from typing import List, Optional

class WeatherAlert(BaseModel):
    severity: str # 'info', 'warning', 'danger'
    title: str
    description: str
    action_item: str

class SprayAdvisory(BaseModel):
    status: str # 'Favourable', 'Caution', 'Avoid'
    reason: str
    recommendation: str

class CurrentWeather(BaseModel):
    location: str
    district: str
    state: str
    temperature_c: float
    feels_like_c: float
    humidity_percent: int
    wind_speed_kmh: float
    wind_direction: str
    rain_probability_percent: int
    condition: str
    icon: str
    uv_index: int
    spray_advisory: SprayAdvisory
    alerts: List[WeatherAlert] = []
    last_updated: str
    is_demo: bool = True

class DailyForecastDay(BaseModel):
    date: str # e.g. "19 Nov"
    day_name: str # e.g. "Thu"
    temp_max_c: float
    temp_min_c: float
    humidity_percent: int
    rain_prob_percent: int
    rainfall_mm: float
    wind_speed_kmh: float
    condition: str
    icon: str
    spray_rating: str # 'good', 'marginal', 'poor'

class HourlySprayWindow(BaseModel):
    time_label: str # e.g. "06:00 AM"
    temp_c: float
    wind_speed_kmh: float
    humidity_percent: int
    rain_prob_percent: int
    status: str # 'Favourable', 'Marginal', 'Unfavourable'
    reason: str
    drift_risk: str # 'Low', 'Moderate', 'Severe'

class ExtendedWeatherForecast(BaseModel):
    current: CurrentWeather
    daily_forecast: List[DailyForecastDay]
    hourly_spray_windows: List[HourlySprayWindow]
    evapotranspiration_mm_day: float # ET0
    irrigation_deficit_mm: float
    irrigation_recommendation: str
    is_demo: bool = True
