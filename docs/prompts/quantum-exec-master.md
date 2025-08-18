# 🔭 Hybrid Platform Guardrails v2.2 — Repo-Wide Execution (Lovable)

**Arbeidsmodus**: Monorepo/Hybrid. Kjør repo-wide — ikke rute-lokalt. Følg Ultimate Master 2.0 + Repo-Wide Quantum QA v2.1.

## 0) Omfang (SKAL skannes/endres)

**Frontend**: `src/**`, `apps/**/src/**`

**Backend/API & Edge**: `api/**`, `server/**`, `functions/**`, `supabase/functions/**`, `workers/**`

**Felles pakker**: `packages/**/src/**`

**Database**: `supabase/migrations/**` (eller `migrations/**`)

**Test & verktøy**: `e2e-tests/**`, `cypress/**`, `scripts/**`, `__tests__/**`

**Dokumentasjon**: `docs/**`, `docs/prompts/**`, `README.md`, `ARCHITECTURE.md`

**Ekskluder**: `node_modules/**`, `dist/**`, `build/**`, `coverage/**`.

## 1) Kanoniske roller & persona (repo-wide)

**Platform-roller** (app-kode): `guest | user | company | content_editor | admin | master_admin`

**DB/RLS**: Supabase `anon` er ikke app-rollen; bruk `guest` i all app-kode.

**Persona-modell**: Én grunnrolle i `user_profiles.role` + valgfri(e) tildelte roller i `role_grants`. Aktiv kontekst styres i UI (persona-switch), mens RLS/guards håndhever tilgang.

### Hygiene Phase-0 (må være grønn):

- **Repo-wide codemod**: `anonymous→guest`, `member→user` i all app-kode (frontend, server, workers, tests, scripts).
- **normalizeRole + legacy-compatibility**: default `guest`, mapping av legacy → kanonisk.
- **navConfig/routeForRole/QuickLogin**: ingen `anonymous`.
- **DEV_NOTES.md/CHANGELOG.md/docs/authentication.md/components/navigation/README.md** oppdatert.
- **Guards**: `guard:legacy-roles` (inkluderer backend/edge/worker-stier), ESLint-forbud mot `\banonymous\b` i app-kode, Husky pre-commit.
- **Akseptanse Phase-0**: 0 forekomster av `anonymous/member` i app-kode, `repo:health` grønn.

## 2) Persona-grants (DB + API + UI)

**DB** (med `_down.sql`): `role_grants`, `is_master_admin(uuid)`, `has_role_grant(uuid,text,uuid?)`, `grant_role(...)`, `revoke_role(...)` (SECURITY DEFINER + SET search_path=public).

**RLS-utvidelser**: I admin-relevante tabeller (f.eks. leads, user_profiles, company_profiles …): tillat via `has_role_grant(auth.uid(),'admin', NULL)` eller `is_master_admin(auth.uid())` — uten å svekke eier-/rolle-krav.

**UI/UX**: PersonaSwitcher (header + egen fane "Tildelte roller"), tydelig "ADMIN-MODUS" banner, persister aktiv persona i localStorage, gjenbruk `navConfig['admin']` (ingen duplikat-dashboards).

**Seed**: Eiers e-post → master_admin + global grant (audit).

## 3) Visitor-first & lead-marketplace (ende-til-ende)

**Visitor wizard** (Bytt.no-stil): 3 steg, feature-flag `visitor_wizard_enabled`, anonym lead (RLS insert for anon), OTP/dev-light user, etter innsending kall `distribute_new_lead(lead_id)`.

**Marketplace**: `lead_packages`, `buyer_accounts`, caps/pause/auto-buy, idempotent `distribute_new_lead`, `execute_auto_purchase` (transaksjon + ledger), pipeline med slugs: `new | in_progress | won | lost` (UI viser emoji via mapping).

**Standardisering**: DB holder slugs, UI viser emoji — aldri motsatt. Regenerer Supabase types.

## 4) Hybrid-robusthet (server/edge/workers)

**Eventer & jobb-prosessering**: bruk idempotente nøkkel-strategier; transaksjonell outbox om nødvendig.

**Retries & backoff**: i API/edge/worker-kall.

**Kontrakter**: OpenAPI `docs/api/openapi.yaml`; kontrakttester for kritiske endepunkter.

**Observability**: OpenTelemetry (traces), Prometheus/Grafana (CPU/memory/latency/queue), Sentry.

## 5) Kvalitet & budsjetter

**CI/CD**: migrations (med rollback), seed, type-gen, lint/format, unit (≥90%), integration/E2E (≥80%), security (npm audit/Dependabot), performance-budsjetter (frontend bundle ≤200KB gz).

**Tilgjengelighet**: WCAG 2.1 AA, tastatur, fokus-styring, ARIA.

**i18n**: NO/EN/SE/DK under `locales/`.

**Ingen passord i dev**: QuickLogin + testbrukere.

## 6) Utfør i denne rekkefølgen (fail-fast, repo-wide)

1. **Phase-0 hygiene** (repo-wide): codemod + docs + guards + tests (inkl. backend/edge/worker).
2. **Persona-grants** (DB/API/UI): migrasjoner m/_down.sql, RLS-utvidelser, switcher.
3. **Visitor-wizard & marketplace E2E**: anonym lead → distribusjon → auto-buy → pipeline (slug).
4. **Regresjon & hardening**: kontrakttester, perf/a11y-budsjetter, observability.

Hver fase: små commits + én PR; `npm run repo:health` må være grønn før neste fase.

## 7) Rapportér tilbake (kort + maskin)

**Menneskelig korttekst**: hva ble endret (frontend/server/edge/DB/docs), hvilke duplikater/legacy som ble fjernet, hva gjenstår.

**Maskinvennlig JSON**:
```json
{
  "phase": "0|1|2|3",
  "legacy_scan": {"anonymous": 0, "member": 0, "files": []},
  "migrations": {"up": N, "down_missing": 0},
  "persona": {"switcher": "ok|pending", "grants_table": "ok|missing"},
  "marketplace": {"wizard": "ok|pending", "distribute": "ok|pending"},
  "types_sync": {"supabase_types_regenerated": true, "pipeline_stage": ["new","in_progress","won","lost"]},
  "guards": {"repo_health": {"typecheck":"PASS","build":"PASS","unit":"PASS","e2e":"PASS","rls":"PASS"}},
  "perf_accessibility": {"bundle_kb": 0, "lighthouse": 0, "wcag": "AA|issues"},
  "observability": {"otel":"ok|pending","sentry":"ok|pending"}
}
```

## Akseptanse

Ingen route-lokal "quick fixes". Alt er repo-wide, reversibelt (migrations `_down.sql`), testet og dokumentert.

## Implementeringsstatus

- ✅ **Phase-0**: Legacy role cleanup completed (anonymous→guest, member→user)
- ✅ **Phase-1 Partial**: Database unified data models, role system implemented
- 🔄 **Phase-1 Remaining**: Persona-grants system, UI switcher
- ⏳ **Phase-2**: Visitor-first wizard & lead marketplace
- ⏳ **Phase-3**: Robusthet & observability