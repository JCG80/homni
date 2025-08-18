## Hva & hvorfor
- Rask og sikker rollebytte uten å endre eksisterende arkitektur.
- Klar separasjon: brukerflater (personal/professional) vs kontrollplan (admin/master).

## Endringer
- Ny RoleContext + oppdatert RoleModeSwitcher
- Edge‑funksjon for persistering/audit
- RLS hjelpefunksjon + eksempelpolicy
- E2E‑tester (synlighet + bytte)

## DoD
- Build grønn, tester grønn
- Kontrollmeny aldri synlig i brukermodus
- Rollebytte < 300ms opplevd tid (optimistisk UI)