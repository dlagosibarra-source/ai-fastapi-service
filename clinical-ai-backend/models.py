from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_age = Column(Integer)
    patient_gender = Column(String)
    clinical_notes = Column(Text)
    ai_analysis = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
