# Environment Configuration Guide

This document outlines the standardized environment variable configuration for the Homni platform.

## Required Environment Variables

### Frontend (Vite)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://kkazhcihooovsuwravhs.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Backend Services
```bash
# Database Connection
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres

# Supabase Integration
SUPABASE_URL=https://kkazhcihooovsuwravhs.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_JWKS_URL=https://kkazhcihooovsuwravhs.supabase.co/.well-known/jwks_public

# API Gateway
CORS_ALLOW_ORIGINS=http://localhost:5173,http://localhost:3000
API_RATE_LIMIT_PER_MIN=120
HMAC_OUTBOUND_SECRET=your-hmac-secret-here
```

## Configuration Files

### Local Development
- `.env` - Main environment file (not committed)
- `.env.example` - Template with default values
- `.env.local.example` - Supabase Edge Functions environment

### CI/CD
GitHub Actions requires these secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `SUPABASE_ACCESS_TOKEN` (for CLI operations)

## Validation Scripts

### Environment Validation
```bash
npm run validate:env
```
Checks all required environment variables are set and properly formatted.

### Connection Health Check
```bash
npm run health:connections
```
Tests actual connectivity to Supabase and validates service configurations.

### Auth Synchronization Check
```bash
npm run check:auth-sync
```
Validates user profile consistency and role mappings.

## Service-Specific Configuration

### API Gateway (`services/api-gateway/`)
- Uses environment variables for all external connections
- Docker Compose configured with fallback defaults
- Supports both development and production environments

### Frontend (`src/`)
- Supabase client uses environment variables with fallbacks
- Graceful error handling for missing configuration
- Development diagnostics available

## Migration from Legacy Configuration

If you're updating from the old configuration:

1. **Environment Variables:**
   - `VITE_SUPABASE_PUBLISHABLE_KEY` → `VITE_SUPABASE_ANON_KEY`
   - Add missing `DATABASE_URL` for backend services

2. **GitHub Actions:**
   - Update all workflow files to use new secret names
   - Add missing environment variables to CI steps

3. **Hardcoded Values:**
   - All hardcoded URLs have been replaced with environment variables
   - Fallback values provided for development environments

## Troubleshooting

### Common Issues

1. **Missing Environment Variables:**
   ```bash
   npm run validate:env
   ```

2. **Connection Issues:**
   ```bash
   npm run health:connections
   ```

3. **Auth Profile Mismatches:**
   ```bash
   npm run check:auth-sync
   ```

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=true
```

## Security Considerations

- Never commit actual credentials to version control
- Use different keys for development, staging, and production
- Rotate secrets regularly
- Monitor for leaked credentials in logs

## Development Workflow

1. Copy `.env.example` to `.env`
2. Fill in actual values for your environment
3. Run validation: `npm run validate:env`
4. Test connections: `npm run health:connections`
5. Start development: `npm run dev`

## Production Deployment

1. Set all required environment variables in your hosting platform
2. Run health checks as part of deployment pipeline
3. Monitor connection health continuously
4. Have rollback procedures for configuration changes