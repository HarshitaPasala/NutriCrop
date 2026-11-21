from fastapi import APIRouter, Query, Depends
from typing import Optional
from app.models.support import KvkSearchResponse, CallbackRequest, CallbackResponse
from app.services.adapters.kvk_service import BaseKvkService, get_kvk_service

router = APIRouter(prefix="/expert-help", tags=["Expert Help & KVK Directory"])

@router.get("/kvk-centers", response_model=KvkSearchResponse)
def get_kvk_centers(
    district: Optional[str] = Query(None, description="District filter"),
    state: Optional[str] = Query(None, description="State filter"),
    service: BaseKvkService = Depends(get_kvk_service),
):
    """Search accredited Krishi Vigyan Kendras with scientist contacts and phone numbers."""
    return service.search_kvk_centers(district=district, state=state)

@router.post("/request-callback", response_model=CallbackResponse)
def request_callback(
    req: CallbackRequest,
    service: BaseKvkService = Depends(get_kvk_service),
):
    """Schedule an advisory callback with a regional agricultural scientist."""
    return service.request_callback(req)
