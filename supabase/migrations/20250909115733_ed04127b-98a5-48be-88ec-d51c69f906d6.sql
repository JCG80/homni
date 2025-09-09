-- Phase 1: Database cleanup & standardization for modules
-- 1) System modules data normalization (trim fields, ensure arrays not null)
UPDATE public.system_modules
SET 
  name = btrim(name),
  description = NULLIF(btrim(description), ''),
  route = NULLIF(btrim(route), ''),
  ui_component = NULLIF(btrim(ui_component), ''),
  icon = NULLIF(btrim(icon), ''),
  updated_at = now()
WHERE TRUE
  AND (
    name <> btrim(name)
    OR (description IS NOT NULL AND description <> btrim(description))
    OR (route IS NOT NULL AND route <> btrim(route))
    OR (ui_component IS NOT NULL AND ui_component <> btrim(ui_component))
    OR (icon IS NOT NULL AND icon <> btrim(icon))
  );

UPDATE public.system_modules
SET dependencies = '{}'::text[]
WHERE dependencies IS NULL;

-- 2) Remove duplicate system modules by case-insensitive name (keep oldest by created_at, fallback to smallest id)
WITH ranked AS (
  SELECT 
    id,
    name,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY lower(name)
      ORDER BY created_at NULLS LAST, id
    ) AS rn
  FROM public.system_modules
), dupes AS (
  SELECT id FROM ranked WHERE rn > 1
)
DELETE FROM public.system_modules sm
USING dupes d
WHERE sm.id = d.id;

-- 3) Enforce uniqueness on name (case-insensitive) and add performance index
CREATE UNIQUE INDEX IF NOT EXISTS ux_system_modules_name_ci
  ON public.system_modules (lower(name));

CREATE INDEX IF NOT EXISTS idx_system_modules_active_order
  ON public.system_modules (is_active, sort_order, name);

-- 4) Auto-update updated_at on changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_system_modules_updated_at'
  ) THEN
    CREATE TRIGGER trg_system_modules_updated_at
    BEFORE UPDATE ON public.system_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 5) user_modules hygiene: prevent duplicates and add helpful indexes (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_modules'
  ) THEN
    -- Deduplicate (user_id, module_id)
    WITH ranked AS (
      SELECT id, user_id, module_id,
             ROW_NUMBER() OVER (PARTITION BY user_id, module_id ORDER BY id) rn
      FROM public.user_modules
    ), dupes AS (
      SELECT id FROM ranked WHERE rn > 1
    )
    DELETE FROM public.user_modules t USING dupes d WHERE t.id = d.id;

    -- Unique pair constraint
    CREATE UNIQUE INDEX IF NOT EXISTS ux_user_modules_user_module
      ON public.user_modules (user_id, module_id);

    -- Performance indexes for typical queries
    CREATE INDEX IF NOT EXISTS idx_user_modules_user_enabled
      ON public.user_modules (user_id, is_enabled);

    CREATE INDEX IF NOT EXISTS idx_user_modules_module
      ON public.user_modules (module_id);
  END IF;
END$$;

-- 6) Optional normalization: collapse empty strings to NULLs for description/route/ui_component/icon
UPDATE public.system_modules
SET 
  description = NULLIF(description, ''),
  route = NULLIF(route, ''),
  ui_component = NULLIF(ui_component, ''),
  icon = NULLIF(icon, '')
WHERE TRUE;