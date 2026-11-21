import abc
import datetime
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.schemas.weather import (
    CurrentWeather,
    DailyForecastDay,
    HourlySprayWindow,
    ExtendedWeatherForecast,
    WeatherAlert,
    SprayAdvisory,
)

class BaseWeatherService(abc.ABC):
    @abc.abstractmethod
    def get_current_weather(self, village: Optional[str], district: Optional[str], lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
        pass

    @abc.abstractmethod
    def get_extended_forecast(self, village: Optional[str] = None, district: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> ExtendedWeatherForecast:
        pass


class MockWeatherService(BaseWeatherService):
    DISTRICT_CLIMATES = {
        "ludhiana": {
            "state": "Punjab",
            "temp": 22.4,
            "feels_like": 22.0,
            "humidity": 48,
            "wind": 5.8,
            "wind_dir": "NW",
            "rain": 5,
            "condition": "Pleasant & Sunny",
            "icon": "sun",
            "spray_status": "Favourable",
            "spray_reason": "Calm air (5.8 km/h) and dry foliage; ideal for wheat herbicide/fertilizer application.",
            "spray_rec": "Optimal window open throughout morning and early afternoon."
        },
        "solapur": {
            "state": "Maharashtra",
            "temp": 31.8,
            "feels_like": 32.5,
            "humidity": 38,
            "wind": 11.2,
            "wind_dir": "NE",
            "rain": 8,
            "condition": "Clear Sunny",
            "icon": "sun",
            "spray_status": "Caution",
            "spray_reason": "High ambient temperature (>31°C) accelerates spray droplet evaporation.",
            "spray_rec": "Complete foliar spray operations before 9:30 AM or after 4:30 PM."
        },
        "nashik": {
            "state": "Maharashtra",
            "temp": 26.2,
            "feels_like": 26.0,
            "humidity": 46,
            "wind": 7.5,
            "wind_dir": "W",
            "rain": 10,
            "condition": "Clear Sky",
            "icon": "sun",
            "spray_status": "Favourable",
            "spray_reason": "Mild wind (7.5 km/h) and moderate humidity; excellent for vineyard/vegetable sprays.",
            "spray_rec": "Favourable spraying conditions across morning hours."
        },
        "warangal": {
            "state": "Telangana",
            "temp": 29.4,
            "feels_like": 30.8,
            "humidity": 55,
            "wind": 8.0,
            "wind_dir": "SE",
            "rain": 12,
            "condition": "Partly Cloudy",
            "icon": "cloud-sun",
            "spray_status": "Favourable",
            "spray_reason": "Dry canopy and light breeze; minimal drift hazard.",
            "spray_rec": "Safe for both foliar micronutrients and organic biopesticides."
        },
        "thanjavur": {
            "state": "Tamil Nadu",
            "temp": 29.8,
            "feels_like": 33.2,
            "humidity": 76,
            "wind": 9.4,
            "wind_dir": "NE",
            "rain": 38,
            "condition": "Scattered Clouds",
            "icon": "cloud",
            "spray_status": "Caution",
            "spray_reason": "High relative humidity (76%) and 38% rain chance under Northeast monsoon flow.",
            "spray_rec": "Ensure rainfastness agent / sticking spreader is added to spray solution."
        },
        "varanasi": {
            "state": "Uttar Pradesh",
            "temp": 24.2,
            "feels_like": 24.5,
            "humidity": 52,
            "wind": 6.2,
            "wind_dir": "NW",
            "rain": 6,
            "condition": "Hazy Sunshine",
            "icon": "sun",
            "spray_status": "Favourable",
            "spray_reason": "Cool still morning air; excellent uptake by vegetable and rabi crop leaves.",
            "spray_rec": "Safe to conduct foliar spraying throughout the day."
        },
        "burdwan": {
            "state": "West Bengal",
            "temp": 27.2,
            "feels_like": 28.5,
            "humidity": 66,
            "wind": 6.8,
            "wind_dir": "E",
            "rain": 18,
            "condition": "Partly Cloudy",
            "icon": "cloud-sun",
            "spray_status": "Favourable",
            "spray_reason": "Mild coastal plains breeze; leaf moisture evaporating normally.",
            "spray_rec": "Optimal spray window active."
        },
        "belagavi": {
            "state": "Karnataka",
            "temp": 26.8,
            "feels_like": 27.0,
            "humidity": 56,
            "wind": 8.2,
            "wind_dir": "SW",
            "rain": 14,
            "condition": "Breezy & Mild",
            "icon": "cloud-sun",
            "spray_status": "Favourable",
            "spray_reason": "Comfortable temperature and stable wind below 10 km/h.",
            "spray_rec": "Good conditions for sugarcane and legume foliar treatments."
        },
        "palakkad": {
            "state": "Kerala",
            "temp": 31.5,
            "feels_like": 35.0,
            "humidity": 79,
            "wind": 13.5,
            "wind_dir": "W",
            "rain": 55,
            "condition": "Passing Showers",
            "icon": "cloud-rain",
            "spray_status": "Avoid",
            "spray_reason": "High rain probability (55%) and gusty gap winds (13.5 km/h).",
            "spray_rec": "Postpone spraying until showers clear and winds subside."
        },
        "guntur": {
            "state": "Andhra Pradesh",
            "temp": 28.5,
            "feels_like": 30.2,
            "humidity": 62,
            "wind": 7.2,
            "wind_dir": "SE",
            "rain": 15,
            "condition": "Partly Cloudy",
            "icon": "cloud-sun",
            "spray_status": "Favourable",
            "spray_reason": "Mild wind (7.2 km/h) and low rain chance (15%).",
            "spray_rec": "Optimal condition for foliar fertilizers and bio-pesticide applications."
        }
    }

    def _resolve_profile(self, district: Optional[str], lat: Optional[float] = None) -> Dict[str, Any]:
        key = (district or "guntur").lower().strip()
        for d_key, profile in self.DISTRICT_CLIMATES.items():
            if d_key in key or key in d_key:
                return profile
        
        # Approximate based on latitude
        if lat and lat > 26.0:
            return self.DISTRICT_CLIMATES["ludhiana"]
        elif lat and lat < 13.0:
            return self.DISTRICT_CLIMATES["thanjavur"]
        return self.DISTRICT_CLIMATES["guntur"]

    def get_current_weather(self, village: Optional[str] = None, district: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
        loc_district = district or "Guntur"
        loc_village = village or f"{loc_district} Farm"
        profile = self._resolve_profile(loc_district, lat)
        loc_state = profile.get("state", "Andhra Pradesh")

        temp = profile["temp"]
        feels_like = profile["feels_like"]
        humidity = profile["humidity"]
        wind_speed = profile["wind"]
        wind_dir = profile.get("wind_dir", "SE")
        rain_prob = profile["rain"]
        condition = profile["condition"]
        icon = profile["icon"]
        spray_status = profile["spray_status"]
        spray_reason = profile["spray_reason"]
        spray_rec = profile["spray_rec"]

        now_str = datetime.datetime.now().strftime("%d %b %Y, %I:%M %p")

        alerts = [
            {
                "severity": "info" if spray_status == "Favourable" else "warning",
                "title": f"{spray_status} Spray Window - {loc_district}",
                "description": spray_reason,
                "action_item": spray_rec
            }
        ]

        if temp > 31.0:
            alerts.append({
                "severity": "warning",
                "title": "Elevated Crop Water Stress",
                "description": f"High midday temperature ({temp}°C) in {loc_district}.",
                "action_item": "Ensure light evening irrigation for shallow-rooted crops."
            })
        elif rain_prob > 40:
            alerts.append({
                "severity": "warning",
                "title": "Rain Washout Warning",
                "description": f"{rain_prob}% rain probability forecasted today.",
                "action_item": "Hold chemical application; check drainage furrows."
            })

        return {
            "location": loc_village,
            "district": loc_district,
            "state": loc_state,
            "temperature_c": temp,
            "feels_like_c": feels_like,
            "humidity_percent": humidity,
            "wind_speed_kmh": wind_speed,
            "wind_direction": wind_dir,
            "rain_probability_percent": rain_prob,
            "condition": condition,
            "icon": icon,
            "uv_index": 6 if temp > 30 else 4,
            "spray_advisory": {
                "status": spray_status,
                "reason": spray_reason,
                "recommendation": spray_rec
            },
            "alerts": alerts,
            "last_updated": now_str,
            "is_demo": True
        }

    def get_extended_forecast(self, village: Optional[str] = None, district: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> ExtendedWeatherForecast:
        curr_dict = self.get_current_weather(village, district, lat, lon)
        curr = CurrentWeather(**curr_dict)
        base_temp = curr_dict["temperature_c"]
        base_hum = curr_dict["humidity_percent"]
        base_rain = curr_dict["rain_probability_percent"]
        base_wind = curr_dict["wind_speed_kmh"]

        today = datetime.date.today()
        daily: List[DailyForecastDay] = []
        conditions = [
            ("Clear Sunny", "sun", round(base_temp + 2.0, 1), round(base_temp - 8.0, 1), base_hum - 5, max(5, base_rain - 10), 0.0, round(base_wind * 0.9, 1), "good"),
            (curr_dict["condition"], curr_dict["icon"], round(base_temp + 1.5, 1), round(base_temp - 7.5, 1), base_hum, base_rain, 0.0 if base_rain < 30 else 3.5, base_wind, "good" if curr_dict["spray_advisory"]["status"] == "Favourable" else "marginal"),
            ("Light Passing Showers" if base_rain > 20 else "Scattered Clouds", "cloud-rain" if base_rain > 20 else "cloud", round(base_temp - 1.0, 1), round(base_temp - 7.0, 1), base_hum + 12, min(90, base_rain + 25), 6.5 if base_rain > 20 else 0.0, round(base_wind * 1.3, 1), "poor" if base_rain > 30 else "good"),
            ("Scattered Clouds", "cloud", round(base_temp + 0.5, 1), round(base_temp - 8.0, 1), base_hum + 4, max(10, base_rain - 5), 0.0, round(base_wind * 1.0, 1), "good"),
            ("Warm Breeze", "wind", round(base_temp + 3.0, 1), round(base_temp - 6.5, 1), base_hum - 8, max(5, base_rain - 12), 0.0, round(base_wind * 1.5, 1), "marginal"),
            ("Pleasant & Sunny", "sun", round(base_temp + 1.0, 1), round(base_temp - 9.0, 1), base_hum - 3, 5, 0.0, round(base_wind * 0.8, 1), "good"),
            ("Clear Sky", "sun", round(base_temp + 2.5, 1), round(base_temp - 8.5, 1), base_hum - 6, 5, 0.0, round(base_wind * 0.8, 1), "good"),
        ]

        for i, (cond, icon, t_max, t_min, hum, r_prob, r_mm, w_spd, s_rating) in enumerate(conditions):
            f_day = today + datetime.timedelta(days=i)
            daily.append(
                DailyForecastDay(
                    date=f_day.strftime("%d %b"),
                    day_name=f_day.strftime("%a"),
                    temp_max_c=t_max,
                    temp_min_c=t_min,
                    humidity_percent=max(20, min(98, hum)),
                    rain_prob_percent=max(0, min(100, r_prob)),
                    rainfall_mm=r_mm,
                    wind_speed_kmh=max(2.0, w_spd),
                    condition=cond,
                    icon=icon,
                    spray_rating=s_rating,
                )
            )

        # Dynamic hourly spraying suitability tailored to the regional base temperature and wind
        hourly = [
            HourlySprayWindow(
                time_label="06:00 AM",
                temp_c=round(base_temp - 6.5, 1),
                wind_speed_kmh=round(base_wind * 0.6, 1),
                humidity_percent=min(95, base_hum + 16),
                rain_prob_percent=max(2, int(base_rain * 0.4)),
                status="Favourable",
                reason="Ideal dew evaporation, calm air, near-zero drift risk.",
                drift_risk="Low",
            ),
            HourlySprayWindow(
                time_label="08:00 AM",
                temp_c=round(base_temp - 3.0, 1),
                wind_speed_kmh=round(base_wind * 0.8, 1),
                humidity_percent=base_hum + 6,
                rain_prob_percent=max(5, int(base_rain * 0.6)),
                status="Favourable",
                reason="Optimal leaf stomatal uptake window; mild air velocity.",
                drift_risk="Low",
            ),
            HourlySprayWindow(
                time_label="10:00 AM",
                temp_c=base_temp,
                wind_speed_kmh=base_wind,
                humidity_percent=base_hum,
                rain_prob_percent=base_rain,
                status="Favourable" if base_wind < 12 and base_temp < 32 else "Marginal",
                reason="Acceptable spray window before noon temperature rise.",
                drift_risk="Low" if base_wind < 10 else "Moderate",
            ),
            HourlySprayWindow(
                time_label="12:00 PM",
                temp_c=round(base_temp + 2.7, 1),
                wind_speed_kmh=round(base_wind * 1.5, 1),
                humidity_percent=max(25, base_hum - 14),
                rain_prob_percent=base_rain,
                status="Marginal",
                reason="Midday thermal inversion; higher droplet evaporation risk.",
                drift_risk="Moderate",
            ),
            HourlySprayWindow(
                time_label="02:00 PM",
                temp_c=round(base_temp + 4.3, 1),
                wind_speed_kmh=round(base_wind * 1.8, 1),
                humidity_percent=max(20, base_hum - 20),
                rain_prob_percent=base_rain,
                status="Unfavourable",
                reason="High solar radiation and wind drift; chemical burn risk.",
                drift_risk="Severe",
            ),
            HourlySprayWindow(
                time_label="04:00 PM",
                temp_c=round(base_temp + 2.0, 1),
                wind_speed_kmh=round(base_wind * 1.2, 1),
                humidity_percent=base_hum - 6,
                rain_prob_percent=max(5, int(base_rain * 0.8)),
                status="Favourable",
                reason="Dropping solar radiation; favorable evening absorption.",
                drift_risk="Low",
            ),
            HourlySprayWindow(
                time_label="06:00 PM",
                temp_c=round(base_temp - 1.5, 1),
                wind_speed_kmh=round(base_wind * 0.7, 1),
                humidity_percent=base_hum + 8,
                rain_prob_percent=max(2, int(base_rain * 0.5)),
                status="Favourable",
                reason="Cool canopy, calm winds; excellent bio-pesticide timing.",
                drift_risk="Low",
            ),
        ]

        return ExtendedWeatherForecast(
            current=curr,
            daily_forecast=daily,
            hourly_spray_windows=hourly,
            evapotranspiration_mm_day=4.2,
            irrigation_deficit_mm=12.6,
            irrigation_recommendation="Crop water balance indicates a 12.6 mm deficit over the past 3 days. Recommend 2.5 hours of furrow/drip irrigation in the evening.",
            is_demo=True,
        )


class LiveOpenWeatherService(BaseWeatherService):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def get_current_weather(self, village: Optional[str], district: Optional[str], lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
        raise NotImplementedError("Live Weather requires valid WEATHER_API_KEY.")

    def get_extended_forecast(self, village: Optional[str] = None, district: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> ExtendedWeatherForecast:
        raise NotImplementedError("Live Weather requires valid WEATHER_API_KEY.")


def get_weather_service() -> BaseWeatherService:
    if getattr(settings, "WEATHER_API_PROVIDER", "mock") != "mock" and getattr(settings, "WEATHER_API_KEY", None):
        return LiveOpenWeatherService(settings.WEATHER_API_KEY)
    return MockWeatherService()
