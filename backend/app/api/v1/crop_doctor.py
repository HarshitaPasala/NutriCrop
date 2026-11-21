import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from io import BytesIO
from PIL import Image, UnidentifiedImageError
import httpx
from app.core.database import get_db
from app.models.crop_doctor import CropDiagnosis
from app.services.adapters.vision_service import get_vision_service, load_chemical_labels

router = APIRouter(prefix="/crop-doctor", tags=["AI Crop Doctor"])

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
IMAGES_DIR = os.path.join(ROOT_DIR, "Crop_Disease_Images", "images")
UPLOADS_DIR = os.path.join(ROOT_DIR, "backend", "uploads", "crop_doctor")
os.makedirs(UPLOADS_DIR, exist_ok=True)

@router.get("/samples")
def get_sample_leaves():
    """
    Returns pre-curated diseased crop leaf samples from Crop_Disease_Images dataset.
    """
    service = get_vision_service()
    return {
        "samples": service.get_sample_leaves(),
        "is_demo": True
    }

@router.get("/sample-image/{image_name}")
def get_sample_image(image_name: str):
    """
    Serves actual JPEG leaf photos from Crop_Disease_Images.
    """
    file_path = os.path.join(IMAGES_DIR, image_name)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="image/jpeg")
    raise HTTPException(status_code=404, detail="Sample image not found.")

@router.get("/image/{filename}")
def get_uploaded_image(filename: str):
    """
    Serves uploaded leaf photos.
    """
    file_path = os.path.join(UPLOADS_DIR, os.path.basename(filename))
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Uploaded image not found.")

@router.get("/recent")
def get_recent_diagnosis(db: Session = Depends(get_db)):
    """
    Returns the most recent crop diagnosis.
    """
    recent = db.query(CropDiagnosis).order_by(CropDiagnosis.id.desc()).first()
    if not recent:
        return {"diagnosis": None}
    res = dict(recent.result_json) if recent.result_json else {}
    res["diagnosis_id"] = recent.id
    if recent.image_url:
        res["image_url"] = recent.image_url
    return {"diagnosis": res}

@router.get("/labels")
def get_registered_labels():
    """
    Returns registered CIBRC official pesticide labels.
    """
    return {
        "labels": load_chemical_labels(),
        "source": "CIBRC Govt of India",
        "is_demo": False
    }

@router.post("/diagnose")
async def diagnose_crop_photo(
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None),
    crop_hint: Optional[str] = Form(None),
    force_confidence: Optional[str] = Form(None),
    language: str = Form("en"),
    db: Session = Depends(get_db)
):
    service = get_vision_service()
    image_bytes = None
    filename = "uploaded_leaf.jpg"
    image_url: Optional[str] = None

    upload = image or file
    if upload:
        filename = upload.filename or "uploaded_leaf.jpg"
        image_bytes = await upload.read()
        
        if len(image_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty. Please capture or select a valid leaf photo."
            )
        if len(image_bytes) > 20 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File size exceeds 20MB limit. Please upload an image under 20MB."
            )
        
        # Verify image headers; HEIC needs a Pillow HEIF codec and should be converted by the client when possible.
        is_jpeg = image_bytes.startswith(b'\xff\xd8\xff')
        is_png = image_bytes.startswith(b'\x89PNG\r\n\x1a\n')
        is_webp = image_bytes.startswith(b'RIFF') and b'WEBP' in image_bytes[:16]
        if not (is_jpeg or is_png or is_webp):
            raise HTTPException(
                status_code=400,
                detail="Invalid or unreadable image format. Please upload a clear JPG, PNG, or WebP photo. Convert HEIC to JPG if the device photo cannot be decoded."
            )
        try:
            with Image.open(BytesIO(image_bytes)) as uploaded_image:
                uploaded_image.verify()
        except (UnidentifiedImageError, OSError, ValueError):
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a readable image. Please choose a valid JPG, PNG, or WebP photo."
            )
        
        # Save uploaded image permanently to UPLOADS_DIR
        safe_name = f"{uuid.uuid4().hex}_{os.path.basename(filename)}"
        save_path = os.path.join(UPLOADS_DIR, safe_name)
        with open(save_path, "wb") as f_out:
            f_out.write(image_bytes)
        image_url = f"/api/v1/crop-doctor/image/{safe_name}"

    elif sample_id:
        filename = f"{sample_id}.jpg"
        image_url = f"/api/v1/crop-doctor/sample-image/{sample_id}.jpg"
    else:
        filename = "default_sample.jpg"

    # If sample_id was selected, adjust crop_hint
    if sample_id:
        for s in service.get_sample_leaves():
            if s["id"] == sample_id:
                crop_hint = s["crop"]
                break

    try:
        result = service.diagnose_crop_image(
            filename=filename,
            image_bytes=image_bytes,
            crop_hint=crop_hint,
            force_confidence=force_confidence,
            language=language,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except (httpx.HTTPError, ValueError, KeyError, IndexError) as exc:
        raise HTTPException(status_code=502, detail="The vision service could not analyze this photo. Please retry with a clear leaf image.") from exc

    if image_url:
        result["image_url"] = image_url

    # Save diagnosis record in database
    diagnosis_record = CropDiagnosis(
        crop=result["crop"],
        diagnosis=result["diagnosis"],
        confidence_score=result["confidence_score"],
        confidence_tier=result["confidence_tier"],
        image_url=image_url,
        symptoms=result["symptoms"],
        cause=result["cause"],
        result_json=result
    )
    db.add(diagnosis_record)
    db.commit()
    db.refresh(diagnosis_record)

    result["diagnosis_id"] = diagnosis_record.id
    return result
