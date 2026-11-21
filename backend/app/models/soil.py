import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from app.core.database import Base

class SoilReport(Base):
    __tablename__ = "soil_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    farmer_name = Column(String(100), default="Farmer")
    village = Column(String(100), default="")
    district = Column(String(100), default="")
    state = Column(String(100), default="Andhra Pradesh")
    crop = Column(String(100), nullable=False)
    farm_size_acres = Column(Float, nullable=False)
    soil_type = Column(String(100), default="Alluvial")
    season = Column(String(50), default="Kharif 2026")
    
    # Soil Health Card values
    nitrogen_val = Column(Float, nullable=False)
    phosphorus_val = Column(Float, nullable=False)
    potassium_val = Column(Float, nullable=False)
    ph_val = Column(Float, nullable=False)
    organic_carbon_val = Column(Float, nullable=True)
    ec_val = Column(Float, nullable=True)

    # Calculation Output and Prescriptions
    calculation_result = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
