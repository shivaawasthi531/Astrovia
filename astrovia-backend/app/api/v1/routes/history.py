"""
Paginated history of a user's past palm readings, for the History tab.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.models.reading import PalmReading
from app.schemas.palm import PalmReadingOut
from app.api.v1.routes.auth import get_current_user

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/readings", response_model=List[PalmReadingOut])
def list_readings(
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    readings = db.execute(
        select(PalmReading)
        .where(PalmReading.user_id == current_user.id)
        .order_by(PalmReading.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).scalars().all()
    return readings