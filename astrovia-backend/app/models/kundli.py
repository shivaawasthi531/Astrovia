"""
Kundli model. Stores the raw planetary/dasha response from the astrology
provider so we don't re-fetch it on every app open.
"""
import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Kundli(Base):
    __tablename__ = "kundlis"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)

    planetary_positions: Mapped[dict] = mapped_column(JSON, nullable=False)
    dasha_periods: Mapped[dict] = mapped_column(JSON, nullable=False)
    chart_svg_data: Mapped[dict] = mapped_column(JSON, nullable=True)  # precomputed angles for the wheel UI

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="kundlis")