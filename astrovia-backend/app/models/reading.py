"""
PalmReading model. One row per palm scan — stores the raw Gemini vision
output, the FAISS match, and the generated interpretation text.
"""
import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PalmReading(Base):
    __tablename__ = "palm_readings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)

    image_url: Mapped[str] = mapped_column(String, nullable=True)

    # Raw line coordinates returned by Gemini Vision, normalized 0-1
    line_coordinates: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Closest FAISS match metadata (pattern id + similarity score)
    matched_pattern_id: Mapped[str] = mapped_column(String, nullable=True)
    match_score: Mapped[float] = mapped_column(nullable=True)

    # Gemini-generated interpretation, keyed by line name + overall summary
    interpretation: Mapped[dict] = mapped_column(JSON, nullable=False)

    status: Mapped[str] = mapped_column(String, default="completed")  # pending|processing|completed|failed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="readings")