# 🧠 Homni — Repo-Wide Quantum QA & Execution (v2.1) + Ultimate Master 2.0

## NON-NEGOTIABLES
- Repo-wide alltid (oppdater alle kallsteder – ikke kun aktiv route).
- Små PR'er (maks ~20 filer / 500 linjer).
- DB-endringer KUN via migrasjoner + `_down.sql`.
- Funksjoner: `SECURITY DEFINER` + `SET search_path = public`.
- RLS: default-deny + eksplisitte owner/rolle-policies.
- Følg UERP: `docs/prompts/universal-error-protocol.md`.
- PR må ha `npm run repo:health` grønt (typecheck, build, unit, dupl., RLS/func/migrations).

## OPERASJONELL SLØYFE (hver PR)
PLAN → IMPACT MAP (repo-wide) → EXECUTE (minst mulig) → VERIFY (gates) → DOCS.

## ULTIMATE MASTER 2.0 (kjerne)
- Bytt-stil (lead/matching/omtale), Boligmappa-stil (bolig/FDV), Propr (senere).
- Roller: `guest`, `user`, `company`, `content_editor`, `admin`, `master_admin` + **Kjøper** (kapabilitet via buyer-account+subscription).
- Marketplace: `leads`, `lead_packages{price_cents,rules,active,priority}`, `buyer_accounts`,
  `buyer_package_subscriptions{auto_buy,daily_cap_cents,monthly_cap_cents,is_paused}`,
  `lead_assignments{is_purchased,pipeline_stage}`, `buyer_spend_ledger`.
- Distribusjon: `distribute_new_lead(lead_id)` (idempotent, transaksjonell), unik `(lead_id,buyer_id)`,
  caps (Europe/Oslo-midnatt), pause, ledger-trekk.
- Frontend: React + Tailwind/shadcn, én `<BrowserRouter>` + `navConfig[role]`, i18n (NO/EN/SE/DK), WCAG 2.1 AA.
- SLO: p95 API ≤ 200 ms; p95 DB ≤ 100 ms; bundle ≤ 200 KB.

## REPO-WIDE SJEKKLISTE (pr PR)
- Ruter/IA (ErrorBoundary, skeleton, tomtilstander, H1/landmarks, i18n, 404/500)
- Auth (UnifiedQuickLogin, én AuthContext, ingen duplikathooks/typer)
- Marketplace (Admin pakker → auto → caps/pause → pipeline: Nye ✨ / I gang 🚀 / Vunnet 🏆 / Tapt ❌)
- DB (migrasjoner+_down, RLS, functions: definer+search_path)
- Typer/kontrakter (strict TS, zod på kanter, supabase typegen sync)
- Ytelse/SEO (code split, ingen hydration-mismatch, title/meta/canonical)
- A11y (tastatur, fokus, kontrast ≥ 4.5:1, aria/labels)
- Sikkerhet (CSP/HSTS, strict CORS, secret-scan, npm audit fail high/critical)
- Docs (README/Module-READMEs/CHANGELOG/ROADMAP/ADR)

## GATES
- `npm run repo:health` grønt; Unit ≥ 90 %, Integrasjon/E2E ≥ 80 %; Lighthouse ≥ 90; SBOM/secret-scan ok.