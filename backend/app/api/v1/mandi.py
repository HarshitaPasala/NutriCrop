from fastapi import APIRouter, Query, Depends
from typing import Optional, List
from app.models.support import MandiResponse
from app.services.adapters.mandi_service import BaseMandiService, get_mandi_service

router = APIRouter(prefix="/mandi", tags=["Mandi Prices"])

@router.get("/prices", response_model=MandiResponse)
def get_mandi_prices(
    commodity: Optional[str] = Query(None, description="Crop / commodity filter"),
    district: Optional[str] = Query(None, description="District filter"),
    state: Optional[str] = Query(None, description="State filter"),
    market_center: Optional[str] = Query(None, description="Specific Mandi market center filter"),
    latitude: Optional[float] = Query(None, ge=-90, le=90),
    longitude: Optional[float] = Query(None, ge=-180, le=180),
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lon: Optional[float] = Query(None, ge=-180, le=180),
    radius_km: Optional[float] = Query(None, description="Maximum distance radius in km"),
    service: BaseMandiService = Depends(get_mandi_service),
):
    """Fetch live or simulated APMC wholesale market rates per quintal."""
    final_lat = latitude if latitude is not None else lat
    final_lon = longitude if longitude is not None else lon
    return service.get_prices(
        commodity=commodity,
        district=district,
        state=state,
        market_center=market_center,
        latitude=final_lat,
        longitude=final_lon,
        radius_km=radius_km,
    )

@router.get("/crops-by-area", response_model=List[str])
def get_crops_by_area(
    state: Optional[str] = Query(None, description="State filter"),
    district: Optional[str] = Query(None, description="District filter"),
    service: BaseMandiService = Depends(get_mandi_service),
):
    """Returns crops commonly cultivated in the specified state or district."""
    return service.get_crops_by_area(state=state, district=district)

@router.get("/markets", response_model=List[str])
def get_markets(
    state: Optional[str] = Query(None, description="State filter"),
    district: Optional[str] = Query(None, description="District filter"),
    service: BaseMandiService = Depends(get_mandi_service),
):
    """Returns Mandi APMC markets in the specified area."""
    return service.get_markets(state=state, district=district)
