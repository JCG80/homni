## Hva og hvorfor
Kort beskrivelse av endringen og hensikten.

## Teststeg
- [ ] `npm run typecheck && npm run build`
- [ ] Manuell klikketest av berørte sider/flows

## CI-Gate Sjekkliste
- [ ] **Prompt Guardian:** Berører PR-en prompts/docs/i18n? → Oppdater `PROMPT_LOG.md`
- [ ] **Status Sentinel:** Berører PR-en src/supabase/roles-and-permissions? → Oppdater `docs/status/NOW.md`

## Kvalitetssikring
- [ ] Lint & type-check grønt
- [ ] Evt. migrasjoner har rollback
- [ ] Tester oppdatert/lagt til (der det er naturlig)
- [ ] Status-dokumentasjon oppdatert ved core-endringer