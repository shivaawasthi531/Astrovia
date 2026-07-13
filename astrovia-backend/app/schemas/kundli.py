"""
Pydantic schemas for Kundli endpoints.
"""
from datetime import datetime
from typing import Dict
from pydantic import BaseModel


class KundliOut(BaseModel):
    id: str
    planetary_positions: Dict
    dasha_periods: Dict
    chart_svg_data: Dict | None
    created_at: datetime

    class Config:
        from_attributes = True