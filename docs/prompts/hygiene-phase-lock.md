# Prompt 2 — Hygiene & Fase-lås (obligatorisk etter "Besøkende-først")

> ℹ️ **Repo-wide modus (obligatorisk):** Bruk sammen med `repo-wide-sweep.md`. Før fase lukkes: **`npm run repo:health`** må være grønt.

**Rolle:** Du er kvalitetssjef + arkitekt. Du **rydder opp** etter Prompt 1 og **låser fasen**. Mål: grønn build, ingen duplikater, riktig RLS/DB.

## 🎯 Mål
- Hindre duplikater/overlapp; sikre casing/props.
- Verifisere RLS/policies og funksjoner.
- Ytelse/tilgjengelighet over terskler.
- Dokumentasjon + CHANGELOG.
- Merk fasen **shippable**.

## 🧹 Sjekk & opprydding
1) **Duplikat/casing**
- `npm run check:duplicates`
- Slå sammen overlapp (RoleToggle/Wizard/LeadForm/QuickLogin/Auth/useUserRole)
- Imports → én kilde; slett døde filer

2) **Types & Props**
- Null "Property 'x' does not exist"
- Felles typer i `src/types/`
- `UnifiedQuickLogin` med `onSuccess?`, `redirectTo?`

3) **RLS, policies, funksjoner**
- Tabeller berørt: **RLS ENABLED**
- `leads`: `anon insert`, ikke select; eier-select for authenticated
- Funksjoner: `SECURITY DEFINER` + `SET search_path = public`
- Vaktene:
```bash
npm run guard:rls
npm run guard:functions
```

3b) **Marketplace (må være grønt)**
- [ ] `lead_packages` CRUD (Admin), `buyer_package_subscriptions` aktiv
- [ ] `distribute_new_lead(lead_id)` fungerer (tildeling/logg)
- [ ] Auto-kjøp respekterer `daily_cap_cents` / `monthly_cap_cents`
- [ ] Pause (`is_paused`) stopper auto-kjøp
- [ ] Kjøper pipeline DnD: **Nye ✨ | I gang 🚀 | Vunnet 🏆 | Tapt ❌**

4) **Build/lint/tests**
- `npm run typecheck`, `npm run build` grønt
- Unit ≥ 90 %, E2E for Privat/Bedrift grønt
- Ingen konsollfeil

5) **Ytelse & tilgjengelighet**
- Lighthouse landingsside ≥ 90
- Ingen hydrationsfeil
- Tastaturnavigasjon, labels/ARIA, kontrast OK

6) **Docs & fase-lås**
- README.md, docs/UX/visitor_flow.md oppdatert
- ROADMAP.md: "Besøkende-flyt" ✅ shippable
- CHANGELOG.md oppdatert
- Skjermbilder/GIF i PR

## ✅ DoD
- [ ] **Repo-wide sweep** + `npm run repo:health` grønt
- [ ] Zero compiler warnings; grønn build
- [ ] Ingen duplikater/overlapp
- [ ] RLS/func-vakter grønt
- [ ] Unit ≥ 90 %, E2E OK
- [ ] Lighthouse ≥ 90
- [ ] Docs/CHANGELOG oppdatert
- [ ] Fasen **shippable** før neste