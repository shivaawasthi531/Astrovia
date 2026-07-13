"""
Shared Cloudflare Workers AI HTTP helpers used by vision + text services.
"""
import json
from typing import Any, Dict, Optional

import httpx

from app.core.config import settings

CF_API_BASE = "https://api.cloudflare.com/client/v4/accounts"


def _cf_headers() -> Dict[str, str]:
    if not settings.CLOUDFLARE_ACCOUNT_ID or not settings.CLOUDFLARE_API_TOKEN:
        raise ValueError(
            "Cloudflare credentials missing. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env"
        )
    return {"Authorization": f"Bearer {settings.CLOUDFLARE_API_TOKEN}"}


def _cf_url(model: str) -> str:
    return f"{CF_API_BASE}/{settings.CLOUDFLARE_ACCOUNT_ID}/ai/run/{model}"


def parse_model_json(raw: Any) -> Dict:
    """Parse model output that may be JSON, Python dict repr, or prose with JSON."""
    if isinstance(raw, dict):
        return raw

    text = str(raw).strip()
    if not text:
        raise ValueError("Workers AI returned an empty response")

    # Strip optional markdown fences
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    # Try direct JSON first
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    # Extract outermost {...} block from mixed prose/JSON responses
    try:
        start = text.index("{")
        end = text.rindex("}") + 1
        parsed = json.loads(text[start:end])
        if isinstance(parsed, dict):
            return parsed
    except (ValueError, json.JSONDecodeError):
        pass

    # Some models return single-quoted Python dict strings
    try:
        import ast

        parsed = ast.literal_eval(text)
        if isinstance(parsed, dict):
            return parsed
    except (SyntaxError, ValueError):
        pass

    raise ValueError(f"Workers AI returned unparseable output. Raw: {text[:500]}")


async def run_cf_model(model: str, payload: Dict, timeout: float = 120.0) -> Dict:
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(_cf_url(model), headers=_cf_headers(), json=payload)

    if resp.status_code >= 400:
        detail = resp.text[:500]
        raise ValueError(f"Workers AI request failed ({resp.status_code}): {detail}")

    body = resp.json()
    if not body.get("success", True):
        errors = body.get("errors") or body
        raise ValueError(f"Workers AI error: {errors}")

    result = body.get("result")
    if isinstance(result, dict):
        return result
    if isinstance(result, str):
        return {"response": result}
    raise ValueError(f"Unexpected Workers AI response shape: {body!r}")


def extract_response_text(result: Dict) -> Any:
    return result.get("response", result)
