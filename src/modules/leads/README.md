
# 📦 Leads Module – Homni

Modulen for håndtering, distribusjon og oppfølging av leads i Homni-plattformen.
Strukturen er modulbasert og følger prosjektets arkitektur for rollebasert tilgang og fremtidig AI-integrasjon.

---

## 🗂️ Strukturoversikt

```
src/modules/leads/
├── components/           # UI-komponenter (f.eks. LeadTable, StatusBadge)
├── pages/                # Route-baserte sider (f.eks. CompanyLeadsPage)
├── hooks/                # Egendefinerte hooks (f.eks. useLeadsReport)
├── utils/                # Logikk og distribusjonsstrategi (f.eks. processLeads)
│   ├── parseLead.ts      # Validering og typesikker konvertering av Lead-data
├── types/                # Modulspesifikke typer hvis ikke delt globalt
├── __tests__/            # Tester for alle overnevnte mapper
```

---

## 🔄 Distribusjonslogikk
- Hovedlogikk ligger i `utils/processLeads.ts`
- Bruker dynamisk strategi fra `lead_settings`
- Støtte for `categoryMatch`, `roundRobin`, og pause-filter
- Bruk `isValidLeadStatus()` for å validere typer på statusfeltet

---

## 👥 Roller og tilgang
- `user`: sender inn leads
- `company`: mottar og følger opp leads
- `admin`: ser alt og kan administrere data
- `master-admin`: full kontroll inkl. strategivalg og modultilgang

Bruk `ProtectedRoute` og `useRoleGuard` for tilgangskontroll.

---

## 🧪 TypeSikkerhet
- Typer er definert i `@/types/leads.ts`
- Valider alltid `LeadStatus` og `LeadSettings` eksplisitt med valideringsfunksjoner
- Bruk parsing-funksjoner fra `utils/` (f.eks. `parseLead`) for å sikre typesikker konvertering
- Ikke bruk `any` eller direkte casting med `as Lead[]` - bruk parser-funksjonene
- Example:
```ts
// Riktig bruk av parseLead
const { data } = await supabase.from('leads').select('*');
const leads = (data || []).map(parseLead);
```

---

## ✅ Testing
- Alle tester ligger i `__tests__/`
- Bruk `vitest`, `jsdom` og `@testing-library/react`
- Kjør test: `npm run test`

---

📁 Endringer i modulen skal dokumenteres i `DEV_NOTES.md` og følge prosjektets modulstandard.

