# Development Notes

> **Role standard (app)**: `guest`, `user`, `company`, `content_editor`, `admin`, `master_admin`  
> **Note**: Supabase `anon` (RLS) ≠ app-rollen `guest`. Vi bruker `guest` i app-kode og dokumentasjon. Default i UI: `user?.role ?? 'guest'`.

## Project Status Overview

### Current Focus
- **Authentication Module Refactoring**: Bedre type-sikkerhet og separasjon av ansvar
- **Service Selection Module**: Interaktiv tjeneste-/behovsvelger for konvertering
- **Role System Implementation**: Konsolidert rundt **kanoniske app-roller** (`guest`, `user`, `company`, `content_editor`, `admin`, `master_admin`) + persona-svitsj

### Recently Completed
- Refaktorert `useAuth` i mindre, testbare biter
- Implementert Service Selection-komponenter (responsivt grid)
- Aktivert lead-innsending for **gjester (guest)** og preferanse-lagring for innloggede
- Rettet build-feil relatert til auth-typer
- **Phase 0 roller**: repo-wide normalisering `anonymous → guest`, `member → user`
- Forbedret `company`-rolle (rettigheter + tester)

## Module Development Status

### 1. Authentication Module

#### Completed
- ✅ Refaktor av `useAuth` i fokuserte hooks
- ✅ Strammet opp typer på tvers av auth-komponenter
- ✅ Forbedret feil-/loading-håndtering
- ✅ Rollebasert tilgangskontroll
- ✅ Skille mellom **guest** og autentiserte brukere
- ✅ Profilhåndtering med tydelig feilmeldinger
- ✅ Kanoniske app-roller: `guest`, `user`, `company`, `content_editor`, `admin`, `master_admin`
- ✅ `company`-rolle med riktige tillatelser og kobling til `company_profiles`

#### In Progress
- 🔄 Sluttføre type-herding i auth-komponenter
- 🔄 Migrere resterende kall til nye hooks

### 2. Lead Management System

#### Completed
- ✅ Lead-innstillinger og distribusjon
  - `processLeadSettings` respekterer innstillinger
  - Global pause
  - Filtrering på kategorier
  - UI for selskap til å se/endre innstillinger
  - Bedre feilhåndtering + toasts

- ✅ Company UI
  - Oppdatert CompanyLeadsPage (faner: leads/innstillinger)
  - `CompanyLeadSettings` (pause/resume, strategi, budsjett)
  - Viser aktiv distribusjonsstrategi og budsjetter

- ✅ Rapporter (admin)
  - Status-/kategori-fordeling
  - Tidsserie siste 30 dager
  - RBAC på plass

#### In Progress
- 🔄 Optimalisering av distribusjonsalgoritme
- 🔄 Dypere integrasjon mot Service Selection i lead-skjema

### 3. Service Selection Module

#### Completed
- ✅ Kjernekomponenter:
  - `ServiceSelectorGrid`, `StepProgressBar`, `StepNavigationButtons`, `OfferCountBadge`
- ✅ Flyt:
  - Multi-steg (valg → kontekst → kontakt)
  - Egen path for **guest** vs. innlogget
  - Responsivt design

#### In Progress
- 🔄 Integrasjon med lead-systemet (datamodell + validering)
- 🔄 Flere felt i steg 2 for bedre kvalifisering

### 4. Property Management Module

#### Completed
- ✅ Eiendomsoversikt og detaljer
- ✅ Opprettelse og administrasjon
- ✅ Dokument- og kostnadssporing
- ✅ Overføring av eiendom

### 5. Content Management Module

#### Completed
- ✅ Datamodell
- ✅ API-utilities (load/save/delete)
- ✅ Editor med validering
- ✅ RBAC for innhold
- ✅ Dashbord med filter/søk
- ✅ Planlagt publisering (`published_at`)

## Role System (app)

1. **Guest** (`guest`)
   - Uinnlogget besøkende
   - Tilgang: forside, login/register, offentlige sider, lead-innsending (om aktivert)
   - Omdirigeres til login ved forsøk på beskyttet innhold

2. **User** (`user`)
   - Privat kunde/boligeier
   - Tilgang: dashboard, profil, egne leads, eiendom, vedlikehold, konto
   - Kan sende inn og følge egne leads
   - Ingen admin- eller company-spesifikke moduler

3. **Company** (`company`)
   - Bedriftsbruker som mottar/behandler leads
   - Tilgang: dashboard, profil, company-innstillinger, leads, rapporter
   - Kan konfigurere preferanser for distribusjon
   - Mottar leads iht. regler/innstillinger

4. **Content Editor** (`content_editor`)
   - Redaktør/innholdsforvalter
   - Tilgang: innholdsmodul, planlegging/publisering
   - Ingen system-/brukeradministrasjon

5. **Admin** (`admin`)
   - Systemadministrator
   - Tilgang: alle bruker- og company-funksjoner + admin-panel, innhold, systeminnstillinger
   - Kan administrere brukere, leads og konfigurasjon

6. **Master Admin** (`master_admin`)
   - Full tilgang / eier
   - Tilgang: alt, inkl. rolle-tildelinger (grants) og system-ops

### Company Role Implementation (oppsummering)

- Company-brukere ser og jobber med egne leads (tildelt av systemet)
- Kan styre distribusjons- og budsjettpreferanser
- Knyttet til `company_profiles` (metadata for selskap)
- Kan se egne rapporter
- Har **ikke** tilgang til user-spesifikke funksjoner (f.eks. eiendom)
- Har **ikke** admin-funksjoner

#### Company Registration Process

1. Registrerer “bedrift”
2. Bruker opprettes med `role='company'`
3. `company_profiles` rad opprettes
4. `user_profiles.company_id` settes
5. Redirect til selskapets dashboard

### Access Control

- Ruter beskyttes med rolle-guards
- `canAccessModule`/navConfig styrer UI for role/persona
- Redirects hindrer uautorisert bruk

## Persona Switching (kort)

- Bruker har **grunnrolle** (f.eks. `user`) og kan få **tildelte roller** via `role_grants` (f.eks. `admin`)
- UI-svitsj i header/profil for å bytte **aktiv kontekst** (privat vs. tildelt)
- Backend håndhever fortsatt tilgang via RLS/policies

docs(dev-notes): align with canonical app roles (guest,user,company,content_editor,admin,master_admin)
