
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/69be62cd-58e0-4938-a773-fdd91d87fb4f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/69be62cd-58e0-4938-a773-fdd91d87fb4f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Getting Started

### 🎟️ Authentication System

#### Development Authentication

The application offers two authentication methods for development:

1. **Quick Role-Based Login**
   - Located in the bottom-right corner of the application (in development mode only)
   - Direct buttons for each role: "Login as User", "Login as Company", "Login as Admin", "Login as Master Admin"
   - Automatically logs in with pre-configured test users for each role

2. **Individual Test User Login**
   - Use the "Quick Dev Login" dropdown menu
   - Shows all available test users with their roles
   - Uses password-based authentication with the fixed password "password"

These authentication tools make it simple to test role-specific functionality without manual login, and only work in development mode.

#### Route Protection System

The application uses a protection system for routes:

1. **Routes With `allowAnyAuthenticated`**
   - Accessible to any authenticated user regardless of role
   - Used for test routes and general authenticated features
   - Examples: `/leads/test`, `/leads/my`, `/`

2. **Routes With `allowedRoles`**
   - Require specific user roles to access
   - Redirects to "Unauthorized" page if the user's role is not in the allowed list
   - Example: `/leads/company` requires 'company', 'admin', or 'master-admin' roles

3. **Regular Authenticated Routes**
   - Require any valid authentication 
   - Redirect to login if not authenticated

#### Adding New Test Users

To add new test users to your Supabase database:

```sql
-- Add a new test user
INSERT INTO auth.users (id, email, password, raw_user_meta_data)
VALUES
  (gen_random_uuid(), 'company@test.local', crypt('password','generated_salt'), '{"role":"company"}')
ON CONFLICT DO NOTHING;

-- Add corresponding profile
INSERT INTO user_profiles (id, full_name)
SELECT id, 'Test Company' FROM auth.users WHERE email = 'company@test.local'
ON CONFLICT DO NOTHING;
```

Then add the user to the `TEST_USERS` array in `src/modules/auth/utils/devLogin.ts`:

```typescript
export const TEST_USERS: TestUser[] = [
  // existing users...
  { email: 'company@test.local', role: 'company', name: 'Test Company' }
];
```

#### Troubleshooting Authentication Issues

1. **Quick Dev Login not working**
   - Check that your development environment is properly set up (`import.meta.env.MODE === 'development'`)
   - Verify that the test users in `TEST_USERS` exist in your Supabase database
   - Make sure the 'password' set for test users in `devLogin` matches what's in the database

2. **Unauthorized Access**
   - Check the user's role in the console logs compared to the required roles for the route
   - Verify that `allowAnyAuthenticated` is set correctly for routes that should be accessible to any logged-in user
   - Use the browser developer console to view the authentication flow and role assignments

3. **Role Consistency Issues**
   - Make sure the roles in the code match exactly with the roles in Supabase user metadata
   - Use the console logs to debug what role is being detected for the current user
   - If needed, manually update a user's role in Supabase using the RoleSwitcher component or directly in the database

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/69be62cd-58e0-4938-a773-fdd91d87fb4f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Lead Module Validation

### ✅ LeadsTable Validering

Komponenten er validert mot kravene og inneholder følgende:

- [x] **Komponentregistrering**: `LeadsTable` er korrekt brukt i `AdminLeadsPage.tsx`
- [x] **Status- og kategorifiltrering**: Bruker `LeadsFilterBar` for dynamisk filtrering
- [x] **Tabellvisning**: Viser kolonner for tittel, kategori, status, dato og handlinger
- [x] **Datainnhenting**: Bruker `useLeadList()` med `isLoading`- og feilkontroll
- [x] **Rollebasert tilgang**: Tilgang er begrenset til `admin` via `useAuth()`-sjekk
- [x] **Responsivt design**: Justerer seg etter skjermstørrelse
- [x] **Shadcn UI-komponenter**: For konsistent og moderne utseende
- [x] **Feilhåndtering**: API-feil logges og vises på en brukervennlig måte
- [x] **Rollebaserte handlinger**: Viser eller skjuler handlinger basert på brukerens tillatelser

📌 Sist validert: `2025-05-06 OB`

### ✅ LeadForm Validering

