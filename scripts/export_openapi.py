#!/usr/bin/env python3
"""
Export OpenAPI specification from FastAPI app to YAML
"""
import sys
import os
import yaml
from pathlib import Path

# Add the API gateway to Python path
api_gateway_path = Path(__file__).parent.parent / "services" / "api-gateway"
sys.path.insert(0, str(api_gateway_path))

try:
    from app.main import app
    from fastapi.openapi.utils import get_openapi
    
    # Generate OpenAPI spec
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Ensure docs/api directory exists
    docs_dir = Path(__file__).parent.parent / "docs" / "api"
    docs_dir.mkdir(parents=True, exist_ok=True)
    
    # Write OpenAPI spec to YAML
    output_path = docs_dir / "openapi.yaml"
    with open(output_path, "w", encoding="utf-8") as f:
        yaml.safe_dump(openapi_schema, f, sort_keys=False, allow_unicode=True)
    
    print(f"✅ OpenAPI specification exported to {output_path}")
    
except ImportError as e:
    print(f"❌ Failed to import API Gateway app: {e}")
    print("Make sure you're running from the project root and dependencies are installed")
    sys.exit(1)
except Exception as e:
    print(f"❌ Failed to export OpenAPI spec: {e}")
    sys.exit(1)