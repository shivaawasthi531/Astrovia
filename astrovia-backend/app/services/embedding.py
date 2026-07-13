"""
Converts palm line coordinates into a fixed-length numeric vector so FAISS
can compare palms by shape similarity. Uses a simple, deterministic
resample-and-flatten approach (no external embedding model needed for this
lightweight use case).
"""
import numpy as np
from typing import Dict, List

POINTS_PER_LINE = 16  # resample every line to this many points
LINES = ["heart_line", "head_line", "life_line", "fate_line"]
VECTOR_DIM = POINTS_PER_LINE * 2 * len(LINES)  # x,y per point per line


def _resample_line(points: List[Dict], n: int) -> List[float]:
    """Linearly resample a variable-length polyline to exactly n points."""
    if not points:
        return [0.0] * (n * 2)

    xs = np.array([p["x"] for p in points])
    ys = np.array([p["y"] for p in points])
    original_idx = np.linspace(0, 1, num=len(points))
    target_idx = np.linspace(0, 1, num=n)

    xs_r = np.interp(target_idx, original_idx, xs)
    ys_r = np.interp(target_idx, original_idx, ys)

    flat = np.empty(n * 2, dtype=np.float32)
    flat[0::2] = xs_r
    flat[1::2] = ys_r
    return flat.tolist()


def coordinates_to_vector(line_coordinates: Dict) -> np.ndarray:
    """Builds a fixed-length float32 vector from all four lines, concatenated."""
    parts = []
    for line_name in LINES:
        points = line_coordinates.get(line_name) or []
        parts.extend(_resample_line(points, POINTS_PER_LINE))
    return np.array(parts, dtype=np.float32)