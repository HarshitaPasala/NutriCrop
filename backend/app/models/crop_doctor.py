import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text
from app.core.database import Base

class CropDiagnosis(Base):
    __tablename__ = "crop_diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    crop = Column(String(100), nullable=False)
    diagnosis = Column(String(200), nullable=False)
    confidence_score = Column(Float, nullable=False)
    confidence_tier = Column(String(20), nullable=False)
    image_url = Column(String(500), nullable=True)
    symptoms = Column(Text, nullable=False)
    cause = Column(Text, nullable=False)
    result_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
