from fastapi import APIRouter, Request, Query
from app.deps.auth import require_admin
from app.db import fetchall

router = APIRouter()

@router.get("/leads")
async def list_leads(
    request: Request,
    status: str | None = Query(None, description="Filter by lead status"),
    category: str | None = Query(None, description="Filter by lead category"),
    limit: int = Query(50, le=100, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip")
):
    """List leads with optional filtering - Admin only (read-only)"""
    require_admin(request.state.role)
    
    sql = """
        SELECT 
            l.id, 
            l.title,
            l.category,
            l.status,
            l.company_id,
            l.submitted_by,
            l.customer_email,
            l.customer_name,
            l.lead_type,
            l.created_at, 
            l.updated_at,
            cp.name as company_name
        FROM leads l
        LEFT JOIN company_profiles cp ON l.company_id = cp.id
        WHERE 
            ($1::text IS NULL OR l.status::text = $1) AND
            ($2::text IS NULL OR l.category = $2)
        ORDER BY l.created_at DESC
        LIMIT $3 OFFSET $4
    """
    
    leads = await fetchall(sql, status, category, limit, offset)
    return {
        "leads": leads,
        "count": len(leads),
        "limit": limit,
        "offset": offset
    }