from pydantic import BaseModel, Field
from typing import List, Optional

class CropStage(BaseModel):
    stage_id: str
    stage_number: int
    name: str
    das_range: str # e.g. "0 - 15 DAS"
    start_das: int
    end_das: int
    target_start_date: str # e.g. "12 Oct 2026"
    target_end_date: str # e.g. "27 Oct 2026"
    status: str # 'completed', 'current', 'upcoming'
    description: str
    key_activities: List[str]
    nutrient_application: Optional[str] = None
    irrigation_advisory: str
    pest_monitoring: str
    weather_risk_alert: Optional[str] = None

class CropCalendarRequest(BaseModel):
    crop: str = "Chilli"
    variety_duration: str = "medium" # 'short', 'medium', 'long'
    sowing_date: str # YYYY-MM-DD
    district: Optional[str] = "Guntur"

class CropCalendarResponse(BaseModel):
    calendar_id: str
    crop: str
    variety_duration: str
    sowing_date: str
    expected_harvest_date: str
    total_duration_days: int
    current_das: int
    current_stage_name: str
    stages: List[CropStage]
    next_key_activity: str
    is_demo: bool = True

class NotificationSubscribeRequest(BaseModel):
    channel: str # 'whatsapp', 'sms'
    phone: str
    language: str = "en"
    calendar_id: str
    alert_types: List[str] = ["irrigation", "fertilizer", "pest_warning"]
