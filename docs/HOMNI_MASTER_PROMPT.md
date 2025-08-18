# 🏗️ Homni Master Prompt – Single Source of Truth

> **Status:** Kanonisk dokumentasjon for alle AI-assistert utvikling  
> **Versjon:** 2.0  
> **Sist oppdatert:** 18. august 2024

## 🎯 Homni Produktkompass

Homni er en **modulær, rollebasert, AI-klar plattform** som kombinerer:

- **Bytt.no-stil:** Lead-generering + matching + brukeromtaler/rangering
- **Boligmappa.no-stil:** Boligens dokumentasjonsarkiv + vedlikehold/FDV  
- **Propr.no-stil:** DIY salgsflyt (fremtidig modul)

→ **Modulært, ikke monolittisk.** Hver del kan aktiveres/deaktiveres via feature flags.

## 🔐 Kanoniske Roller

```typescript
type UserRole = 
  | 'guest'           // Uautentisert besøkende
  | 'user'            // Standard bruker (privatperson)
  | 'company'         // Bedriftskonto  
  | 'content_editor'  // Innholdsredigering
  | 'admin'           // Administrativ tilgang
  | 'master_admin';   // Full systemtilgang
```

## 🗄️ Unified Data Models

### Core Profiler
```sql
-- UserProfile: Sentralisert brukerprofil
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  display_name TEXT,
  role user_role_enum NOT NULL,
  account_type TEXT DEFAULT 'personal',
  company_id UUID REFERENCES company_profiles(id),
  notification_preferences JSONB DEFAULT '{}',
  ui_preferences JSONB DEFAULT '{}',
  feature_overrides JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ -- GDPR soft delete
);

-- CompanyProfile: Bedriftsprofiler
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  org_number TEXT UNIQUE,
  industry TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### Moduler & Feature Flags
```sql
-- ModuleMetadata: Plugin-system
CREATE TABLE module_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  dependencies TEXT[] DEFAULT '{}',
  feature_flags JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true
);

-- FeatureFlags: Granular kontroll
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0,
  target_roles user_role_enum[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## 🚀 Plugin-Driven Architecture

### Lead-Generation Module (Bytt-stil)
- **Visitor Wizard:** 3-stegs sammenligning → lead
- **Marketplace:** Pakker + auto-kjøp + caps + pipeline
- **Matching:** Leverandør-matching basert på regler

### Documentation Module (Boligmappa-stil)  
- **Property Archive:** Dokumenter knyttet til eiendom
- **Maintenance:** FDV/vedlikehold + kvitteringer
- **History:** Endringer over tid

### DIY Sales Module (Propr-stil)
- **Sales Flow:** Trinn-for-trinn salgsguide
- **Document Generation:** Automatisk salgsdokumentasjon
- **Process Tracking:** Fremdrift og milepæler

## 🔒 Sikkerhet & RLS

### RLS Policies (Standard)
```sql
-- Default Deny + Owner Access
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<table>_owner_full" ON <table>
  USING (user_id = auth.uid());

-- Anon Insert for Leads
CREATE POLICY "leads_anon_insert" ON leads
  FOR INSERT TO anon WITH CHECK (true);
```

### Security Definer Functions
```sql
-- Alle funksjoner MÅ ha:
CREATE OR REPLACE FUNCTION <function_name>()
RETURNS <return_type>
SECURITY DEFINER  -- Kjører med elevated permissions
SET search_path = public  -- Sikrer riktig schema
LANGUAGE plpgsql
AS $$
BEGIN
  -- Function logic
END;
$$;
```

## 🎨 Frontend Standards

### Design System
- **Tailwind + shadcn/ui:** Konsistent design
- **Semantic tokens:** Bruk HSL-variabler fra index.css
- **Dark/Light mode:** Automatisk via next-themes
- **Responsive:** Mobile-first design

### Komponenter
```typescript
// Konsistent komponentstruktur
interface ComponentProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const Component = ({ 
  variant = 'default',
  size = 'md', 
  className,
  children,
  ...props 
}: ComponentProps) => {
  return (
    <div 
      className={cn(
        componentVariants({ variant, size }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
```

## 🧪 Testing & Quality

### Coverage Gates
- **Unit tests:** ≥ 90% coverage
- **Integration tests:** ≥ 80% coverage  
- **E2E tests:** Kritiske brukerflyter
- **Performance:** Bundle ≤ 200KB gzipped

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
- name: Health Check
  run: |
    npm run typecheck
    npm run build  
    npm run test:coverage
    npm run lint
    npm audit --audit-level=high
```

## 🌍 Internationalization & Accessibility

### i18n Structure
```
locales/
├── no/
│   ├── common.json
│   ├── auth.json
│   └── modules/
├── en/
├── se/
└── dk/
```

### A11y Requirements
- **WCAG 2.1 AA:** Minimum standard
- **Keyboard navigation:** Full support
- **Screen readers:** ARIA labels + roles
- **Color contrast:** 4.5:1 minimum

## 📊 Observability

### OpenTelemetry Events
```typescript
// Standard event tracking
analytics.track('visitor_role_selected', { role });
analytics.track('lead_submitted', { role, product });
analytics.track('module_activated', { module, user_id });
```

### Performance Budgets
- **API p95:** ≤ 200ms
- **DB queries p95:** ≤ 100ms  
- **Frontend bundle:** ≤ 200KB gzipped
- **Lighthouse scores:** ≥ 90 (Performance, Best Practices, SEO)

## 🔄 Migration & Rollback Strategy

### Migration Pattern
```sql
-- up.sql
CREATE TABLE new_feature (...);

-- down.sql  
DROP TABLE IF EXISTS new_feature;
```

### Feature Toggle Pattern
```typescript
// Wrap all new features
if (featureFlags.isEnabled('new_feature', user.role)) {
  return <NewFeature />;
}
return <LegacyFeature />;
```

## 📋 Definition of Done

### For alle endringer:
- [ ] **Repo-wide sweep** gjennomført
- [ ] `npm run repo:health` grønt
- [ ] Zero duplikater/TS-feil
- [ ] RLS policies verifisert
- [ ] Tests ≥ terskler
- [ ] Docs oppdatert
- [ ] PROMPT_LOG.md oppdatert med Guardian-status

### For nye moduler:
- [ ] Feature flag implementert
- [ ] Migration med rollback  
- [ ] E2E test for hovedflyt
- [ ] README i modulmappe
- [ ] OpenTelemetry events

---

**📞 For AI-assistenter:** Referer alltid til denne filen som autoritativ kilde. Ved konflikt med andre prompter, prioriter dette dokumentet.