from fastapi import APIRouter, Query
from typing import Optional
from app.models.support import SchemeListResponse
from app.services.schemes_service import SchemesService

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])

@router.get("/list", response_model=SchemeListResponse)
def get_schemes(
    category: Optional[str] = Query(None, description="Category filter (Central/State/all)")
):
    """Retrieve verified government farmer schemes with eligibility and official portal links."""
    return SchemesService.get_schemes(category=category)
