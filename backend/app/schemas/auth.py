from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Union

class SendOtpRequest(BaseModel):
    phone: str = Field(..., description="10-digit Indian phone number or prefixed with +91")

class SendOtpResponse(BaseModel):
    success: bool
    message: str
    is_demo: bool = True
    session_id: str
    expires_in_seconds: int = 300
    demo_otp_hint: Optional[str] = None

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str
    session_id: Optional[str] = None
    language: Optional[str] = "en"
    village: Optional[str] = None
    district: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: int
    phone: str
    name: str
    preferred_language: str
    village: str
    mandal: Optional[str] = ""
    district: str
    state: str
    pincode: Optional[str] = ""
    country: Optional[str] = "India"
    latitude: Optional[Union[float, str]] = None
    longitude: Optional[Union[float, str]] = None
    is_demo: bool = True
    token: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    preferred_language: Optional[str] = None
    village: Optional[str] = None
    mandal: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[Union[float, str]] = None
    longitude: Optional[Union[float, str]] = None

class ReverseGeocodeResponse(BaseModel):
    village: str
    mandal: str = ""
    district: str
    state: str
    pincode: str = ""
    country: str = "India"
    latitude: float
    longitude: float
