"""
User model. Stores auth credentials plus birth details needed for Kundli
generation (so the user only has to enter them once during onboarding).
"""
import uuid
from datetime import datetime, date, time

from sqlalchemy import String, DateTime, Date, Time, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=True)

    # Birth details — used for Kundli/dasha calculation
    birth_date: Mapped[date] = mapped_column(Date, nullable=True)
    birth_time: Mapped[time] = mapped_column(Time, nullable=True)
    birth_place: Mapped[str] = mapped_column(String, nullable=True)
    birth_latitude: Mapped[float] = mapped_column(nullable=True)
    birth_longitude: Mapped[float] = mapped_column(nullable=True)

    onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    readings = relationship("PalmReading", back_populates="user", cascade="all, delete-orphan")
    kundlis = relationship("Kundli", back_populates="user", cascade="all, delete-orphan")