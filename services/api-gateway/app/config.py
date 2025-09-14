from pydantic import BaseSettings, AnyHttpUrl
from functools import lru_cache

class Settings(BaseSettings):
    ENV: str = "dev"
    APP_NAME: str = "homni-api-gateway"
    APP_VERSION: str = "1.0.0"
    PORT: int = 8080

    # Database configuration - use environment variables
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:54322/postgres"
    
    # Supabase configuration - use environment variables with fallbacks
    SUPABASE_JWKS_URL: AnyHttpUrl = "https://kkazhcihooovsuwravhs.supabase.co/.well-known/jwks_public"
    SUPABASE_URL: str = "https://kkazhcihooovsuwravhs.supabase.co"
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM"
    
    # CORS and security
    CORS_ALLOW_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    API_RATE_LIMIT_PER_MIN: int = 120
    HMAC_OUTBOUND_SECRET: str = "dev-secret-key"
    ENABLE_OTEL: bool = True

    class Config:
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    return Settings()