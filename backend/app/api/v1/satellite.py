from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.models.satellite import (
    PlotPolygonRequest,
    FieldHealthResponse,
)
from app.services.adapters.satellite_service import (
    BaseSatelliteService,
    get_satellite_service,
)

router = APIRouter(prefix="/satellite", tags=["Satellite Field Monitor"])

@router.get("/demo-plots", response_model=List[Dict[str, Any]])
def get_demo_plots(service: BaseSatelliteService = Depends(get_satellite_service)):
    """Return pre-configured benchmark Indian farm plots for instant testing."""
    return service.get_demo_plots()

@router.post("/analyze-plot", response_model=FieldHealthResponse)
def analyze_field_plot(
    payload: PlotPolygonRequest,
    service: BaseSatelliteService = Depends(get_satellite_service)
):
    """
    Process field boundary polygon and return Sentinel-2 NDVI vegetative health analysis.
    """
    if len(payload.coordinates) < 3:
        raise HTTPException(
            status_code=400,
            detail="A polygon boundary must contain at least 3 GPS coordinates."
        )
    return service.analyze_plot_ndvi(
        coordinates=payload.coordinates,
        plot_name=payload.plot_name,
        crop=payload.crop_name,
        sowing_date=payload.sowing_date,
    )
