"""
FAISS-backed similarity search over previously seen palm-line vectors.
Index + metadata are persisted to disk so matches survive a restart.
On Railway's ephemeral filesystem, mount a volume at FAISS_INDEX_PATH's
directory to persist across deploys.
"""
import json
import os
from typing import Optional, Tuple

import faiss
import numpy as np

from app.core.config import settings
from app.services.embedding import VECTOR_DIM


class PalmVectorStore:
    def __init__(self):
        os.makedirs(os.path.dirname(settings.FAISS_INDEX_PATH), exist_ok=True)
        self.index = self._load_or_create_index()
        self.metadata = self._load_metadata()

    def _load_or_create_index(self) -> faiss.Index:
        if os.path.exists(settings.FAISS_INDEX_PATH):
            return faiss.read_index(settings.FAISS_INDEX_PATH)
        # L2 distance flat index — fine for a few thousand vectors; swap for
        # IVF/HNSW if the dataset grows into the millions.
        return faiss.IndexFlatL2(VECTOR_DIM)

    def _load_metadata(self) -> list:
        if os.path.exists(settings.FAISS_META_PATH):
            with open(settings.FAISS_META_PATH, "r") as f:
                return json.load(f)
        return []

    def _persist(self):
        faiss.write_index(self.index, settings.FAISS_INDEX_PATH)
        with open(settings.FAISS_META_PATH, "w") as f:
            json.dump(self.metadata, f)

    def add(self, vector: np.ndarray, reading_id: str):
        self.index.add(vector.reshape(1, -1))
        self.metadata.append({"reading_id": reading_id})
        self._persist()

    def search(self, vector: np.ndarray, k: int = 1) -> Optional[Tuple[str, float]]:
        if self.index.ntotal == 0:
            return None
        distances, indices = self.index.search(vector.reshape(1, -1), k)
        idx = int(indices[0][0])
        if idx == -1 or idx >= len(self.metadata):
            return None
        # Convert L2 distance to a rough 0-1 similarity score for display
        distance = float(distances[0][0])
        similarity = 1.0 / (1.0 + distance)
        return self.metadata[idx]["reading_id"], round(similarity, 4)


# Singleton — loaded once at app startup, reused across requests
vector_store = PalmVectorStore()