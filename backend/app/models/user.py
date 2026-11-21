import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), unique=True, index=True, nullable=False)
    name = Column(String(100), default="Farmer")
    preferred_language = Column(String(10), default="en")
    village = Column(String(100), default="")
    mandal = Column(String(100), default="")
    district = Column(String(100), default="")
    state = Column(String(100), default="Andhra Pradesh")
    pincode = Column(String(20), default="")
    country = Column(String(50), default="India")
    latitude = Column(String(30), nullable=True)
    longitude = Column(String(30), nullable=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    preferences = Column(JSON, default=dict)
