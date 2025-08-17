# Roller & Tilganger (Homni)

**Hvem kjøper leads?** Bedrifter/leverandører (rolle `company`) som har **buyer-account** + aktiv **buyer_package_subscription** ("Kjøper"-kapabilitet).

| Rolle | Kan | Kan ikke |
|---|---|---|
| `anonymous` | Opprette lead (insert i `leads`) | Lese andres data |
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