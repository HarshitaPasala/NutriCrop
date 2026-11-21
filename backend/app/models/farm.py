from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class FarmPlot(BaseModel):
    plot_id: str
    name: str
    area_acres: float
    area_unit: Optional[str] = "acres"
    current_crop: str
    variety: str
    soil_type: str # 'Clay Loam', 'Red Sandy Loam', 'Black Soil', etc.
    sowing_date: str
    last_soil_test_date: str
    soil_health_score: int # e.g. 78 out of 100
    irrigation_type: Optional[str] = "Canal / Furrow"
    village: Optional[str] = None
    mandal: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    image_url: Optional[str] = None

class ExpenseEntry(BaseModel):
    id: str
    plot_id: str
    date: str
    category: str # 'Seeds', 'Fertilizers', 'Pesticides', 'Labor', 'Machinery'
    amount_inr: float
    note: str

class ExpenseSummary(BaseModel):
    total_expense_inr: float
    category_breakdown: Dict[str, float]
    gross_revenue_inr: float
    net_profit_inr: float
    profit_per_acre_inr: float
    entries: List[ExpenseEntry]

class SoilTrendPoint(BaseModel):
    season_label: str # e.g. 'Kharif 2024', 'Rabi 2024', 'Kharif 2025', 'Rabi 2025'
    organic_carbon_pct: float
    nitrogen_kg_ha: float
    phosphorus_kg_ha: float
    potassium_kg_ha: float
    ph: float

class OfflineCropGuide(BaseModel):
    crop_name: str
    scientific_name: str
    ideal_season: str
    duration_days: int
    seed_rate: str
    spacing: str
    water_requirement_mm: str
    critical_stages: List[str]
    harvest_indicator: str
    storage_tips: str

class FarmOverviewResponse(BaseModel):
    plots: List[FarmPlot]
    active_plot_id: str
    expense_summary: ExpenseSummary
    soil_trends: List[SoilTrendPoint]
    crop_guides: List[OfflineCropGuide]
    is_demo: bool = True

class AddPlotRequest(BaseModel):
    name: str
    area_acres: float
    area_unit: Optional[str] = "acres"
    current_crop: str
    variety: Optional[str] = "Standard"
    soil_type: str
    sowing_date: str
    irrigation_type: Optional[str] = "Canal / Furrow"
    village: Optional[str] = None
    mandal: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    image_url: Optional[str] = None
    phone: Optional[str] = None

class AddExpenseRequest(BaseModel):
    plot_id: str
    category: str
    amount_inr: float
    note: str
    phone: Optional[str] = None
