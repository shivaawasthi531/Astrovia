"""
Centralized app configuration. All environment-dependent values live here —
never hardcode secrets or URLs elsewhere in the codebase.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql://user:password@localhost:5432/astrovia"

    SECRET_KEY: str = "insecure-dev-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    GEMINI_API_KEY: str = ""
    GEMINI_VISION_MODEL: str = "gemini-1.5-flash"
    GEMINI_TEXT_MODEL: str = "gemini-1.5-pro"
    CLOUDFLARE_ACCOUNT_ID: str = ""
    CLOUDFLARE_API_TOKEN: str = ""

    PROKERALA_CLIENT_ID: str = ""
    PROKERALA_CLIENT_SECRET: str = ""
    PROKERALA_BASE_URL: str = "https://api.prokerala.com"

    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:8081"
    FAISS_INDEX_PATH: str = "./faiss_store/palm_index.faiss"
    FAISS_META_PATH: str = "./faiss_store/palm_meta.json"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()