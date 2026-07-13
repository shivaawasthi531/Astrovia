"""
Kundli generation + retrieval. Requires the user's birth details to already
be set (via /auth/birth-details during onboarding).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.models.kundli import Kundli
from app.schemas.kundli import KundliOut
from app.api.v1.routes.auth import get_current_user
from app.services.kundli_api import fetch_kundli, build_chart_svg_data

router = APIRouter(prefix="/kundli", tags=["kundli"])


@router.post("/generate", response_model=KundliOut)
async def generate_kundli(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.onboarding_complete or not current_user.birth_date:
        raise HTTPException(status_code=400, detail="Complete birth details first")

    try:
        data = await fetch_kundli(
            current_user.birth_date,
            current_user.birth_time,
            current_user.birth_latitude,
            current_user.birth_longitude,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Astrology provider error: {exc}")

    chart_svg_data = build_chart_svg_data(data["planetary_positions"])

    kundli = Kundli(
        user_id=current_user.id,
        planetary_positions=data["planetary_positions"],
        dasha_periods=data["dasha_periods"],
        chart_svg_data=chart_svg_data,
    )
    db.add(kundli)
    db.commit()
    db.refresh(kundli)
    return kundli


@router.get("/latest", response_model=KundliOut)
def get_latest_kundli(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    kundli = db.execute(
        select(Kundli).where(Kundli.user_id == current_user.id).order_by(Kundli.created_at.desc())
    ).scalars().first()
    if not kundli:
        raise HTTPException(status_code=404, detail="No Kundli generated yet")
    return kundli