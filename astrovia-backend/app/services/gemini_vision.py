"""
Wraps Cloudflare Workers AI (Llama 3.2 Vision) to detect palm lines from an
uploaded image. Returns normalized (0-1) coordinate arrays for each line so
the frontend can draw them on any screen size without rescaling logic.
"""
import base64
from typing import Dict, List, Optional

from app.services.cloudflare_ai import extract_response_text, parse_model_json, run_cf_model

CF_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct"

PALM_DETECTION_PROMPT = """
You are a computer vision system specialized in palmistry image analysis.
Analyze the palm image and detect the following lines: heart line, head line,
life line, and fate line (if visible).

Return ONLY valid JSON (no markdown, no prose) in this exact shape:
{
  "heart_line": [{"x": 0.12, "y": 0.30}, ...],
  "head_line": [{"x": 0.15, "y": 0.45}, ...],
  "life_line": [{"x": 0.20, "y": 0.50}, ...],
  "fate_line": [{"x": 0.50, "y": 0.20}, ...] or null
}

Coordinates must be normalized between 0 and 1 relative to image width/height,
ordered as a smooth path from one end of the line to the other. Provide at
least 8 points per line for a smooth curve. If a line is not clearly visible,
make your best estimate based on typical palm anatomy rather than omitting it,
except fate_line which may be null if truly absent.
"""

PALM_LINE_SCHEMA = {
    "type": "object",
    "properties": {
        "heart_line": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"x": {"type": "number"}, "y": {"type": "number"}},
                "required": ["x", "y"],
            },
        },
        "head_line": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"x": {"type": "number"}, "y": {"type": "number"}},
                "required": ["x", "y"],
            },
        },
        "life_line": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"x": {"type": "number"}, "y": {"type": "number"}},
                "required": ["x", "y"],
            },
        },
        "fate_line": {
            "anyOf": [
                {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {"x": {"type": "number"}, "y": {"type": "number"}},
                        "required": ["x", "y"],
                    },
                },
                {"type": "null"},
            ]
        },
    },
    "required": ["heart_line", "head_line", "life_line", "fate_line"],
}


def _image_data_uri(image_bytes: bytes, mime_type: str) -> str:
    encoded = base64.b64encode(image_bytes).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


def _normalize_points(points: Optional[List]) -> List[Dict[str, float]]:
    if not points:
        return []
    normalized = []
    for point in points:
        if not isinstance(point, dict):
            continue
        try:
            x = float(point["x"])
            y = float(point["y"])
        except (KeyError, TypeError, ValueError):
            continue
        normalized.append({"x": max(0.0, min(1.0, x)), "y": max(0.0, min(1.0, y))})
    return normalized


async def detect_palm_lines(image_bytes: bytes, mime_type: str = "image/jpeg") -> Dict:
    data_uri = _image_data_uri(image_bytes, mime_type)

    payload = {
        "messages": [
            {
                "role": "system",
                "content": "You are a precise vision model. Respond with valid JSON only.",
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PALM_DETECTION_PROMPT},
                    {"type": "image_url", "image_url": {"url": data_uri}},
                ],
            },
        ],
        "max_tokens": 2048,
        "temperature": 0.2,
        "response_format": {
            "type": "json_schema",
            "json_schema": PALM_LINE_SCHEMA,
        },
    }

    result = await run_cf_model(CF_MODEL, payload)
    raw_text = extract_response_text(result)
    data = parse_model_json(raw_text)

    return {
        "heart_line": _normalize_points(data.get("heart_line")),
        "head_line": _normalize_points(data.get("head_line")),
        "life_line": _normalize_points(data.get("life_line")),
        "fate_line": _normalize_points(data.get("fate_line")) or None,
    }
