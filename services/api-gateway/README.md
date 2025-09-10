# Homni API Gateway

FastAPI-based API Gateway for the Homni Platform, providing secure access to admin and public endpoints with JWT authentication and feature flag management.

## Features

- 🔐 **JWT Authentication**: Supabase JWT validation with JWKS
- 🛡️ **Role-Based Access Control**: Admin/Master Admin access controls
- 🚀 **Feature Flags**: API access controlled by feature flags
- 📊 **Admin Endpoints**: User, company, and lead management
- 🔒 **Security**: CORS, rate limiting, HMAC webhook verification
- 🐳 **Docker Support**: Containerized deployment
- 📖 **OpenAPI Docs**: Automatic API documentation generation

## Quick Start

### Development Setup

1. **Install dependencies:**
   ```bash
   cd services/api-gateway
   make install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Run the development server:**
   ```bash
   make dev
   ```

4. **Access the API:**
   - Health: http://localhost:8080/v1/health
   - Docs: http://localhost:8080/docs
   - Admin endpoints: http://localhost:8080/v1/admin/*

### Docker Deployment

```bash
make docker-build
make docker-run
```

## API Endpoints

### Public Endpoints
- `GET /v1/health` - Health check (no auth required)
- `POST /v1/webhooks/{partner}` - Webhook receiver (HMAC verified)

### Admin Endpoints (Requires admin/master_admin role)
- `GET /v1/admin/users` - List users with search
- `GET /v1/admin/companies` - List companies  
- `GET /v1/admin/leads` - List leads (read-only)

## Authentication

The API uses Supabase JWT tokens for authentication:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8080/v1/admin/users
```

## Configuration

Key environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_JWKS_URL` - Supabase JWKS endpoint
- `CORS_ALLOW_ORIGINS` - Comma-separated allowed origins
- `HMAC_OUTBOUND_SECRET` - Secret for webhook verification

## Development

```bash
# Run tests
make test

# Lint code  
make lint

# Format code
make format

# Export OpenAPI spec
make openapi
```

## Architecture

- **FastAPI Application**: Modern async Python web framework
- **JWT Validation**: Supabase JWKS-based token verification  
- **Database Access**: SQLAlchemy async with existing Supabase schema
- **Feature Flags**: Database-driven API access control
- **Security**: CORS, rate limiting, signature verification