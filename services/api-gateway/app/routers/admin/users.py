from fastapi import APIRouter, Request, Query
from app.deps.auth import require_admin
from app.db import fetchall

router = APIRouter()

@router.get("/users")
async def list_users(
    request: Request,
    q: str | None = Query(None, description="Search query for user names"),
    limit: int = Query(50, le=100, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip")
):
    """List users with optional search filtering - Admin only"""
    require_admin(request.state.role)
    
    sql = """
        SELECT 
            up.id, 
            up.user_id, 
            up.full_name as display_name, 
            up.role, 
            up.company_id, 
            up.email,
            up.created_at, 
            up.updated_at,
            up.metadata->>'account_type' as account_type
        FROM user_profiles up
        WHERE ($1::text IS NULL OR up.full_name ILIKE '%'||$1||'%' OR up.email ILIKE '%'||$1||'%')
        ORDER BY up.created_at DESC
        LIMIT $2 OFFSET $3
    """
    
    users = await fetchall(sql, q, limit, offset)
    return {
        "users": users,
        "count": len(users),
        "limit": limit,
        "offset": offset
    }