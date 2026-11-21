import math
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import (
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    UserProfileResponse,
    UpdateProfileRequest,
    ReverseGeocodeResponse,
)
from app.services.adapters.otp_service import get_otp_service
from app.services.adapters.mandi_service import AgmarknetMockAdapter

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/send-otp", response_model=SendOtpResponse)
def send_otp(payload: SendOtpRequest):
    phone = payload.phone.strip()
    if len(phone.replace("+91", "").replace(" ", "")) < 10:
        raise HTTPException(status_code=400, detail="Invalid Indian phone number. Minimum 10 digits required.")
        
    otp_service = get_otp_service()
    success, session_id, message, hint = otp_service.send_otp(phone)
    
    return SendOtpResponse(
        success=success,
        message=message,
        is_demo=True,
        session_id=session_id,
        expires_in_seconds=300,
        demo_otp_hint=hint
    )

@router.post("/verify-otp", response_model=UserProfileResponse)
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    phone = payload.phone.strip()
    otp_service = get_otp_service()
    
    is_valid, msg = otp_service.verify_otp(phone, payload.otp, payload.session_id)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
        
    clean_phone = phone.replace("+91", "").replace(" ", "").strip()
    
    # Retrieve or create farmer user record
    user = db.query(User).filter(User.phone == clean_phone).first()
    if not user:
        user = User(
            phone=clean_phone,
            name="Farmer",
            preferred_language=payload.language or "en",
            village=payload.village or "Tenali Village",
            district=payload.district or "Guntur",
            state="Andhra Pradesh"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if payload.language:
            user.preferred_language = payload.language
        if payload.village:
            user.village = payload.village
        if payload.district:
            user.district = payload.district
        db.commit()
        db.refresh(user)

    token = f"nutricrop-token-{user.id}-{clean_phone}"

    return UserProfileResponse(
        id=user.id,
        phone=user.phone,
        name=user.name,
        preferred_language=user.preferred_language,
        village=user.village or "Tenali Village",
        mandal=user.mandal or "Tenali",
        district=user.district or "Guntur",
        state=user.state or "Andhra Pradesh",
        pincode=user.pincode or "522201",
        country=user.country or "India",
        latitude=user.latitude,
        longitude=user.longitude,
        is_demo=True,
        token=token
    )

@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(phone: str = "9876543210", db: Session = Depends(get_db)):
    clean_phone = phone.replace("+91", "").replace(" ", "").strip()
    user = db.query(User).filter(User.phone == clean_phone).first()
    if not user:
        user = User(
            phone=clean_phone,
            name="Farmer",
            preferred_language="en",
            village="Tenali Village",
            mandal="Tenali",
            district="Guntur",
            state="Andhra Pradesh",
            pincode="522201",
            country="India"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return UserProfileResponse(
        id=user.id,
        phone=user.phone,
        name=user.name,
        preferred_language=user.preferred_language,
        village=user.village or "",
        mandal=user.mandal or "",
        district=user.district or "",
        state=user.state or "Andhra Pradesh",
        pincode=user.pincode or "",
        country=user.country or "India",
        latitude=user.latitude,
        longitude=user.longitude,
        is_demo=True,
        token=f"nutricrop-token-{user.id}"
    )


@router.put("/profile", response_model=UserProfileResponse)
@router.put("/location", response_model=UserProfileResponse)
def update_profile(payload: UpdateProfileRequest, phone: str = "9876543210", db: Session = Depends(get_db)):
    clean_phone = phone.replace("+91", "").replace(" ", "").strip()
    user = db.query(User).filter(User.phone == clean_phone).first()
    if not user:
        user = User(
            phone=clean_phone,
            name=payload.name or "Farmer",
            preferred_language=payload.preferred_language or "en",
            village=payload.village or "",
            mandal=payload.mandal or "",
            district=payload.district or "",
            state=payload.state or "Andhra Pradesh",
            pincode=payload.pincode or "",
            country=payload.country or "India",
            latitude=str(payload.latitude) if payload.latitude is not None else None,
            longitude=str(payload.longitude) if payload.longitude is not None else None,
        )
        db.add(user)
    else:
        if payload.name is not None:
            user.name = payload.name
        if payload.preferred_language is not None:
            user.preferred_language = payload.preferred_language
        if payload.village is not None:
            user.village = payload.village
        if payload.mandal is not None:
            user.mandal = payload.mandal
        if payload.district is not None:
            user.district = payload.district
        if payload.state is not None:
            user.state = payload.state
        if payload.pincode is not None:
            user.pincode = payload.pincode
        if payload.country is not None:
            user.country = payload.country
        if payload.latitude is not None:
            user.latitude = str(payload.latitude)
        if payload.longitude is not None:
            user.longitude = str(payload.longitude)
    db.commit()
    db.refresh(user)
    return UserProfileResponse(
        id=user.id,
        phone=user.phone,
        name=user.name,
        preferred_language=user.preferred_language,
        village=user.village or "",
        mandal=user.mandal or "",
        district=user.district or "",
        state=user.state or "Andhra Pradesh",
        pincode=user.pincode or "",
        country=user.country or "India",
        latitude=user.latitude,
        longitude=user.longitude,
        is_demo=True,
        token=f"nutricrop-token-{user.id}"
    )


DISTRICT_DETAILS = {
    "Guntur": ("Andhra Pradesh", "Tenali Mandal", "522201"),
    "Krishna": ("Andhra Pradesh", "Machilipatnam", "521001"),
    "Kurnool": ("Andhra Pradesh", "Adoni", "518001"),
    "Chittoor": ("Andhra Pradesh", "Madanapalle", "517001"),
    "Anantapur": ("Andhra Pradesh", "Dharmavaram", "515001"),
    "West Godavari": ("Andhra Pradesh", "Bhimavaram", "534201"),
    "Patna": ("Bihar", "Danapur", "800001"),
    "Muzaffarpur": ("Bihar", "Kanti", "842001"),
    "Samastipur": ("Bihar", "Pusa", "848125"),
    "Begusarai": ("Bihar", "Barauni", "851101"),
    "Bhagalpur": ("Bihar", "Naugachia", "812001"),
    "Rajkot": ("Gujarat", "Gondal", "360001"),
    "Karnal": ("Haryana", "Taraori", "132001"),
    "Hisar": ("Haryana", "Hansi", "125001"),
    "Davangere": ("Karnataka", "Harihar", "577001"),
    "Belagavi": ("Karnataka", "Gokak", "590001"),
    "Dharwad": ("Karnataka", "Hubballi", "580001"),
    "Palakkad": ("Kerala", "Chittur", "678001"),
    "Indore": ("Madhya Pradesh", "Sanwer", "452001"),
    "Ujjain": ("Madhya Pradesh", "Nagda", "456001"),
    "Nashik": ("Maharashtra", "Niphad", "422001"),
    "Solapur": ("Maharashtra", "Mohol", "413001"),
    "Nagpur": ("Maharashtra", "Katol", "440001"),
    "Sambalpur": ("Odisha", "Attabira", "768001"),
    "Bargarh": ("Odisha", "Barpali", "768028"),
    "Ludhiana": ("Punjab", "Samrala", "141001"),
    "Amritsar": ("Punjab", "Ajnala", "143001"),
    "Jalandhar": ("Punjab", "Nakodar", "144001"),
    "Jaipur": ("Rajasthan", "Chomu", "302001"),
    "Kota": ("Rajasthan", "Ramganj Mandi", "324001"),
    "Thanjavur": ("Tamil Nadu", "Kumbakonam", "613001"),
    "Coimbatore": ("Tamil Nadu", "Pollachi", "641001"),
    "Warangal": ("Telangana", "Parkal", "506002"),
    "Khammam": ("Telangana", "Madhira", "507001"),
    "Varanasi": ("Uttar Pradesh", "Chiraigaon", "221001"),
    "Meerut": ("Uttar Pradesh", "Sardhana", "250001"),
    "Burdwan": ("West Bengal", "Memari", "713101"),
    "Hooghly": ("West Bengal", "Tarakeswar", "712101"),
}

def _find_nearest_district(lat: float, lon: float):
    min_dist = float("inf")
    best_district = "Guntur"
    for dist_name, coords in AgmarknetMockAdapter.MARKET_COORDS.items():
        d_lat, d_lon = coords
        lat1, lon1, lat2, lon2 = map(math.radians, (lat, lon, d_lat, d_lon))
        a = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
        d = 6371 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        if d < min_dist:
            min_dist = d
            best_district = dist_name

    details = DISTRICT_DETAILS.get(best_district, ("Andhra Pradesh", f"{best_district} Taluk", "500001"))
    return best_district, details[0], details[1], details[2]


@router.get("/reverse-geocode", response_model=ReverseGeocodeResponse)
def reverse_geocode(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
):
    """Reliably reverse geocodes latitude & longitude to village, mandal, district, state, PIN code, and country."""
    village = ""
    mandal = ""
    district = ""
    state = ""
    pincode = ""
    country = "India"

    # 1. Primary: OpenStreetMap Nominatim reverse geocoder
    try:
        with httpx.Client(timeout=3.0) as client:
            resp = client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={"format": "json", "lat": lat, "lon": lon, "zoom": 18, "addressdetails": 1},
                headers={"User-Agent": "SmartCrop/1.0 (agro-service; contact@smartcrop.gov.in)", "Accept-Language": "en"}
            )
            if resp.status_code == 200:
                data = resp.json()
                addr = data.get("address", {})
                village = (
                    addr.get("village") or
                    addr.get("hamlet") or
                    addr.get("suburb") or
                    addr.get("neighbourhood") or
                    addr.get("isolated_dwelling") or
                    addr.get("town") or
                    addr.get("city") or
                    ""
                )
                mandal = (
                    addr.get("subdistrict") or
                    addr.get("tehsil") or
                    addr.get("taluk") or
                    addr.get("mandal") or
                    addr.get("county") or
                    ""
                )
                raw_dist = addr.get("state_district") or addr.get("district") or addr.get("county") or ""
                district = raw_dist.replace(" District", "").replace(" district", "").strip()
                state = addr.get("state") or ""
                pincode = addr.get("postcode") or ""
                country = addr.get("country") or "India"
    except Exception:
        pass

    # 2. Secondary fallback for PIN code and mandal: BigDataCloud client
    if not pincode or not mandal or not district:
        try:
            with httpx.Client(timeout=3.0) as client:
                resp2 = client.get(
                    "https://api.bigdatacloud.net/data/reverse-geocode-client",
                    params={"latitude": lat, "longitude": lon, "localityLanguage": "en"}
                )
                if resp2.status_code == 200:
                    bd_data = resp2.json()
                    if not pincode:
                        pincode = bd_data.get("postcode") or ""
                    if not village:
                        village = bd_data.get("locality") or ""
                    if not state:
                        state = bd_data.get("principalSubdivision") or ""
                    if not country:
                        country = bd_data.get("countryName") or "India"
                    admin_levels = bd_data.get("localityInfo", {}).get("administrative", [])
                    for adm in admin_levels:
                        order = adm.get("adminLevel", 0)
                        if order == 5 and not district:
                            district = adm.get("name", "").replace(" District", "").strip()
                        elif order == 6 and not mandal:
                            mandal = adm.get("name", "")
        except Exception:
            pass

    # 3. Comprehensive offline geographic fallback for coordinates
    if not district or not state or not pincode:
        fallback_dist, fallback_state, fallback_mandal, fallback_pincode = _find_nearest_district(lat, lon)
        if not district:
            district = fallback_dist
        if not state:
            state = fallback_state
        if not mandal:
            mandal = fallback_mandal
        if not pincode:
            pincode = fallback_pincode

    if not village:
        village = f"Field ({lat:.4f}°N, {lon:.4f}°E)"

    return ReverseGeocodeResponse(
        village=village,
        mandal=mandal,
        district=district,
        state=state,
        pincode=pincode,
        country=country,
        latitude=lat,
        longitude=lon,
    )

