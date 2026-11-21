import pytest
from app.services.adapters.satellite_service import CopernicusSentinel2MockAdapter
from app.models.satellite import GeoCoordinate
from app.services.crop_calendar_service import CropCalendarService
from app.services.adapters.weather_service import MockWeatherService

def test_satellite_demo_plots():
    service = CopernicusSentinel2MockAdapter()
    plots = service.get_demo_plots()
    assert len(plots) >= 3
    for p in plots:
        assert "coordinates" in p
        assert len(p["coordinates"]) >= 3
        assert "centroid" in p
        assert "crop" in p

def test_satellite_ndvi_analysis():
    service = CopernicusSentinel2MockAdapter()
    coords = [
        GeoCoordinate(lat=16.2445, lng=80.6390),
        GeoCoordinate(lat=16.2448, lng=80.6415),
        GeoCoordinate(lat=16.2425, lng=80.6418),
        GeoCoordinate(lat=16.2422, lng=80.6392),
    ]
    res = service.analyze_plot_ndvi(coords, "Guntur Test Field", "Chilli")
    assert res.plot_name == "Guntur Test Field"
    assert res.area_acres > 0
    assert 0.0 <= res.ndvi_summary.mean_ndvi <= 1.0
    assert res.current_observation.cloud_cover_percent >= 0.0
    assert len(res.historical_observations) >= 3
    # Check educational disclaimer guardrail
    assert "NOT measure soil" in res.farmer_disclaimer
    assert "Copernicus Sentinel-2" in res.satellite_source

def test_crop_calendar_stages_and_duration():
    # Test medium duration
    cal_med = CropCalendarService.generate_calendar("Chilli", "medium", "2026-10-01")
    assert cal_med.total_duration_days == 150
    assert len(cal_med.stages) == 6

    # Test short duration (150 * 0.85 = 127)
    cal_short = CropCalendarService.generate_calendar("Chilli", "short", "2026-10-01")
    assert cal_short.total_duration_days == 127
    assert cal_short.total_duration_days < cal_med.total_duration_days

    # Test stage status tagging
    statuses = [s.status for s in cal_med.stages]
    assert any(st in ["current", "completed", "upcoming"] for st in statuses)

def test_weather_extended_forecast_and_days():
    service = MockWeatherService()
    forecast = service.get_extended_forecast("Tenali", "Guntur")
    assert len(forecast.daily_forecast) == 7
    for day in forecast.daily_forecast:
        assert day.temp_max_c >= day.temp_min_c
        assert 0 <= day.rain_prob_percent <= 100
        assert day.wind_speed_kmh >= 0
        assert day.spray_rating in ["good", "marginal", "poor"]

def test_hourly_spray_windows_logic():
    service = MockWeatherService()
    forecast = service.get_extended_forecast("Tenali", "Guntur")
    assert len(forecast.hourly_spray_windows) >= 5
    for win in forecast.hourly_spray_windows:
        assert win.status in ["Favourable", "Marginal", "Unfavourable"]
        assert win.drift_risk in ["Low", "Moderate", "Severe"]
        if win.status == "Unfavourable":
            assert "wind" in win.reason.lower() or "temperature" in win.reason.lower() or "rain" in win.reason.lower()
