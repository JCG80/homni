# Lead-Marketplace & Automation (Admin-pakker, budsjett, auto-kjøp, pipeline) [Repo-wide]

> ℹ️ **Repo-wide modus (obligatorisk):** Bruk sammen med `repo-wide-sweep.md`. Før PR: **`npm run repo:health`** må være grønt.

## 🎯 Mål
- Admin konfigurerer **pakker** (pris + regler).
- Kjøper melder seg på pakker; setter **budsjettak**, **auto-kjøp**, **pause**.
- Nye leads distribueres automatisk; kjøp skjer automatisk når kriterier møtes.
- Kjøper jobber i **drag-and-drop pipeline**: **Nye ✨ → I gang 🚀 → Vunnet 🏆 → Tapt ❌**.

## 🗄️ Datamodell (kjerne)
- `leads`
- `lead_packages { name, price_cents, rules JSONB, active, priority }`
- `buyer_accounts`
- `buyer_package_subscriptions { auto_buy, daily_cap_cents, monthly_cap_cents, is_paused }`
- `lead_assignments { is_purchased, pipeline_stage enum }`
- `buyer_spend_ledger` (økonomi)

## 🔁 Flyt
1) Lead opprettes → `distribute_new_lead(lead_id)`.
2) Match **aktive pakker** (rules).
3) Tildel kvalifiserte kjøpere (ikke paused; cap OK).
4) Auto-kjøp hvis `auto_buy=true` og cap tillater → ledger-trekk.
5) Kjøper DnD-pipeline oppdaterer `lead_assignments.pipeline_stage`.

## ✅ DoD
- [ ] **Repo-wide sweep** + `npm run repo:health` grønt
- [ ] Admin: CRUD pakker; kjøper: abonnere/cap/pause/auto-kjøp
- [ ] Nye leads fordeles til riktige kjøpere; auto-kjøp fungerer
- [ ] Pipeline DnD fungerer (4 kolonner)
- [ ] RLS/CI-vakter grønt; tester over terskel