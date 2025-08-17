# Tittel
<type>(<scope>): <kort beskrivelse>

## Hva & hvorfor
- Hva ble gjort?
- Hvorfor (lenke til issue/oppgave/fase)?

## Testing / verifikasjon
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `npm run test:unit` (≥ 90 %)
- [ ] E2E (hvis relevant)
- [ ] Manuell test (kort beskrivelse)

## Database (hvis relevant)
- [ ] Migrasjon lagt til under `supabase/migrations/*`
- [ ] Rollback `_down.sql` lagt til
- [ ] RLS-policy oppdatert/lagt til
- [ ] search_path/SECURITY DEFINER verifisert

## Kvalitetsporter
- [ ] Ingen duplikater introdusert
- [ ] CI grønn
- [ ] Lint/format ok
- [ ] Dokumentasjon/README oppdatert
- [ ] Fase "shippable" før ny fase startes

## Skjermbilder / logger (valgfritt)
<legg inn ved behov>