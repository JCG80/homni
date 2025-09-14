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

### Extended Testing and Validation

#### Multi-Role Testing
Test appen med ulike brukerroller for å sikre korrekt tilgangskontroll:

```bash
# Test som admin
npm run test:e2e -- --grep "admin"

# Test som vanlig bruker  
npm run test:e2e -- --grep "user"

# Test som anonym bruker
npm run test:e2e -- --grep "anonymous"
```

#### RLS Policy Testing
```bash
# Kjør Supabase linter for å sjekke RLS policies
npx supabase db lint

# Test RLS policies manuelt
npx supabase db test
```

#### Feature Flag Validation
```bash
# Sjekk at feature flags fungerer korrekt
npm run validate:feature-flags

# Test modulvisning for ulike roller
npm run test:modules
```

#### End-to-End Validation
1. **Autentisering:** Test innlogging, utlogging, rolle-bytte
2. **Routing:** Test alle ruter med ulike brukerroller
3. **Moduler:** Sjekk at kun tillatte moduler vises
4. **RLS:** Verifiser at brukere kun ser sine egne data

## Service-Specific Configuration

### API Gateway (`services/api-gateway/`)
- Uses environment variables for all external connections
- Docker Compose configured with fallback defaults
- Supports both development and production environments

### Frontend (`src/`)
- Supabase client uses environment variables with fallbacks
- Graceful error handling for missing configuration
- Development diagnostics available

#### Vite og miljøvariabler

**KRITISK:** Hvis du bruker Vite, må du alltid lese miljøvariabler med `import.meta.env` og ikke `process.env`.

```typescript
// ✅ RIKTIG - Vite krever import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ❌ FEIL - Dette fungerer ikke i Vite
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
```

**Vanlige feil med Supabase-klient:**
- Feil miljøvariabel-syntax fører til `undefined` verdier
- Autentisering feiler uten feilmeldinger
- API-kall returnerer "Invalid API key" feil

#### HashRouter for Lovable sandbox

For å unngå 404-feil ved refresh i Lovable preview/sandbox, aktiver HashRouter:

**I Lovable Environment settings:**
```bash
VITE_USE_HASHROUTER=true
```

**Eller legg til i `.env` for lokal utvikling:**
```bash
VITE_USE_HASHROUTER=true
```

**Automatisk deteksjon:**
Appen detekterer automatisk Lovable/sandbox-miljøer og aktiverer HashRouter når:
- Hostname inneholder 'lovable' eller 'sandbox'
- `VITE_USE_HASHROUTER=true` er satt

#### Routing best practices

**Unngå dupliserte ruter:**
- Bruk kun én hovedruter-komponent (`SimpleRouter` eller `App.tsx`)
- Ikke definer samme rute i flere komponenter
- Flytt all routing til én sentral komponent

**Anbefalt struktur:**
```typescript
// App.tsx - Hovedruter (auth, home, fallback)
<Routes>
  <Route path="/auth" element={<AuthPage />} />
  <Route path="/" element={<HomePage />} />
  <Route path="/*" element={<SimpleRouter />} />
</Routes>

// SimpleRouter.tsx - Interne ruter (dashboard, moduler)
<Routes>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

#### Error Boundaries

Legg til error boundaries for å håndtere auth- og routing-feil gracefully:

```typescript
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';

// Wrap kritiske ruter
<Route path="/auth" element={
  <RouteErrorBoundary>
    <AuthPage />
  </RouteErrorBoundary>
} />
```

**Error boundaries forhindrer:**
- Hvit skjerm ved auth-feil
- App-krasj ved routing-problemer
- Tap av brukerdata ved uventede feil

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

#### 1. Vite Environment Variable Issues
```bash
# ❌ Feil: Bruker process.env i stedet for import.meta.env
Error: Cannot read property 'VITE_SUPABASE_URL' of undefined

# ✅ Løsning: Bytt til import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

#### 2. HashRouter 404-feil i Lovable
```bash
# ❌ Problem: Får 404 ved refresh av sider
Cannot GET /dashboard

# ✅ Løsning: Aktiver HashRouter
VITE_USE_HASHROUTER=true
```

