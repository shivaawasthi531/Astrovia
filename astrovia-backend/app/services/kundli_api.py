"""
Fetches Vedic birth chart data (planetary positions + dasha periods) from
Prokerala's API. Handles Prokerala's OAuth2 client-credentials token flow.
"""
from datetime import date, time
from typing import Dict

import httpx

from app.core.config import settings

_token_cache = {"access_token": None, "expires_at": 0}


async def _get_access_token(client: httpx.AsyncClient) -> str:
    import time as time_module

    if _token_cache["access_token"] and _token_cache["expires_at"] > time_module.time():
        return _token_cache["access_token"]

    resp = await client.post(
        f"{settings.PROKERALA_BASE_URL}/token",
        data={
            "grant_type": "client_credentials",
            "client_id": settings.PROKERALA_CLIENT_ID,
            "client_secret": settings.PROKERALA_CLIENT_SECRET,
        },
    )
    resp.raise_for_status()
    data = resp.json()
    _token_cache["access_token"] = data["access_token"]
    _token_cache["expires_at"] = time_module.time() + data.get("expires_in", 3600) - 60
    return _token_cache["access_token"]


async def fetch_kundli(
    birth_date: date, birth_time: time, latitude: float, longitude: float
) -> Dict:
    """
    Returns {"planetary_positions": {...}, "dasha_periods": {...}} from
    Prokerala's Vedic astrology endpoints.
    """
    datetime_str = f"{birth_date.isoformat()}T{birth_time.isoformat()}+05:30"
    coordinates = f"{latitude},{longitude}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        token = await _get_access_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        chart_resp = await client.get(
            f"{settings.PROKERALA_BASE_URL}/v2/astrology/planet-position",
            headers=headers,
            params={"ayanamsa": 1, "coordinates": coordinates, "datetime": datetime_str},
        )
        chart_resp.raise_for_status()
        planetary_positions = chart_resp.json().get("data", {})

        dasha_resp = await client.get(
            f"{settings.PROKERALA_BASE_URL}/v2/astrology/dasha-periods",
            headers=headers,
            params={"ayanamsa": 1, "coordinates": coordinates, "datetime": datetime_str},
        )
        dasha_resp.raise_for_status()
        dasha_periods = dasha_resp.json().get("data", {})

    return {"planetary_positions": planetary_positions, "dasha_periods": dasha_periods}


def build_chart_svg_data(planetary_positions: Dict) -> Dict:
    """
    Converts raw planet longitude data into house/angle data the frontend's
    rotating wheel component can render directly, without doing astrology
    math on-device.

    Prokerala's `degree` field is the position WITHIN a zodiac sign (0-30),
    not the absolute position around the full 360-degree wheel. Without
    factoring in which house/sign the planet is in, every planet's angle
    collapses into the same narrow 0-30 range, causing them to visually
    cluster on top of each other. We fix that by computing the absolute
    longitude: (house - 1) * 30 degrees per earlier sign, plus the degree
    within the current sign.
    """
    planets = planetary_positions.get("planet_position", [])
    chart_data = []
    for planet in planets:
        house = planet.get("position", 1)  # 1-12, which zodiac sign the planet sits in
        degree_in_sign = planet.get("degree", 0)  # 0-30 within that sign
        absolute_longitude = ((house - 1) * 30) + degree_in_sign  # 0-360 around the wheel

        chart_data.append(
            {
                "name": planet.get("name"),
                "house": house,
                "degree": degree_in_sign,
                "angle": absolute_longitude,
            }
        )
    return {"planets": chart_data}
