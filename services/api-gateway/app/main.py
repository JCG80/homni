from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.deps.logging import setup_logging
from app.deps.cors import cors_origins
from app.routers.public import health, webhooks
from app.routers.admin import users as admin_users, companies as admin_companies, leads as admin_leads
from app.deps.auth import auth_middleware
from app.deps.flags import ensure_api_enabled

settings = get_settings()
app = FastAPI(
    title="Homni API Gateway", 
    version=settings.APP_VERSION,
    description="API Gateway for Homni Platform"
)

# Setup logging
logger = setup_logging(app)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(settings.CORS_ALLOW_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth middleware for all routes except health
app.middleware("http")(auth_middleware)

# Feature flag middleware - protect all routes except health
@app.middleware("http")
async def feature_gate(request: Request, call_next):
    if request.url.path.startswith("/v1") and request.url.path != "/v1/health":
        if not await ensure_api_enabled():
            raise HTTPException(status_code=404, detail="API Gateway not available")
    return await call_next(request)

# Public routes (health is not behind feature flag)
app.include_router(health.router, prefix="/v1", tags=["public"])

# Public webhooks (verified with HMAC in router)
app.include_router(webhooks.router, prefix="/v1", tags=["public:webhooks"])

# Admin routes (RBAC enforced in routers)
app.include_router(admin_users.router, prefix="/v1/admin", tags=["admin:users"])
app.include_router(admin_companies.router, prefix="/v1/admin", tags=["admin:companies"])
app.include_router(admin_leads.router, prefix="/v1/admin", tags=["admin:leads"])

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down API Gateway")