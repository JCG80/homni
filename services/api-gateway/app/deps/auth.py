import httpx
import jwt
import time
from fastapi import Request, HTTPException
from app.config import get_settings

settings = get_settings()
_jwks_cache = {"keys": [], "exp": 0}

async def _get_jwks():
    now = int(time.time())
    if now < _jwks_cache["exp"]:
        return _jwks_cache["keys"]
    
    async with httpx.AsyncClient(timeout=5) as client:
        try:
            resp = await client.get(str(settings.SUPABASE_JWKS_URL))
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch JWKS: {e}")
    
    _jwks_cache["keys"] = data["keys"]
    _jwks_cache["exp"] = now + 3600
    return data["keys"]

def _decode_with_jwks(token: str, jwks):
    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        key = next((k for k in jwks if k["kid"] == kid), None)
        if not key:
            raise HTTPException(status_code=401, detail="Invalid token (kid not found)")
        
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
        return jwt.decode(token, public_key, algorithms=["RS256"], options={"verify_aud": False})
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

async def auth_middleware(request: Request, call_next):
    # Skip auth for health endpoint
    if request.url.path in ("/v1/health",):
        return await call_next(request)

    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = auth.split(" ", 1)[1]
    jwks = await _get_jwks()
    payload = _decode_with_jwks(token, jwks)

    # Extract user info from Supabase JWT
    request.state.user_id = payload.get("sub")
    request.state.role = (payload.get("role") or payload.get("user_role") or "").lower()
    request.state.email = payload.get("email", "")
    
    return await call_next(request)

def require_admin(role: str):
    if role not in ("admin", "master_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")