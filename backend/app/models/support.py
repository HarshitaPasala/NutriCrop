from pydantic import BaseModel, Field
from typing import List, Optional

# --- 1. Mandi Prices Models ---
class MandiRecord(BaseModel):
    id: str
    commodity: str
    variety: str
    market_center: str
    district: str
    state: str
    min_price_quintal: float # In Rupees
    max_price_quintal: float
    modal_price_quintal: float
    arrival_date: str
    price_trend: str # 'rising', 'stable', 'declining'
    change_percent: float
    distance_km: Optional[float] = None

class MandiResponse(BaseModel):
    records: List[MandiRecord]
    total_markets: int
    data_source: str = "AGMARKNET (agmarknet.gov.in / data.gov.in)"
    last_updated: str
    is_demo: bool = True

# --- 2. Expert Help & KVK Models ---
class KvkCenter(BaseModel):
    center_id: str
    name: str
    district: str
    state: str
    address: str
    head_scientist: str
    phone: str
    email: str
    specialization: str
    kvk_zone: str

class KvkSearchResponse(BaseModel):
    centers: List[KvkCenter]
    total: int
    kisan_call_center_toll_free: str = "1800-180-1551"
    operational_hours: str = "6:00 AM to 10:00 PM (All 7 Days)"
    is_demo: bool = True

class CallbackRequest(BaseModel):
    farmer_name: str
    phone: str
    village: str
    district: str
    crop: str
    problem_description: str
    preferred_language: str = "en"

class CallbackResponse(BaseModel):
    status: str
    ticket_id: str
    message: str
    estimated_callback_time: str
    is_demo: bool = True

# --- 3. Government Schemes Models ---
class GovtScheme(BaseModel):
    id: str
    title: str
    category: str # 'Central' or 'State'
    ministry: str
    financial_benefit: str
    eligibility_criteria: List[str]
    required_documents: List[str]
    official_portal_url: str
    helpline: Optional[str] = None

class SchemeListResponse(BaseModel):
    schemes: List[GovtScheme]
    total: int
    privacy_notice: str = (
        "NutriCrop does not store or process sensitive identity documents like Aadhaar cards or bank account numbers. "
        "Direct links to official .gov.in portals and nearest CSC centers are provided for safe application."
    )
    is_demo: bool = True

# --- 4. Farmer Community Forum Models ---
class CommunityComment(BaseModel):
    id: str
    author_name: str
    author_role: str # 'Farmer', 'Verified Agronomist', 'KVK Scientist'
    content: str
    created_at: str
    upvotes: int = 0

class CommunityPost(BaseModel):
    id: str
    author_name: str
    author_location: str
    category: str # 'Crop Protection', 'Soil Health', 'Market Advice', 'Machinery'
    title: str
    content: str
    crop: Optional[str] = None
    tags: List[str] = []
    created_at: str
    upvotes: int = 0
    comments: List[CommunityComment] = []
    is_resolved: bool = False

class PestAlertBulletin(BaseModel):
    id: str
    pest_name: str
    crop_affected: str
    district: str
    state: str
    severity: str # 'high', 'medium', 'advisory'
    advisory_summary: str
    reported_date: str
    verified_by: str

class PostCreateRequest(BaseModel):
    author_name: str
    author_location: str
    category: str
    title: str
    content: str
    crop: Optional[str] = None
