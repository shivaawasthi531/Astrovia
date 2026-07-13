"""
Pydantic schemas for palm-reading endpoints.
"""
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel


class LinePoint(BaseModel):
    x: float  # normalized 0-1
    y: float


class LineCoordinates(BaseModel):
    heart_line: List[LinePoint]
    head_line: List[LinePoint]
    life_line: List[LinePoint]
    fate_line: Optional[List[LinePoint]] = None


class InterpretationOut(BaseModel):
    heart_line: str
    head_line: str
    life_line: str
    fate_line: Optional[str] = None
    summary: str


class PalmReadingOut(BaseModel):
    id: str
    image_url: Optional[str]
    line_coordinates: Dict
    matched_pattern_id: Optional[str]
    match_score: Optional[float]
    interpretation: Dict
    status: str
    created_at: datetime

    class Config:
        from_attributes = True