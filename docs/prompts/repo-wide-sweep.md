# Repo-wide Sweep (obligatorisk før merge)

Du skal jobbe **repo-omfattende**, ikke kun på aktiv route. Utfør:

1) **Kartlegg påvirkning**
   - List alle filer som refererer til endringen (komponent/hook/type/SQL).
   - Søk: imports, typer, API-kall, SQL-funksjoner, migrasjoner.

2) **Gjør endringen repo-wide**
   - Oppdater alle kallsteder (ikke bare aktuell rute).
   - Unngå duplikater/casing-konflikter; pek imports til én kilde.
   - Mangler? Scaffold minimal stub (service/hook/SQL) + TODO + test.

3) **Database**
   - RLS: default deny + owner-policy for berørte tabeller.
   - Funksjoner: `SECURITY DEFINER` + `SET search_path = public`.
   - Migrasjoner har alltid `_down.sql`.

4) **Helsesjekk før PR**
   - `npm run repo:health` → må være grønt (typecheck, build, unit, duplikater, RLS/func/migrations).
   - Kjør E2E hvis endringen treffer sluttbrukerflyt.

5) **PR-leveranse**
   - Hva/hvorfor, liste over oppdaterte filer, beslutninger ved duplikater.
   - Testlogg, skjermbilder/GIF om UI.