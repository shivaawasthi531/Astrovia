"""
Palm scan upload + reading retrieval. This is the core AI pipeline:
Gemini Vision -> embedding -> FAISS match -> Gemini text interpretation.
"""
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.models.reading import PalmReading
from app.schemas.palm import PalmReadingOut
from app.api.v1.routes.auth import get_current_user
from app.services.gemini_vision import detect_palm_lines
from app.services.gemini_interpret import generate_interpretation
from app.services.embedding import coordinates_to_vector
from app.services.vector_db import vector_store
from app.utils.image_utils import validate_image, resize_if_needed

router = APIRouter(prefix="/palm", tags=["palm"])


@router.post("/scan", response_model=PalmReadingOut)
async def scan_palm(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    raw_bytes = await file.read()
    try:
        validate_image(file.content_type, len(raw_bytes))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    processed_bytes = resize_if_needed(raw_bytes)

    # 1. Detect line coordinates via Cloudflare Vision
    try:
        line_coordinates = await detect_palm_lines(processed_bytes, mime_type="image/jpeg")
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=f"Palm detection failed: {exc}")

    # 2. Embed + search FAISS for closest known pattern
    vector = coordinates_to_vector(line_coordinates)
    match = vector_store.search(vector)
    matched_pattern_id, match_score = match if match else (None, None)

    # 3. Generate warm interpretation text
    try:
        interpretation = await generate_interpretation(line_coordinates, match_score)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=f"Interpretation generation failed: {exc}")

    # 4. Persist reading
    reading = PalmReading(
        user_id=current_user.id,
        line_coordinates=line_coordinates,
        matched_pattern_id=matched_pattern_id,
        match_score=match_score,
        interpretation=interpretation,
        status="completed",
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    # 5. Index this reading's vector for future matches
    vector_store.add(vector, reading.id)

    return reading


@router.get("/reading/{reading_id}", response_model=PalmReadingOut)
def get_reading(
    reading_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reading = db.get(PalmReading, reading_id)
    if not reading or reading.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Reading not found")
    return reading