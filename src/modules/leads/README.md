
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
├── types/                # Modulspesifikke typer hvis ikke delt globalt
├── tests/                # Tester for alle overnevnte mapper
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

## ✅ Testing
- Alle tester ligger i `tests/`
- Bruk `vitest`, `jsdom` og `@testing-library/react`
- Kjør test: `npm run test`

---

## 🧪 TypeSikkerhet
- Typer er definert i `@/types/leads.ts`
- Valider alltid `LeadStatus` og `LeadSettings` eksplisitt
- Ikke bruk `any` – bruk streng typesetting med importerte typer

---

## 📌 Eksempel på bruk
```ts
const { data } = await supabase.from('leads').select('*');
const leads = data.map(item => ({
  ...item,
  status: isValidLeadStatus(item.status) ? item.status : 'new',
}));
```

---

📁 Endringer i modulen skal dokumenteres i `DEV_NOTES.md` og følge prosjektets modulstandard.
