from pydantic import BaseModel, Field
from typing import List, Optional

class GeoCoordinate(BaseModel):
    lat: float
    lng: float

class PlotPolygonRequest(BaseModel):
    plot_name: str = "My Field Plot"
    crop_name: str = "Chilli"
    sowing_date: Optional[str] = None
    coordinates: List[GeoCoordinate]

class SatelliteObservation(BaseModel):
    date: str
    ndvi_score: float
    cloud_cover_percent: float
    is_cloud_obscured: bool = False
    observation_label: str
    resolution_meters: int = 10

class NdviSummary(BaseModel):
    mean_ndvi: float
    min_ndvi: float
    max_ndvi: float
    health_score_percent: int
    healthy_canopy_percent: float # NDVI >= 0.60
    moderate_canopy_percent: float # 0.30 <= NDVI < 0.60
    stressed_or_bare_percent: float # NDVI < 0.30
    canopy_status: str # 'Vigorous / Healthy', 'Moderate Vegetative Growth', 'Sparse / Stressed'
    management_advice: str

class FieldHealthResponse(BaseModel):
    plot_id: str
    plot_name: str
    crop: str
    area_acres: float
    boundary_coordinates: List[List[float]] # [[lat, lng], ...]
    centroid: List[float] # [lat, lng]
    current_observation: SatelliteObservation
    historical_observations: List[SatelliteObservation]
    ndvi_summary: NdviSummary
    satellite_source: str = "Copernicus Sentinel-2 (B8 NIR / B4 Red)"
    farmer_disclaimer: str = (
        "IMPORTANT: Sentinel-2 NDVI calculates vegetative canopy density and plant vigor based on optical green reflectance. "
        "It does NOT measure soil nitrogen, phosphorus, potash, or chemical soil fertility directly. "
        "Use Soil Health Card lab tests for soil nutrient diagnosis."
    )
    is_demo: bool = True
