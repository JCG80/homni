import hmac
import hashlib
from fastapi import APIRouter, Header, HTTPException, Request
from app.config import get_settings

router = APIRouter()
settings = get_settings()

def _verify_signature(raw_body: bytes, signature: str) -> bool:
    """Verify HMAC signature for webhook security"""
    try:
        expected_signature = hmac.new(
            settings.HMAC_OUTBOUND_SECRET.encode(), 
            msg=raw_body, 
            digestmod=hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected_signature, signature)
    except Exception:
        return False

@router.post("/webhooks/{partner}")
async def receive_webhook(request: Request, partner: str, x_signature: str = Header(None)):
    """Receive and verify webhooks from external partners"""
    raw_body = await request.body()
    
    if not x_signature or not _verify_signature(raw_body, x_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # TODO: Process webhook payload - can be extended with queue system
    return {"received": True, "partner": partner}