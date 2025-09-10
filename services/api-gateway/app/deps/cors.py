def cors_origins(origins_str: str) -> list[str]:
    """Parse CORS origins from comma-separated string"""
    if not origins_str:
        return ["*"]
    
    return [origin.strip() for origin in origins_str.split(",") if origin.strip()]