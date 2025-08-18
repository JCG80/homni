# Roller & Tilganger (Homni)

**Hvem kjøper leads?** Bedrifter/leverandører (rolle `company`) som har **buyer-account** + aktiv **buyer_package_subscription** ("Kjøper"-kapabilitet).

| Rolle | Kan | Kan ikke |
|---|---|---|
| `guest` | Opprette lead (insert i `leads`) | Lese andres data |
| `user` (privat) | Opprette lead; lese **egne** leads | Kjøpe leads; lese andres |
| `company` (basis) | — | Kjøpe leads før de har buyer-capability |
| `company` + **Kjøper** | Abonnere på pakker; auto-kjøp; caps; pause; pipeline DnD for **egne** tildelinger | Se/endre andres leads/økonomi |
| `content_editor` | Redigere innhold/SEO | Kjøpe leads; se persondata utover behov |
| `admin` | Se alle leads; CRUD pakker; administrere kjøpere; overstyre/tildeling; kreditering | — |
| `master_admin` | Alt admin + system/secrets/toggles | — |

## Kjernetabeller & RLS
- `leads`: anon insert; eier-select (authenticated); admin full
- `lead_packages`: admin full; authenticated **read aktive**
- `buyer_accounts`: eier rw; admin full
- `buyer_package_subscriptions`: eier rw; admin full
- `lead_assignments`: eier rw; admin full
- `buyer_spend_ledger`: eier **read**; admin full

## Pipeline-stadier (DnD)
- **Nye ✨** → **I gang 🚀** → **Vunnet 🏆** → **Tapt ❌** (enkel, inspirerende terminologi)

## RLS Policy Matrix

### Tabellnivå (alle tabeller har RLS enabled)
```sql
-- Default: DENY ALL
-- Eksplisitt ALLOW per use case
```

### Policies per rolle
**guest:**
- `leads`: INSERT only (create new leads)
- Andre tabeller: DENY

**user/company (basic):**
- `leads`: SELECT own records (user_id = auth.uid())
- `user_profiles`: CRUD own profile
- `company_profiles`: CRUD own profile (hvis company)

**company + buyer capability:**
- `buyer_accounts`: CRUD own account
- `buyer_package_subscriptions`: CRUD own subscriptions
- `lead_assignments`: CRUD own assignments
- `buyer_spend_ledger`: SELECT own transactions

**admin:**
- Alle tabeller: FULL CRUD
- Funksjoner: kan kalle distribution/override

**master_admin:**
- Alt admin har +
- `feature_flags`: CRUD
- System-funksjoner og secrets

## Capability Matrix

### Mode switching (personal ↔ professional)
- Aktiv modus lagres i `app_metadata.active_mode` og leses i RLS via `get_active_mode()`.
- `RoleModeSwitcher` viser kun personal/professional (kontrollplan byttes separat).
- E2E‑tester verifiserer at **kontrollmenyer aldri vises** i bruker‑modus.