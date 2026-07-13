"""
Small helpers for validating and normalizing uploaded palm images before
they're sent to Gemini Vision.
"""
from io import BytesIO
from PIL import Image

MAX_DIMENSION = 1600
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


def validate_image(content_type: str, file_size: int, max_size_mb: int = 10) -> None:
    normalized = (content_type or "").split(";")[0].strip().lower()
    if normalized not in ALLOWED_CONTENT_TYPES:
        raise ValueError(f"Unsupported image type: {content_type!r}")
    if file_size > max_size_mb * 1024 * 1024:
        raise ValueError(f"Image exceeds {max_size_mb}MB limit")


def resize_if_needed(image_bytes: bytes) -> bytes:
    """Downscales large images to keep Gemini requests fast/cheap."""
    img = Image.open(BytesIO(image_bytes))
    img = img.convert("RGB")

    if max(img.size) > MAX_DIMENSION:
        img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=88)
    return buffer.getvalue()