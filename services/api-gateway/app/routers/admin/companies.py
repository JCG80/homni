from fastapi import APIRouter, Request, Query
from app.deps.auth import require_admin
from app.db import fetchall

router = APIRouter()

@router.get("/companies")
async def list_companies(
    request: Request,
    limit: int = Query(50, le=100, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    status: str | None = Query(None, description="Filter by company status")
):
    """List companies with optional filtering - Admin only"""
    require_admin(request.state.role)
    
    sql = """
        SELECT 
            cp.id, 
            cp.name as display_name, 
            cp.email,
            cp.status,
            cp.industry,
            cp.current_budget,
            cp.daily_budget,
            cp.auto_accept_leads,
            cp.created_at, 
            cp.updated_at
        FROM company_profiles cp
        WHERE ($1::text IS NULL OR cp.status = $1)
        ORDER BY cp.created_at DESC
        LIMIT $2 OFFSET $3
    """
    
    companies = await fetchall(sql, status, limit, offset)
    return {
        "companies": companies,
        "count": len(companies),
        "limit": limit,
        "offset": offset
    }