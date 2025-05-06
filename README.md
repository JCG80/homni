
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

