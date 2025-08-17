# Prompt 1 — Besøkende-først: Startside + 3-stegs sammenligningsflyt (Bytt.no-inspirert)

> ℹ️ **Repo-wide modus (obligatorisk):** Bruk sammen med `repo-wide-sweep.md`. Ikke begrens endringer til én route/side – oppdater **hele repoet** (imports, typer, tjenester, migrasjoner, RLS). Før PR: **`npm run repo:health`** må være grønt.

**Rolle:** Du er UX-arkitekt + fullstack-utvikler. Du bygger en konverterende startside som fungerer som både **søk** og **registrering/lead-innhenting**. Løsningen støtter **Privat** og **Bedrift** via rolleswitch, uten passord i dev.

## 🎯 Mål
- Erstatt hero med **3-stegs wizard** (valg → kontekst → kontakt).
- Lagre **lead** + "light user" (dev/OTP) i Supabase med riktig rolle.
- Tilgjengelig, rask og SEO-vennlig.

## 🧩 Scope (i én PR)
1. Rolle-toggle: Privat | Bedrift (state + localStorage).
2. Steg 1: Privat: Strøm/Mobil/Forsikring/Bredbånd · Bedrift: Energi/Forsikring/Flåte/Plassadm.
3. Steg 2: Enkel kontekst (postnr/forbruk/ansatte).
4. Steg 3: E-post + samtykke → opprett lead + light user (dev).
5. Progressindikator + kvittering/CTA.
6. Navigasjon via `navConfig[role]`.
7. Analytics/SEO.
8. WCAG 2.1 AA.
9. Feature-flag: `visitor_wizard_enabled` (ON dev/stage).

## 🗄️ Data & RLS
- Tabeller: `leads`, `user_profiles`, `company_profiles`, `feature_flags`.
- RLS: anon **insert** i `leads`, ikke lese; eier-select for authenticated.
- Rolle lagres i `raw_user_meta_data.role`: `"user"`/`"company"`.

## 🚀 Etter innsending (lead → pakker → auto-distribusjon)
- `public.distribute_new_lead(lead_id)`:
  - Matcher **aktive pakker** (`lead_packages.rules`).
  - Tildeler kvalifiserte kjøpere (ikke paused, cap OK).
  - **Auto-kjøp** hvis `auto_buy=true` og budsjett tillater → ledger-trekk.
- Admin ser alle leads i live, sorterbar tabell.
- Kjøper har drag-and-drop pipeline: **Nye ✨ → I gang 🚀 → Vunnet 🏆 → Tapt ❌**.

## ✅ Akseptansekriterier (DoD)
- [ ] **Repo-wide sweep** + `npm run repo:health` grønt
- [ ] 3-stegs løype fungerer → `leads` lagres + light user opprettes
- [ ] Progressindikator skjermleservennlig
- [ ] Ingen TS/konsollfeil
- [ ] Lighthouse landingsside ≥ 90 (Perf/Best/SEO)
- [ ] Tester: Unit (validering/rolle), Integrasjon (lead+profil), E2E (begge roller)
- [ ] Docs: `README.md` + `docs/UX/visitor_flow.md` oppdatert

## 🛠️ Kommandoer
```bash
npm run repo:health
npm run e2e
```

## 🔐 RLS (innsetting fra besøkende)
```sql
alter table public.leads enable row level security;
create policy "lead_insert_public" on public.leads for insert to anon with check (true);
create policy "lead_owner_read"   on public.leads for select to authenticated using (user_id = auth.uid());
```

## 🔎 Analytics (eksempel)
```javascript
track('visitor_role_selected', { role });
track('visitor_step_view', { step: 1 });
track('visitor_lead_submitted', { role, product });
```