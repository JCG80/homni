-- Add FORCE RLS status checking function for Dev Doctor
CREATE OR REPLACE FUNCTION public.get_rls_status(tables text[])
RETURNS TABLE(table_name text, is_rls_enabled boolean, is_rls_forced boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.relname AS table_name,
    c.relrowsecurity AS is_rls_enabled,
    c.relforcerowsecurity AS is_rls_forced
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relname = ANY(tables);
$$;