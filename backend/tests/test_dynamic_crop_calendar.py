from datetime import date, timedelta

from app.services.crop_calendar_service import CropCalendarService


def test_calendar_dates_follow_crop_sowing_and_leap_days():
    sowing = date(2028, 2, 29)
    result = CropCalendarService.generate_calendar("Rice", "short", sowing.isoformat(), "Guntur")
    expected_harvest = sowing + timedelta(days=result.total_duration_days)
    assert result.crop == "Rice"
    assert result.sowing_date == "29 Feb 2028"
    assert result.expected_harvest_date == expected_harvest.strftime("%d %b %Y")
    assert result.stages[0].target_start_date == "29 Feb 2028"
