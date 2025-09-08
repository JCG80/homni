# Find-Before-Build Protocol

## Identifisering av objekter og felter

### 1. Systematisk søk FØRST
Før du oppretter **nytt** objekt/felt/type:

```bash
# Søk i hele kodebasen
npm run find-duplicates  # Kjører vårt script

# Manuelt søk etter lignende objekter
grep -r "ObjectNavn" src/
grep -r "field_name" src/
```

**Analyser alle treff:**
- Hvis **flere varianter** finnes → behold mest robuste, slett resten
- Hvis **lignende** finnes → verifiser 100% at det dekker ditt behov
- Hvis **ingenting** finnes → lag nytt med full DoD

### 2. Single Source of Truth etablering

**KRITISK:** Én kanonisk kilde per type/konsept.

**Eksempel - UserRole typer:**
```
❌ FEIL: Flere definisjoner
- src/types/auth.ts: UserRole + ALL_ROLES
- src/modules/auth/utils/roles/types.ts: UserRole + ALL_ROLES  
- src/routes/routeTypes.ts: UserRole

✅ RIKTIG: Én kanonisk kilde
- src/modules/auth/normalizeRole.ts: UserRole + ALL_ROLES (CANONICAL)
- Andre filer: import fra canonical + re-export for kompatibilitet
```

### 3. Type Consolidation Pattern
```typescript
// CANONICAL SOURCE (src/modules/auth/normalizeRole.ts)
export type UserRole = 'guest' | 'user' | 'company' | 'content_editor' | 'admin' | 'master_admin';
export const ALL_ROLES: UserRole[] = ['guest', 'user', 'company', 'content_editor', 'admin', 'master_admin'];

// RE-EXPORT FILES (backward compatibility)
// DEPRECATED: Use @/modules/auth/normalizeRole instead
import { UserRole, ALL_ROLES } from '@/modules/auth/normalizeRole';
export type { UserRole };
export { ALL_ROLES };
```

### 4. Automatisert duplikat-deteksjon

**Scripts kjøres i CI/CD:**
```bash
npm run find-duplicates          # Finn duplikate pages og typer
npm run test:no-duplicates       # Stopp build hvis duplikater
```

**Pre-commit hooks:**
- Blokkerer commits med duplikate `UserRole`, `ALL_ROLES`, `*Page.tsx`
- Krever at nye typer ikke kolliderer med eksisterende

### 5. Definition of Done (DoD) for nye objekter

✅ **Søk utført** - ingen duplikat i hele repoet  
✅ **Migrasjon + rollback** på plass (hvis DB-relatert)  
✅ **RLS policies** sjekket (auth.uid() beskyttelse minimum)  
✅ **Types/TS interfaces** oppdatert  
✅ **Unit + integrasjonstester** dekker objektet  
✅ **Dokumentasjon** (README + API/OpenAPI) oppdatert  
✅ **CI kjører grønt** - ingen build/lint errors  

### 6. Feilhåndtering & Error-Driven Development

**Hvis noe mangler → ikke lag nytt, fiks eksisterende:**

```typescript
// ❌ FEIL: Lage ny type for manglende felt
type NewUserProfile = UserProfile & { missing_field: string }

// ✅ RIKTIG: Utvid eksisterende type
interface UserProfile {
  // ... keep existing code
  missing_field?: string; // Add what you need
}
```

**Crash-to-green workflow:**
1. Build krasjer → identifiser **minste** endring for grønt bygg
2. Patch raskt (få CI grønt)  
3. Opprett issue for bedre løsning senere
4. **Aldri** lag duplikat for å unngå krasj

### 7. Rollback & Cleanup Strategy

**Cleanup-regler:**
- Slett filer som ikke refereres av noen
- Merge lignende objekter med overlappende felter  
- Konsolider duplikate konstanter (roleIcons, roleLabels, etc.)
- Fjern dead imports og unused types

**Rollback-plan:**
- Git revert ved kritiske feil
- Backup av slettede filer i /docs/rollback/
- Dokumenter alle store konsolideringer i ADR-filer

### 8. Team Workflow

**PR Requirements:**
- **Beskriv** hvorfor nytt objekt/felt ble laget
- **Dokumenter** at søk er utført (ingen duplikat funnet)
- **List** berørte moduler og potensielle breaking changes
- **Test** at alle eksisterende funksjoner fortsatt virker

**Review Checklist:**
- [ ] Søk etter eksisterende løsninger utført?
- [ ] Canonical source etablert/brukt?
- [ ] Backward compatibility bevart?
- [ ] Tests dekker nye objekter?
- [ ] Dokumentasjon oppdatert?

---

## Scripts og Verktøy

### find-duplicates
Identifiserer duplikate pages, typer og konstanter:
```bash
npm run find-duplicates
```

### CI Integration
Pre-commit hook setup:
```json
{
  "scripts": {
    "pre-commit": "npm run find-duplicates && npm run lint && npm run typecheck"
  }
}
```

**Målsetting:** Null duplikater, konsistente typer, grønn build til enhver tid.
