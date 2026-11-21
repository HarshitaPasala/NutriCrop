import os
import uuid
from fastapi import APIRouter, Query, HTTPException, Response, UploadFile, File
from fastapi.responses import FileResponse
from typing import Optional
from app.models.farm import (
    FarmOverviewResponse,
    FarmPlot,
    ExpenseEntry,
    AddPlotRequest,
    AddExpenseRequest,
)
from app.services.farm_service import FarmService

router = APIRouter(prefix="/farm", tags=["My Farm Platform"])

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../uploads/farm"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/overview", response_model=FarmOverviewResponse)
def get_farm_overview(
    plot_id: Optional[str] = Query(None, description="Active plot ID"),
    phone: Optional[str] = Query(None, description="Farmer phone number")
):
    """Returns multi-plot parcels, expense/yield ledger, multi-season soil trends, and offline guides."""
    return FarmService.get_overview(plot_id=plot_id, phone=phone)

@router.post("/plots", response_model=FarmPlot)
def add_plot(req: AddPlotRequest, phone: Optional[str] = Query(None)):
    """Add a new farm plot or parcel."""
    if req.area_acres <= 0:
        raise HTTPException(status_code=400, detail="Plot area must be greater than 0.")
    return FarmService.add_plot(req, phone=phone)

@router.put("/plots/{plot_id}", response_model=FarmPlot)
def update_plot(plot_id: str, req: AddPlotRequest, phone: Optional[str] = Query(None)):
    if req.area_acres <= 0:
        raise HTTPException(status_code=400, detail="Plot area must be greater than 0.")
    plot = FarmService.update_plot(plot_id, req, phone=phone)
    if not plot:
        raise HTTPException(status_code=404, detail="Farm plot not found.")
    return plot

@router.delete("/plots/{plot_id}", status_code=204)
def delete_plot(plot_id: str, phone: Optional[str] = Query(None)):
    if not FarmService.delete_plot(plot_id, phone=phone):
        raise HTTPException(status_code=400, detail="The plot could not be deleted. Keep at least one farm plot.")
    return Response(status_code=204)

@router.post("/expenses", response_model=ExpenseEntry)
def add_expense(req: AddExpenseRequest, phone: Optional[str] = Query(None)):
    """Add an agricultural input expense entry to the farm ledger."""
    if req.amount_inr <= 0:
        raise HTTPException(status_code=400, detail="Expense amount must be positive.")
    return FarmService.add_expense(req, phone=phone)

@router.post("/upload-photo")
async def upload_farm_photo(file: UploadFile = File(...)):
    """Upload a farm plot photo (multipart/form-data)."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a JPEG, PNG, or WebP image.")
    
    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Photo is too large. Choose an image under 20 MB.")
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        ext = ".jpg"
    
    filename = f"plot_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, filename)
    with open(dest_path, "wb") as f:
        f.write(contents)
    
    image_url = f"/api/v1/farm/image/{filename}"
    return {"image_url": image_url, "photo_url": image_url, "filename": filename}

@router.get("/image/{filename}")
def get_farm_image(filename: str):
    safe_name = os.path.basename(filename)
    path = os.path.join(UPLOAD_DIR, safe_name)
    if os.path.exists(path):
        return FileResponse(path)
    raise HTTPException(status_code=404, detail="Farm image not found.")
