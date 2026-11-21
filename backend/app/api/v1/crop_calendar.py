from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.calendar import (
    CropCalendarRequest,
    CropCalendarResponse,
    NotificationSubscribeRequest,
)
from app.services.crop_calendar_service import CropCalendarService

router = APIRouter(prefix="/crop-calendar", tags=["Interactive Crop Calendar"])

@router.get("/supported-crops", response_model=List[Dict[str, Any]])
def get_supported_crops():
    """Returns list of supported crops and maturity durations."""
    return CropCalendarService.get_supported_crops()

@router.post("/generate", response_model=CropCalendarResponse)
def generate_calendar(payload: CropCalendarRequest):
    """
    Generate dynamic stage-by-stage farming timeline based on sowing date and duration.
    """
    return CropCalendarService.generate_calendar(
        crop=payload.crop,
        variety_duration=payload.variety_duration,
        sowing_date_str=payload.sowing_date,
        district=payload.district,
    )

@router.post("/subscribe-notifications")
def subscribe_notifications(payload: NotificationSubscribeRequest):
    """
    Opt-in simulator for stage-specific WhatsApp and SMS farming reminders.
    """
    if not payload.phone or len(payload.phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid 10-digit mobile number.")
    return {
        "status": "success",
        "message": f"Successfully subscribed {payload.phone} for {payload.channel.upper()} agronomic alerts in {payload.language.upper()}.",
        "channel": payload.channel,
        "phone": payload.phone,
        "is_demo": True,
    }