#### 3. Dupliserte ruter
```bash
# ❌ Problem: Routing konflikter
Error: Multiple routes match the same path

# ✅ Løsning: Fjern dupliserte ruter
# Bruk kun én hovedruter-komponent
```

#### 4. Auth og RLS-feil
```bash
# Sjekk brukerens rolle og tilganger
npm run check:auth-sync

# Kjør Supabase linter for RLS-problemer
npx supabase db lint

# Test RLS policies
npx supabase db test
```

#### 5. Missing Environment Variables
```bash
npm run validate:env
```

#### 6. Connection Issues
```bash
npm run health:connections
```

#### 7. Auth Profile Mismatches
```bash
npm run check:auth-sync
```

### Advanced Troubleshooting

#### Database Migration Rollback
```bash
# Roll back siste migrering
npx supabase migration down --db-url $DATABASE_URL -n 1

# Roll back til et spesifikt migreringsnummer
npx supabase migration down 20250519_add_feature_modules.sql --db-url $DATABASE_URL

# Liste alle migreringer
npx supabase migration list
```

#### RLS Policy Debugging
```bash
# Kjør linter for å identifisere RLS-problemer
npx supabase db lint

# Se alle aktive policies
npx supabase db dump --schema=public --data-only=false

# Test policies med spesifikk bruker
npx supabase db test --user-id=<uuid>
```

#### Performance og Logging
```bash
# Enable debugging i browser console
localStorage.setItem('debug', 'true');

# Aktivér detaljert logging
DEBUG=true npm run dev

# Sjekk network requests i browser dev tools
# Søk etter auth-feil og API-kall
```

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=true
```

### Emergency Procedures

#### Full Reset (kun i utvikling)
```bash
# 1. Stop alle prosesser
npm run stop

# 2. Reset database til clean state
npx supabase db reset

# 3. Kjør migreringer på nytt
npx supabase migration up

# 4. Seed test data
npm run seed:dev
```

#### Quick Health Check
```bash
# Komplett system-sjekk
npm run validate:env && npm run health:connections && npx supabase db lint
```

## Security Considerations

### Basic Security
- Never commit actual credentials to version control
- Use different keys for development, staging, and production
- Rotate secrets regularly
- Monitor for leaked credentials in logs

### Extended Security Validation

#### RLS Policy Review
Gjennomgå Row Level Security policies regelmessig:

```bash
# Kjør Supabase linter for sikkerhetsjekk
npx supabase db lint

# Identificer tabeller uten RLS
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT IN (
  SELECT tablename FROM pg_policies WHERE schemaname = 'public'
);

# Sjekk at alle policies er aktive
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

#### Common RLS Issues (fra linter)
Typiske advarsler å fikse:
1. **Tabeller uten RLS aktivert** - Ekstremt farlig, tillater ukontrollert tilgang
2. **Altfor åpne policies** - F.eks. `WHERE true` betingelser
3. **Manglende policies** - Ingen INSERT/UPDATE/DELETE policies
4. **Eksponerte sensitive kolonner** - Uten riktig tilgangskontroll

#### Security Audit Checklist
- [ ] Alle tabeller har RLS aktivert (`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`)
- [ ] Policies implementerer riktig tilgangskontroll basert på `auth.uid()`
- [ ] Sensitive data er ikke eksponert til feil brukerroller
- [ ] API-nøkler er ikke hardkodet i klientkoden
- [ ] Environment variabler er korrekt konfigurert i alle miljøer

#### Authentication Security
- Implementer 2FA for admin/master_admin roller
- Bruk sterke passord-policies
- Overvåk mistenkelig innloggingsaktivitet
- Implementer rate limiting på auth endpoints

#### Data Retention og GDPR
- Sett opp automatisk sletting av gamle data
- Implementer "rett til å bli glemt" funksjonalitet  
- Logg alle data-tilganger for audit trails
- Krypter sensitive data i databasen

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