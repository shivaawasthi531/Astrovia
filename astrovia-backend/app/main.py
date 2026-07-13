"""
FastAPI application entrypoint.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.base import Base
from app.db.session import engine

app = FastAPI(
    title="Astrovia API",
    description="AI-powered palm analysis + Vedic Kundli backend",
    version="1.0.0",
)

# In development, allow all origins so Expo Go on a physical device can connect
# regardless of which dynamic IP/port Expo assigns. Production uses the explicit list.
_cors_origins = ["*"] if settings.ENVIRONMENT == "development" else settings.cors_origins_list

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=_cors_origins != ["*"],  # credentials not allowed with wildcard
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
def on_startup():
    # For local dev convenience. In production, use Alembic migrations
    # instead (`alembic upgrade head`) rather than create_all.
    if settings.ENVIRONMENT == "development":
        Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"status": "ok", "service": "astrovia-api"}


@app.get("/health")
def health():
    return {"status": "healthy"}