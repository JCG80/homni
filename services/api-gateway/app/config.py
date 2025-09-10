from pydantic import BaseSettings, AnyHttpUrl
from functools import lru_cache

class Settings(BaseSettings):
    ENV: str = "dev"
    APP_NAME: str = "homni-api-gateway"
    APP_VERSION: str = "1.0.0"
    PORT: int = 8080

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:54322/postgres"
    SUPABASE_JWKS_URL: AnyHttpUrl = "https://kkazhcihooovsuwravhs.supabase.co/.well-known/jwks_public"
    CORS_ALLOW_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    API_RATE_LIMIT_PER_MIN: int = 120
    HMAC_OUTBOUND_SECRET: str = "dev-secret-key"
    ENABLE_OTEL: bool = True

    class Config:
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    return Settings()