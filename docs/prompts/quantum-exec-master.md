# 🚀 Quantum Execution Master v2.1 + Ultimate Master 2.0 [Repo-wide]

> ℹ️ **Repo-wide modus (obligatorisk):** Bruk alltid sammen med `repo-wide-sweep.md`. Ikke begrens endringer til ett skjermbilde/route – oppdater **hele repoet** (imports, typer, tjenester, migrasjoner, RLS). Før PR: kjør **`npm run repo:health`** og krev grønt.

## 0) Produktkompass (riktig inspirasjon)
- **Bytt.no-stil:** lead-generering + matching + brukeromtaler/rangering. (Ikke markedsplass.)
- **Boligmappa-stil:** boligens dokumentasjonsarkiv + vedlikehold/FDV knyttet til eiendom. (Ikke sammenligning.)
- **Propr-stil (senere):** DIY salgsflyt.
→ Homni kombinerer disse modulært, AI-klar.

## 1) Arbeidsmodus (rekkefølgen)
1) **Bygg (roadmap)** → lever funksjonen/brukerreisen.
2) **Hygiene** → duplikat-/casing-/RLS-/CI-sjekk, dokumentér.
3) **Fasekontinuitet** → fullfør pågående fase til "shippable" før ny.

## 2) Golden rules
- **Ingen duplikater**. Søk først; slå sammen; behold varianten med best typing/testdekning/bruk.
- **Casing**: aldri `MainRoutes.tsx` vs `mainRoutes.tsx` (unngå TS1261).
- **Error-driven**: les feilen → minimal patch → grønt bygg. Mangler? Scaffold stub + TODO + test.
- **Dev uten passord**: QuickLogin (OTP/magic link). Dev-viewer kun i dev-build.
- **Hemmeligheter**: kun i secrets/env. Ikke i kode.

## 3) Funksjonell roadmap (bygg først)
- **Roller & profiler**
  - `guest`, `user`, `company`, `content_editor`, `admin`, `master_admin`.
  - `user_profiles`, `company_profiles` (utvid, ikke dupliser).
- **Auth & onboarding**
  - Én `UnifiedQuickLogin({ redirectTo?, onSuccess? })`. Guest→Register→Wizard (autosave).
- **Navigasjon/IA**
  - Én `<BrowserRouter>` entry. Sentral `navConfig[role]`.
- **Moduler**
  - Lead-gen (Bytt-stil: matching + omtaler + konvertering/lead).
  - Dokumentasjon/vedlikehold (Boligmappa-stil: boligmappe/FDV/kvitteringer).
  - DIY salg (Propr-stil) – bak feature-flagg.
  - **Lead-marketplace**: `lead_packages` (Admin), `buyer_*` (kjøper), auto-kjøp, caps, pause, pipeline (DnD).
- **DB & sikkerhet**
  - Supabase RLS (default deny), GDPR: `deleted_at`.
  - `feature_flags`, `module_metadata`.
  - Alle funksjoner: `SECURITY DEFINER` + `SET search_path = public`.
- **Frontend**
  - Tailwind/shadcn, react-hook-form + zod, WCAG 2.1 AA, i18n (NO/EN/SE/DK).
- **Observability & ytelse**
  - OpenTelemetry events (auth/onboarding/flags/marketplace), p95 API ≤ 200 ms, bundle ≤ 200 KB gz.

## 4) Hygiene & kvalitet (obligatorisk etter bygg)
- Repo-wide duplikat-/casing-sjekk, pek imports til én kilde.
- `npm run typecheck && npm run build` grønt; ingen lint-feil.
- Tests: Unit ≥ 90 %, Integrasjon/E2E ≥ 80 %.
- RLS på relevante tabeller; policies eksplisitte (default deny + owner).
- Funksjoner har `security definer + search_path`.
- CI-porter: Lint, typecheck, build, coverage gate, duplikater, RLS/func/migrations, `npm audit`.
- Docs: README/Module-README + CHANGELOG oppdatert; beslutninger loggført.

## 5) Marketplace flyt (ADM pakker → auto-distribusjon)
1) Lead opprettes → `distribute_new_lead(lead_id)` matcher **aktive pakker** (rules JSONB).
2) Tildel kvalifiserte kjøpere (ikke paused, cap OK).
3) **Auto-kjøp** hvis `auto_buy=true` og budsjetter tillater → ledger-trekk.
4) Kjøpers DnD-pipeline: **Nye ✨ → I gang 🚀 → Vunnet 🏆 → Tapt ❌**.

## 6) Definition of Done
- Funksjon levert iht roadmap (inkl. marketplace der relevant).
- **Repo-wide sweep** + `npm run repo:health` grønt.
- Ingen duplikater/feil casing.
- Migrasjoner med `_down.sql` og testet.
- RLS verifisert; funksjoner definer/search_path.
- Coverage ≥ terskler; CI grønn.
- Docs/README/CHANGELOG oppdatert.
- Fase **shippable** før ny starter.