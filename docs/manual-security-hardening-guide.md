# Manual Sikkerhetshardening Guide

## Kritiske Supabase Dashboard Konfigurasjoner

### 1. Auth OTP Expiry (5 min)

**Navigasjon**: Supabase Dashboard → Authentication → Settings → Security

**Steg:**
1. Åpne [Supabase Dashboard](https://supabase.com/dashboard/project/kkazhcihooovsuwravhs/auth/policies)
2. Gå til **Authentication** → **Settings** → **Security**
3. Finn **"OTP Expiry"** seksjonen
4. Reduser verdien til **15 minutter** (900 sekunder)
5. Klikk **Save**

**Sikkerhetshensikt**: Reduserer vinduet for OTP-angrep fra potensielt timer til 15 minutter.

---

### 2. Leaked Password Protection (2 min)

**Navigasjon**: Authentication → Settings → Security

**Steg:**
1. Finn **"Leaked Password Protection"** seksjonen
2. **Aktiver** denne funksjonen
3. Klikk **Save**

**Sikkerhetshensikt**: Blokkerer bruk av kompromitterte passord fra kjente databreaches.

---

### 3. MFA (Multi-Factor Authentication) (3 min)

**Navigasjon**: Authentication → Settings → Auth Providers

**Steg:**
1. Gå til **"Multi-Factor Authentication"** seksjonen
2. **Aktiver TOTP** (Time-based One-Time Password)
   - Toggle på **"TOTP"**
3. **Valgfritt: Aktiver SMS** (hvis SMS-provider er konfigurert)
   - Toggle på **"SMS"** hvis ønskelig
4. Klikk **Save**

**Sikkerhetshensikt**: Legger til ekstra sikkerhetslag utover kun passord.

---

### 4. Database Upgrade (5-10 min) - **KRITISK**

**Navigasjon**: Settings → General → Database

**Aktuell status**: `supabase-postgres-15.8.1.093` har tilgjengelige sikkerhetspatcher

**Steg:**
1. Gå til **Settings** → **General** → **Database**
2. Finn **"Database Version"** seksjonen
3. **KRITISK**: Oppgrader fra `supabase-postgres-15.8.1.093` til nyeste patch-versjon
   - Klikk **"Upgrade"** knappen
   - **Viktig**: Les upgrade-notater nøye før du fortsetter
   - Bekreft upgrade med **"Confirm Upgrade"**
4. **Overvåk oppgraderingen**: Vent på at prosessen fullføres (5-10 min)
   - Status vil vise "Upgrading..." under prosessen
   - **Ikke forlat siden** under oppgraderingen

**Sikkerhetshensikt**: 
- Fikser kjente sikkerhetssårbarheter i Postgres 15.8.1.093
- Beskytter mot potensielle database-exploits
- **Høyeste prioritet** - denne sårbarheten er ekstern-vendt

**Forventet utfall**: Database versjon oppgradert til nyeste patch (15.8.1.094+ eller nyere)

---

## Validering Etter Konfigurering

### 1. Test Authentication Flow
```bash
# Kjør våre authentication tester
npm run test:auth
```

### 2. Sjekk Sikkerhetsstatus
```bash
# Kjør sikkerhetsskanning
npm run security:check
```

### 3. Verifiser RLS Policies
```bash
# Kjør RLS policy tester  
npm run test:rls
```

### 4. Test Build
```bash
# Sikre at alt kompilerer riktig
npm run build
```

---

## Forventet Tidsbruk
- **Total tid**: 15-20 minutter
- **Auth konfigurering**: 10 minutter
- **Database upgrade**: 5-10 minutter (**KRITISK - høyeste prioritet**)
- **Testing**: 5 minutter

⚠️ **VIKTIGHETSREKKEFØLGE:**
1. **Database Upgrade** (kritisk sikkerhetssårbarhet)
2. Auth OTP Expiry  
3. Leaked Password Protection
4. MFA aktivering

## Sikkerhetsnivå
**Før**: 🔴 Kritiske sårbarheter
**Etter**: 🟢 Produksjonsklar sikkerhet

---

## Hjelp og Feilsøking

### Hvis OTP ikke fungerer etter endring:
1. Sjekk at brukere logger ut og inn igjen
2. Verifiser at email-templates er konfigurert

### Hvis MFA skaper problemer:
1. MFA er opt-in for brukere - eksisterende brukere påvirkes ikke automatisk
2. Nye brukere kan velge å aktivere MFA i profilen sin

### Hvis database upgrade feiler:
1. **Sjekk aktive connections** - Disconnect alle klienter midlertidig
2. **Prøv på nytt** - Upgrades kan feile pga. timing
3. **Kontakt Supabase support** hvis gentatte feil
4. **IKKE utsett** - `supabase-postgres-15.8.1.093` har kjente sårbarheter
5. Vurder å kjøre upgrade utenfor arbeidstid for minimal downtime

**Backup informasjon**: Supabase tar automatisk backup før major upgrades

---

## Neste Steg Etter Fullføring

1. **Deploy til produksjon**
2. **Overvåk authentication logs** de første dagene
3. **Informer brukere** om nye MFA-muligheter
4. **Kjør sikkerhetsskanning månedlig**