- [x] **Komponentregistrering**: `LeadForm` brukes korrekt for opprettelse/redigering av leads
- [x] **Inputfelter**: Har feltene: tittel, beskrivelse, kategori, (valgfritt: prioritet, provider_id, etc.)
- [x] **Validering**: Bruker skjema-validering for påkrevde felt (f.eks. Zod eller Yup)
- [x] **Mutasjon**: Bruker `insertLead()` eller `mutate()` fra TanStack Query
- [x] **Tilbakemelding**: Viser suksess-/feilmelding med `toast`
- [x] **Responsivitet**: Fungerer på mobil og nettbrett

📌 Sist validert: `2025-05-06 OB`

### ✅ useLeadList Hook Validering

- [x] **Statusavhengig spørring**: Leser og filtrerer leads etter valgt status
- [x] **Cache key**: Bruker TanStack Query med `['leads', status]`
- [x] **Feilhåndtering**: Kaster og logger API-feil eksplisitt
- [x] **Bruksklar**: Kan enkelt brukes i `LeadsTable`, `LeadStats`, m.m.
- [x] **Testet**: Returnerer korrekt datastruktur fra Supabase

📌 Sist validert: `2025-05-06 OB`

### ✅ insertLead() Validering

#### 🔍 Function: insertLead (src/modules/leads/api/leads-api.ts)

- [x] Funksjonen finnes og er eksportert fra leads-api.ts
- [x] Godtar `Partial<Lead>` som inputtype
- [x] Krever følgende felt:
  - [x] title
  - [x] description
  - [x] category
  - [x] status (bruker `LeadStatus`)
  - [x] company_id
  - [x] created_by (eller submitted_by hvis aktuelt)
- [x] Validerer `status` mot `LEAD_STATUSES` enum før insert
- [x] Setter `created_at` automatisk dersom ikke oppgitt
- [x] Returnerer resultatet eller håndterer Supabase-feil korrekt
- [x] Brukes av LeadForm eller andre innsendinger

#### 📌 Testeksempler som skal fungere:
```ts
await insertLead({
  title: 'Ny varmepumpe',
  description: 'Trenger tilbud på luft-til-luft',
  category: 'Elektriker',
  status: 'new',
  company_id: someCompanyId,
  created_by: someUserId
});
```

📌 Sist validert: `2025-05-06 OB`

### 🧪 Lead Tests
- [x] User can create new lead
- [x] Admin can view all leads
- [x] Company can only view assigned leads
- [x] Lead status transitions allowed in correct order
- [x] Test `insertLead()` logic using Supabase and check `required fields`

### 🧪 insertLead() og Supabase RLS-policy Testplan

#### 🔹 Forberedelse
1. Logg inn med bruker som har `user` rolle
2. Identifiser gyldig `company_id` og `user_id` for testing
3. Naviger til Lead Test-siden (/leads/test)

#### 🔹 Test Scenario 1: Opprette lead som vanlig bruker
**Forutsetning:** Innlogget som bruker med `user` rolle
1. Bruk `insertLead()` med eget `user_id` som `submitted_by`
2. **Forventet:** Vellykket innsending, lead opprettes med status `new`
3. **Supabase RLS-test:** Kontroller at brukeren bare kan se sin egen lead

#### 🔹 Test Scenario 2: Rollebasert tilgangskontroll
**Forutsetning:** Brukere med forskjellige roller
1. Logg inn som `admin` - skal kunne se alle leads
2. Logg inn som `company` - skal kun kunne se leads tildelt til sin company_id
3. Logg inn som `user` - skal kun kunne se leads opprettet av brukeren selv

#### 🔹 Test Scenario 3: Valideringstester
1. Test med manglende obligatoriske felter (skal feile)
2. Test med ugyldig status (skal feile eller falle tilbake til standard)
3. Test med valgfrie felter (priority, content) (skal fungere)

#### 🔹 Feilsøking og Verifikasjon
1. Bruk konsolllogger for å bekrefte API-kall og respons
2. Sjekk at RLS-policies fungerer som forventet
3. Verifiser at filtreringsfunksjonaliteten i `useLeadList()` respekterer RLS-begrensninger

📌 Sist oppdatert: `2025-05-06 OB`
