from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Resume Screening System"
    secret_key: str = Field("change-me-in-production", alias="SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(60 * 24, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    mongodb_uri: str = Field("mongodb://localhost:27017", alias="MONGODB_URI")
    mongodb_db_name: str = Field("resume_screening", alias="MONGODB_DB_NAME")
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    cors_origins_raw: str = Field("http://localhost:5173,http://127.0.0.1:5173", alias="CORS_ORIGINS")
    upload_dir: str = Field("backend/uploads", alias="UPLOAD_DIR")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
