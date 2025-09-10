import pytest

@pytest.mark.anyio
async def test_protected_route_without_auth(client):
    """Test that protected routes require authentication"""
    response = await client.get("/v1/admin/users")
    assert response.status_code == 401
    assert "Bearer token" in response.json()["detail"]

@pytest.mark.anyio  
async def test_protected_route_with_invalid_token(client):
    """Test that invalid tokens are rejected"""
    headers = {"Authorization": "Bearer invalid-token"}
    response = await client.get("/v1/admin/users", headers=headers)
    assert response.status_code == 401