# API Konfigurasjonsveileder

## Oversikt

Dette systemet er klargjort for full API-integrasjon med Supabase, men krever miljøvariabel-konfigurasjon for å være operativt.

## Nødvendige miljøvariabler

For full API-funksjonalitet må følgende settes i Lovable Environment:

### Obligatoriske variabler:
- `VITE_SUPABASE_URL`: Din Supabase prosjekt-URL
- `VITE_SUPABASE_ANON_KEY`: Din Supabase anon/public key

## Oppsett i Lovable

### Steg 1: Finn dine Supabase-detaljer
1. Gå til [Supabase Dashboard](https://supabase.com/dashboard)
2. Velg ditt prosjekt
3. Gå til Settings → API
4. Kopier:
   - Project URL (VITE_SUPABASE_URL)
   - Anon public key (VITE_SUPABASE_ANON_KEY)

### Steg 2: Sett opp i Lovable Environment
1. Gå til ditt Lovable-prosjekt
2. Åpne Environment-seksjonen
3. Legg til variablene:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Lagre endringene
5. Redeploy prosjektet for å aktivere konfigurasjonen

## Validering

### Automatisk validering
Systemet sjekker automatisk API-status ved oppstart og viser:
- 🟢 **Grønn status**: API operativt og klargjort
- 🟡 **Gul advarsel**: API operativt med advarsler
- 🔴 **Rød feil**: API ikke operativt - mangler konfigurasjon

### Manuell validering
Kjør valideringskommandoer for å sjekke status:

```bash
# Sjekk miljøvariabel-konfigurasjon
npm run check-env

# Valider komplett API-oppsett
npm run validate-api
```

## Funksjonalitet uten API-konfigurasjon

Uten korrekt API-konfigurasjon vil systemet:
- ✅ Laste og vise grunnleggende UI
- ✅ Vise advarselsbanner om manglende konfigurasjon
- ❌ Ikke kunne utføre autentisering
- ❌ Ikke kunne lagre eller hente data
- ❌ Ikke kunne bruke backend-tjenester

## Feilsøking

### Vanlige problemer

#### "API ikke operativt" banner vises
- **Årsak**: Miljøvariabler er ikke satt eller har placeholder-verdier
- **Løsning**: Følg oppsett-instruksjonene over

#### Konsoll-advarsler om manglende konfigurasjon  
- **Årsak**: Normal oppførsel når API ikke er konfigurert
- **Løsning**: Konfigurer miljøvariabler eller ignorer hvis du jobber lokalt

#### API-kall feiler
- **Årsak**: Miljøvariabler er ikke korrekt satt
- **Løsning**: Verifiser at URL og nøkler er korrekte og aktive

### Debug-verktøy

Systemet inkluderer innebygde debug-verktøy:
- **Environment Diagnostics**: Viser miljø-status
- **Network Diagnostics**: Viser nettverksstatus  
- **API Status Banner**: Visuell indikator på problemer

## Sikkerhet

### Viktige sikkerhetsprinsipper:
- ✅ Kun bruk anon/public keys i frontend-kode
- ✅ Service keys må kun brukes i backend/edge functions
- ✅ Aldri commit API-nøkler til versjonskontroll
- ✅ Bruk Lovable Environment for sikker lagring

## Support

For ytterligere hjelp:
1. Sjekk Supabase-dokumentasjonen
2. Valider konfigurasjon med `npm run check-env`
3. Se konsoll-logger for detaljerte feilmeldinger
4. Kontakt support med spesifikke feilmeldinger

---

**Systemstatus**: ✅ Klargjort for API-integrasjon  
**Sist oppdatert**: `new Date().toISOString().split('T')[0]`