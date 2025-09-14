# Forbedret Environment & Migration Guide

## 🚨 Kritiske Miljøvariabel-regler

### 1. Vite Frontend (React komponenter)
```typescript
// ✅ RIKTIG - Vite krever import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

// ❌ FEIL - Dette fungerer IKKE i Vite
const supabaseUrl = process.env.VITE_SUPABASE_URL; // undefined
```

### 2. Node.js (Test-filer, scripts, edge functions)
```typescript
// ✅ RIKTIG - Node.js bruker process.env
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const databaseUrl = process.env.DATABASE_URL;

// ❌ FEIL - import.meta.env finnes ikke i Node.js
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // SyntaxError
```

## 🔄 Korrekte Rollback-kommandoer

### Database Migration Rollback
```bash
# ✅ RIKTIG - Liste migreringer først
supabase migration list --db-url $DATABASE_URL

# ✅ RIKTIG - Rull tilbake til siste reset-punkt
supabase db reset --db-url $DATABASE_URL

# ✅ RIKTIG - Rull tilbake til spesifikk migrering
supabase db reset --to 20250519_add_feature_modules --db-url $DATABASE_URL

# ❌ FEIL - Denne kommandoen fungerer ikke som forventet
# supabase migration down --db-url $DATABASE_URL -n 1
```

## 💾 Database Restore (Korrekt syntaks)

### Backup-strategi
```bash
# Lag backup før migrering
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Eller med supabase CLI
supabase db dump --db-url $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Restore fra backup
```bash
# ✅ RIKTIG - Bruk psql for restore
psql $DATABASE_URL < backup_20250519.sql

# ✅ RIKTIG - Med pg_restore hvis det er et binært dump
pg_restore --verbose --clean --no-acl --no-owner -h hostname -U username -d database_name backup_file.dump

# ❌ FEIL - Denne kommandoen finnes ikke
# supabase db restore --db-url $DATABASE_URL
```

## 🧪 Forbedret CI/CD Testing

### Post-Migration Validering
```yaml
- name: Multi-Role Authentication Testing
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: |
    echo "🧪 Testing login for different roles..."
    
    # Test anonymous access
    npm run test:auth -- --grep "anonymous user"
    
    # Test regular user access
    npm run test:auth -- --grep "regular user"
    
    # Test company user access
    npm run test:auth -- --grep "company user"
    
    # Test admin access
    npm run test:auth -- --grep "admin user"
    
    # Test master admin access
    npm run test:auth -- --grep "master admin"

- name: Module Visibility Testing
  run: |
    echo "🔍 Testing module visibility per role..."
    
    # Test that users only see modules they have access to
    npm run test:modules -- --grep "module visibility"
    
    # Test feature flag enforcement
    npm run test:features -- --grep "feature flag access"

- name: RLS Policy Validation
  run: |
    echo "🔒 Validating RLS policies..."
    
    # Run RLS linter
    npm run guard:rls
    
    # Test data isolation
    npm run test:rls -- --grep "data isolation"
    
    # Check for anonymous access violations
    npm run security:check-anonymous-access
```

## 🔐 Sikkerhet og RLS Validering

### Obligatorisk sikkerhetssjekk etter migrering
```bash
# 1. Kjør RLS linter
npm run guard:rls

# 2. Test innlogging for alle roller
npm run test:auth

# 3. Verifiser modultilgang
npm run test:modules

# 4. Sjekk for sensitive data-eksponering
npm run security:audit

# 5. Valider at anonyme brukere ikke har tilgang til admin-data
npm run security:check-anonymous-access
```

### Sikkerhet-sjekkliste etter migrering
- [ ] RLS policies aktivert på alle tabeller med brukerdata
- [ ] Ingen anonyme policies på admin/sensitive tabeller
- [ ] Feature flags fungerer som forventet
- [ ] Roller og tilganger validert
- [ ] Ingen hardkodede credentials i kode
- [ ] Database-funksjoner bruker `SECURITY DEFINER` hvor nødvendig

## 📊 TypeScript Type-generering

### Miljøvariabel-basert type-generering
```bash
# ✅ RIKTIG - Bruk miljøvariabel
export VITE_SUPABASE_PROJECT_ID=kkazhcihooovsuwravhs
npm run types:generate

# Eller direkte
npx supabase gen types typescript --project-id ${VITE_SUPABASE_PROJECT_ID:-kkazhcihooovsuwravhs} > src/integrations/supabase/types.ts

# ❌ FEIL - Hardkodet project ID
# npx supabase gen types typescript --project-id kkazhcihooovsuwravhs
```

### Automatisk type-generering i CI/CD
```yaml
- name: Generate Supabase Types
  run: |
    # Bruk miljøvariabel i stedet for hardkodet verdi
    npx supabase gen types typescript --project-id $VITE_SUPABASE_PROJECT_ID > src/integrations/supabase/types.ts
  env:
    VITE_SUPABASE_PROJECT_ID: ${{ secrets.VITE_SUPABASE_PROJECT_ID }}
```

## 🚨 Emergency Procedures

### Produksjon Rollback (EMERGENCY)
```bash
# 1. Stopp trafikk til applikasjonen
# 2. Kjør emergency rollback
supabase db reset --to LAST_KNOWN_GOOD_MIGRATION --db-url $PROD_DATABASE_URL

# 3. Restore fra backup hvis nødvendig
psql $PROD_DATABASE_URL < emergency_backup.sql

# 4. Restart applikasjonen
# 5. Verifiser at alt fungerer
```

### Incident Response for Sikkerhetsproblemer
```bash
# 1. Umiddelbar assessment
npm run security:audit

# 2. Sjekk RLS policies
npm run guard:rls

# 3. Valider at ingen sensitive data er eksponert
npm run security:check-exposure

# 4. Hvis alvorlig: Rull tilbake umiddelbart
supabase db reset --to LAST_SECURE_STATE --db-url $DATABASE_URL
```

## 📝 Sjekkliste for Produksjon

### Pre-deployment (Staging)
- [ ] Alle migreringer testet i staging
- [ ] RLS policies validert
- [ ] Multi-rolle testing fullført
- [ ] Rollback-prosedyre testet
- [ ] Backup tatt og verifisert
- [ ] Security audit passert

### Post-deployment (Produksjon)
- [ ] Smoke tests kjørt
- [ ] RLS linter kjørt
- [ ] Monitoring aktivert
- [ ] Rollback-plan klar
- [ ] Team informert om endringer

## 🔍 Hvor finne Project ID

Project ID finnes i:
1. **Supabase Dashboard URL**: `https://supabase.com/dashboard/project/[PROJECT_ID]`
2. **API Settings**: Project Settings → API → Project URL
3. **Miljøvariabel**: `VITE_SUPABASE_PROJECT_ID`
4. **Git**: Sjekk `.env.example` eller eksisterende konfigurasjon

## 📖 Troubleshooting

### "Cannot read property of undefined" errors
```bash
# Årsak: Bruker process.env i Vite frontend
# Løsning: Bytt til import.meta.env

# Før (feil):
const url = process.env.VITE_SUPABASE_URL; // undefined

# Etter (riktig):
const url = import.meta.env.VITE_SUPABASE_URL; // fungerer
```

### Migration rollback feil
```bash
# Hvis du får feil med "migration down":
# Bruk reset i stedet:
supabase db reset --db-url $DATABASE_URL

# For spesifikk migrering:
supabase migration list --db-url $DATABASE_URL
supabase db reset --to MIGRATION_NAME --db-url $DATABASE_URL
```

---

**Denne guiden er oppdatert per september 2025 og reflekterer faktiske Supabase CLI-kommandoer.**