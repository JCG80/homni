# Universal Error Protocol

## TypeScript Errors

### TS2322/2678 pga emoji-typer
- **Problem**: Status/pipeline bruker emojis i typer, ikke slugs
- **Løsning**: Standardiser til slugs i `types/leads.ts`, map emojis i UI, normaliser input/output

### Import/Export Issues
- **TS2304**: Cannot find name → sjekk import-path
- **TS2307**: Cannot resolve module → sjekk fil eksisterer
- **TS6133**: Unused variable → fjern eller prefix med `_`

### Component Type Issues
- **TS2769**: No overload matches → sjekk props interface
- **TS2345**: Argument not assignable → sjekk type compatibility

## Runtime Errors

### Supabase
- **Row violates RLS**: user_id må være satt i INSERT
- **Invalid enum value**: DB enum bruker emojis, kode bruker slugs

### React
- **Cannot read property**: null/undefined check
- **Hook called conditionally**: flytt hooks øverst

## Database

### RLS Policies
- **Infinite recursion**: bruk security definer functions
- **Access denied**: sjekk policy conditions
- **Missing user context**: ensure auth.uid() works

### Migrations
- **Invalid enum**: map legacy values før type change
- **Column constraints**: nullable fields for optional data