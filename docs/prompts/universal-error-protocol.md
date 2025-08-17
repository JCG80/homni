# UERP – Universal Error-Recovery Protocol v1.2 [Repo-wide]

> ℹ️ **Repo-wide modus (obligatorisk):** Bruk sammen med `repo-wide-sweep.md`. Før PR: **`npm run repo:health`** må være grønt.

## 🎯 Mål
Standardisert feilhåndtering som retter **alle** byggefeil automatisk uten å be bruker om hjelp.

## 🔧 Prosedyre

### 1) **Diagnose** (les feilen)
- TS-error: `Property 'x' does not exist on type 'y'`
- Import-error: `Cannot find module 'z'`
- Build-error: `Unexpected token`, `Missing dependency`
- Runtime-error: Console, network, state

### 2) **Minimal patch** (ikke omskriv alt)
- **Mangler type?** → Scaffold minimal interface + TODO.
- **Mangler funksjon?** → Scaffold stub med riktig signatur + TODO.
- **Mangler component?** → Scaffold basic JSX + props + TODO.
- **Mangler service?** → Scaffold med dummy data + TODO.

### 3) **Scaffold-template**
```typescript
// TODO: Implement proper logic for [describe what's missing]
export const placeholderFunction = (...args: any[]): any => {
  console.warn('TODO: Implement placeholderFunction');
  return null;
};
```

### 4) **Byggerekkefølge**
1. `npm run typecheck` → fiks TS-feil
2. `npm run build` → fiks build-feil  
3. `npm run test` → fiks test-feil
4. `npm run repo:health` → alt grønt

### 5) **Ikke gjør** (vanlige feil)
- ❌ Be bruker om kode/input
- ❌ Lag komplekse løsninger for enkle feil
- ❌ Ignorer feil "senere"
- ❌ Skriv om store filer for små feil

### 6) **Gjør alltid**
- ✅ Les hele feilmeldingen
- ✅ Minste mulige endring
- ✅ Test at endringen virker
- ✅ Marker TODO for senere utfylling

## 🚨 Escaping (når UERP ikke virker)
Hvis 3+ forsøk mislykkes:
1. **Rollback** til siste grønne commit
2. **Alternativ tilnærming** (annen arkitektur)
3. **Be om hjelp** med eksakt feilmelding + kontekst

## ✅ Suksesskriterier
- Byggefeil løst uten brukerinput
- `npm run repo:health` grønt
- Minimal kodeendring
- TODO markert for senere arbeid