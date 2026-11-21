import asyncio
import httpx
import pytest
from fastapi import FastAPI
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import Base, get_db
from app.core.config import settings
from app.api.v1.crop_doctor import router
from app.services.adapters.vision_service import CloudVisionService, ExpertDatasetVisionService, MockCropVisionService

@pytest.fixture
def vision_service():
    return ExpertDatasetVisionService()

def test_curated_samples_availability(vision_service):
    samples = vision_service.get_sample_leaves()
    assert len(samples) >= 4
    crops = [s["crop"] for s in samples]
    assert "Chilli" in crops
    assert "Cotton" in crops
    assert "Potato" in crops

def test_high_confidence_diagnosis(vision_service):
    res = vision_service.diagnose_crop_image(
        filename="test_chilli.jpg",
        crop_hint="Chilli",
        force_confidence="high"
    )
    assert res["confidence_tier"] == "High"
    assert res["confidence_score"] >= 0.75
    assert "Thrips" in res["diagnosis"]
    assert len(res["organic_treatments"]) > 0
    assert len(res["verified_chemical_treatments"]) > 0
    # First chemical treatment must have approved active ingredient (Spinosad or Acetamiprid)
    first_chem = res["verified_chemical_treatments"][0]
    assert "Spinosad" in first_chem["active_ingredient"] or "Acetamiprid" in first_chem["active_ingredient"]
    assert first_chem["phi_days"] is not None

def test_medium_confidence_flow(vision_service):
    res = vision_service.diagnose_crop_image(
        filename="blurry_leaf.jpg",
        crop_hint="Cotton",
        force_confidence="medium"
    )
    assert res["confidence_tier"] == "Medium"
    assert 0.50 <= res["confidence_score"] < 0.75
    assert "Tentative" in res["diagnosis"]

def test_low_confidence_safety_suppression(vision_service):
    res = vision_service.diagnose_crop_image(
        filename="random_photo.jpg",
        crop_hint="Unknown",
        force_confidence="low"
    )
    assert res["confidence_tier"] == "Low"
    assert res["confidence_score"] < 0.50
    # SAFETY RULE: Must suppress chemical numbers on low confidence
    for chem in res["verified_chemical_treatments"]:
        assert "Consult a KVK / agri expert for dosage" in chem["dosage_per_acre"]
        assert "Consult a KVK / agri expert for dosage" in chem["concentration"]

def test_unverified_label_dosage_safety_fallback(vision_service):
    # Potato Calcium Deficiency has no registered chemical pesticide
    res = vision_service.diagnose_crop_image(
        filename="potato_leaf.jpg",
        crop_hint="Potato",
        force_confidence="high"
    )
    assert "Calcium Deficiency" in res["diagnosis"]
    # Check that chemical treatment does not hallucinate numerical insecticide dosage
    for chem in res["verified_chemical_treatments"]:
        assert "Consult a KVK / agri expert for dosage" in chem["dosage_per_acre"]


FIXTURE_DIR = Path(__file__).parent / "crop-doctor" / "images"


@pytest.mark.parametrize(("name", "expected_crop", "expected_demo"), [
    ("healthy-onion.jpg", "Onion", True),
    ("tomato-leaf-curl.jpg", "Tomato", True),
    ("rice-leaf-blast.jpg", "Paddy (Rice)", True),
])
def test_mock_diagnoses_only_bundled_fixture_images(name, expected_crop, expected_demo):
    result = MockCropVisionService().diagnose_crop_image(
        name, (FIXTURE_DIR / name).read_bytes(), crop_hint="Chilli"
    )
    assert result["crop"] == expected_crop
    assert result["is_demo"] is expected_demo
    assert result["confidence_percentage"] > 0


def test_mock_rejects_unknown_custom_photo():
    with pytest.raises(RuntimeError, match="only recognizes its bundled example photos"):
        MockCropVisionService().diagnose_crop_image("random.jpg", b"not a fixture")


def test_local_expert_does_not_claim_custom_photo_diagnosis():
    with pytest.raises(RuntimeError, match="Custom photo analysis is not configured"):
        ExpertDatasetVisionService().diagnose_crop_image("leaf.jpg", b"some image bytes")


def test_diagnose_endpoint_accepts_image_field_in_explicit_mock_mode(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine)

    def test_db():
        session = TestSession()
        try:
            yield session
        finally:
            session.close()

    app = FastAPI()
    app.include_router(router, prefix="/api/v1")
    app.dependency_overrides[get_db] = test_db
    monkeypatch.setattr(settings, "CROP_DOCTOR_MOCK", True)
    try:
        async def request_diagnosis():
            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
                return await client.post(
                    "/api/v1/crop-doctor/diagnose",
                    files={"image": ("tomato.jpg", (FIXTURE_DIR / "tomato-leaf-curl.jpg").read_bytes(), "image/jpeg")},
                    data={"crop_hint": "Chilli", "language": "en"},
                )

        response = asyncio.run(request_diagnosis())
        assert response.status_code == 200, response.text
        assert response.json()["crop"] == "Tomato"
        assert response.json()["is_demo"] is True
        assert response.json()["diagnosis_id"]
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(engine)
        engine.dispose()


def test_live_low_confidence_result_suppresses_treatments(monkeypatch):
    diagnosis = {
        "crop": "Tomato", "disease_name": "Leaf Spot", "local_name": "", "confidence": 0.3,
        "severity": "high", "symptoms_seen": ["unclear marks"], "cause": "Possible fungus",
        "is_healthy": False, "treatment": {"organic": [{"name": "Spray", "dose": "1 ml", "method": "apply"}], "cultural": []},
        "prevention": ["Spray weekly"],
    }

    class Response:
        def raise_for_status(self):
            return None

        def json(self):
            return {"candidates": [{"content": {"parts": [{"text": __import__("json").dumps(diagnosis)}]}}]}

    monkeypatch.setattr("app.services.adapters.vision_service.httpx.post", lambda *args, **kwargs: Response())
    result = CloudVisionService("test-key").diagnose_crop_image("leaf.jpg", b"image-bytes")
    assert result["diagnosis"] == "Not sure"
    assert result["confidence_tier"] == "Low"
    assert result["organic_treatments"] == []
    assert result["verified_chemical_treatments"] == []
    assert "Do not apply a pesticide" in result["prevention"][-1]
