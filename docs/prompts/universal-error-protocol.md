# Universal Error Protocol (UEP) v1.2

Purpose: Deterministic repo-wide protocol to triage, fix, and verify errors (build, runtime, tests, migrations, RLS, edge functions) with rollback safety.

1) Classify (10–30s)
- Category: build | type | lint | unit | integration | e2e | runtime | sql | rls | function | ci | perf | a11y
- Scope: file(s), module, migration id, function name, route
- Severity: block-release | blocks-feature | nuisance | flake

2) Capture evidence (≤1 min)
- Console: last error stack + timestamp
- Network: failing request (URL, method, status, payload)
- DB: exact SQL/Policy/Function name and error
- Screenshot/GIF if UI

3) Minimal reproduction (≤5 steps)
- Steps-to-repro (local + CI)
- Expected vs actual
- Feature flags/modules state

4) Root-cause triage (checklist)
- Duplicates/casing: run repo:health duplicates
- Import path or cyclic dep
- Version drift (react/radix/vite/ts)
- RLS mismatch (missing auth.uid, wrong table policy/enum)
- Edge function CORS/JWT headers
- Missing/incorrect types or unsafe any

5) Fix-first patch (≤30 LOC)
- Small, targeted change; scaffold missing stub (service/hook/SQL) with TODO + tests
- Add guards/logging at failure point

6) Verification (green or revert)
- npm run typecheck && npm run build
- npm run test:run (unit) + e2e for affected flow
- ts-node scripts/checkRls.ts + scripts/checkFunctions.ts + scripts/checkMigrations.ts
- If red → rollback patch; open follow-up issue

7) Observability hook
- analytics.track('error', { category, code, surface, meta }) where meaningful

8) Rollback & docs
- Link commit hash; add PROMPT_LOG entry (before/after); update README/CHANGELOG if user-visible

UEP JSON (attach in PROMPT_LOG)
{
  "timestamp": "<iso>",
  "category": "build|runtime|...",
  "severity": "block-release|...",
  "files": ["src/..."],
  "sql_policy": "optional",
  "edge_function": "optional",
  "repro": ["step1", "step2"],
  "fix_summary": "",
  "loc": 0,
  "tests": {"unit": true, "e2e": false},
  "result": "green|reverted"
}