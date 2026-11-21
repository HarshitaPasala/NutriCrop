from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from app.models.support import (
    CommunityPost,
    PestAlertBulletin,
    PostCreateRequest,
)
from app.services.community_service import CommunityService

router = APIRouter(prefix="/community", tags=["Farmer Community Forum"])

@router.get("/posts", response_model=List[CommunityPost])
def get_posts(
    category: Optional[str] = Query(None, description="Category filter"),
    crop: Optional[str] = Query(None, description="Crop filter"),
):
    """Fetch discussion feed with verified agronomist solutions."""
    return CommunityService.get_posts(category=category, crop=crop)

@router.post("/posts", response_model=CommunityPost)
def create_post(payload: PostCreateRequest):
    """Post a farming question to the community and local scientists."""
    if not payload.title or len(payload.title) < 5:
        raise HTTPException(status_code=400, detail="Question title must be at least 5 characters.")
    return CommunityService.create_post(payload)

@router.post("/posts/{post_id}/upvote", response_model=CommunityPost)
def upvote_post(post_id: str):
    """Upvote an insightful discussion or verified solution."""
    post = CommunityService.upvote_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    return post

@router.get("/pest-alerts", response_model=List[PestAlertBulletin])
def get_pest_alerts(
    district: Optional[str] = Query(None, description="District filter")
):
    """Fetch active community and KVK verified local pest outbreak alerts."""
    return CommunityService.get_pest_alerts(district=district)
