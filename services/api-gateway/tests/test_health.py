import pytest

@pytest.mark.anyio
async def test_health(client):
    """Test health endpoint is accessible without authentication"""
    response = await client.get("/v1/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data
    assert "version" in data