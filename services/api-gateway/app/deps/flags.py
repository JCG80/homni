from app.db import fetchval

async def ensure_api_enabled() -> bool:
    """Check if the API gateway is enabled via feature flags"""
    try:
        val = await fetchval(
            "SELECT is_enabled FROM feature_flags WHERE name = $1 LIMIT 1",
            "api_gateway"
        )
        return bool(val)
    except Exception:
        # If feature flag check fails, default to enabled for development
        return True