"""
Aggregates all v1 route modules under a single router, mounted in main.py.
"""
from fastapi import APIRouter

from app.api.v1.routes import auth, palm, kundli, history

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(palm.router)
api_router.include_router(kundli.router)
api_router.include_router(history.router)