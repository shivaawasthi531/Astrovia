"""
Generates the warm, personalized palm-reading interpretation text using
Cloudflare Workers AI, based on detected line coordinates + FAISS match info.
"""
import json
from typing import Dict, Optional

from app.services.cloudflare_ai import extract_response_text, parse_model_json, run_cf_model

CF_TEXT_MODEL = "@cf/meta/llama-3.1-8b-instruct"

INTERPRETATION_PROMPT_TEMPLATE = """
You are a warm, insightful palmistry expert writing a personalized reading
for a mobile app called Astrovia. Given the detected palm line shapes below,
write an interpretation for each line plus an overall summary.

Line data (normalized coordinates describing curvature/length/position):
{line_data}

Similarity to previously seen pattern: {match_context}

Return ONLY valid JSON in this exact shape, no markdown:
{{
  "heart_line": "2-3 sentence reading about emotional life and relationships",
  "head_line": "2-3 sentence reading about thinking style and decision making",
  "life_line": "2-3 sentence reading about vitality and life path",
  "fate_line": "2-3 sentence reading about career and destiny, or null if not detected",
  "summary": "3-4 sentence warm overall summary tying the lines together"
}}

Tone: warm, encouraging, mystical but grounded — never fatalistic or scary.
"""

INTERPRETATION_SCHEMA = {
    "type": "object",
    "properties": {
        "heart_line": {"type": "string"},
        "head_line": {"type": "string"},
        "life_line": {"type": "string"},
        "fate_line": {"anyOf": [{"type": "string"}, {"type": "null"}]},
        "summary": {"type": "string"},
    },
    "required": ["heart_line", "head_line", "life_line", "fate_line", "summary"],
}


async def generate_interpretation(
    line_coordinates: Dict, match_score: Optional[float] = None
) -> Dict:
    match_context = (
        f"{match_score * 100:.0f}% similar to a known pattern"
        if match_score is not None
        else "no close prior match found — this is a fairly unique palm"
    )

    prompt = INTERPRETATION_PROMPT_TEMPLATE.format(
        line_data=json.dumps(line_coordinates), match_context=match_context
    )

    payload = {
        "messages": [
            {
                "role": "system",
                "content": "You are a palmistry expert. Respond with valid JSON only.",
            },
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 1024,
        "temperature": 0.7,
        "response_format": {
            "type": "json_schema",
            "json_schema": INTERPRETATION_SCHEMA,
        },
    }

    result = await run_cf_model(CF_TEXT_MODEL, payload)
    raw_text = extract_response_text(result)

    try:
        return parse_model_json(raw_text)
    except ValueError as exc:
        raise ValueError(f"Interpretation model returned unparseable output: {exc}") from exc
