-- Phase 1 Continued: Module consolidation & categorization

-- 1) Add category field to system_modules for better organization
ALTER TABLE public.system_modules 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';

-- 2) Consolidate duplicate modules - keep the better ones with proper naming/icons
-- Keep newer/better named modules, merge metadata from old ones

-- Delete old 'admin' in favor of newer admin modules
DELETE FROM public.system_modules WHERE name = 'admin' AND route = '/admin';

-- Delete old 'leads' in favor of 'Lead Management' 
DELETE FROM public.system_modules WHERE name = 'leads' AND route = '/leads';

-- Delete old 'Settings' in favor of 'System Settings'
DELETE FROM public.system_modules WHERE name = 'Settings' AND route IS NULL;

-- Delete old 'Users' in favor of 'User Management' 
DELETE FROM public.system_modules WHERE name = 'Users' AND route IS NULL;

-- Delete old 'content' - will be handled by admin panel
DELETE FROM public.system_modules WHERE name = 'content' AND route = '/content';

-- Delete old 'dashboard' - will be handled by home
DELETE FROM public.system_modules WHERE name = 'dashboard' AND route = '/dashboard';

-- 3) Standardize remaining modules with proper names, icons, categories, and sort order
UPDATE public.system_modules 
SET 
  name = 'Analytics Dashboard',
  description = 'View system analytics and user engagement reports',
  icon = 'BarChart3',
  category = 'admin',
  sort_order = 20,
  updated_at = now()
WHERE name = 'Analytics Dashboard';

UPDATE public.system_modules 
SET 
  name = 'Company Management', 
  description = 'Manage company profiles and business settings',
  icon = 'Building',
  category = 'admin',
  sort_order = 30,
  updated_at = now()
WHERE name = 'Company Management';

UPDATE public.system_modules 
SET 
  name = 'Lead Management',
  description = 'Manage leads, distribution, and assignments',
  icon = 'Target', 
  category = 'admin',
  sort_order = 10,
  updated_at = now()
WHERE name = 'Lead Management';

UPDATE public.system_modules 
SET 
  name = 'System Settings',
  description = 'Configure system-wide settings and preferences',
  icon = 'Settings',
  category = 'admin', 
  sort_order = 50,
  updated_at = now()
WHERE name = 'System Settings';

UPDATE public.system_modules 
SET 
  name = 'User Management',
  description = 'Manage user accounts, roles, and permissions',
  icon = 'Users',
  category = 'admin',
  sort_order = 40,
  updated_at = now()
WHERE name = 'User Management';

UPDATE public.system_modules 
SET 
  name = 'Home Dashboard',
  description = 'Main dashboard with overview and navigation',
  icon = 'Home',
  category = 'core',
  route = '/',
  sort_order = 1,
  updated_at = now()
WHERE name = 'home';

-- 4) Create enhanced database functions for module access with caching
CREATE OR REPLACE FUNCTION public.get_user_modules_with_category(user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid, 
  name text, 
  description text, 
  route text, 
  icon text, 
  category text, 
  sort_order integer,
  is_enabled boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.id,
    sm.name,
    sm.description,
    sm.route,
    sm.icon,
    sm.category,
    sm.sort_order,
    COALESCE(um.is_enabled, false) as is_enabled
  FROM system_modules sm
  LEFT JOIN user_modules um ON sm.id = um.module_id AND um.user_id = user_id
  WHERE sm.is_active = true
  ORDER BY sm.category, sm.sort_order, sm.name;
END;
$$;

CREATE OR REPLACE FUNCTION public.bulk_check_module_access(module_names text[], user_id uuid DEFAULT auth.uid())
RETURNS TABLE(module_name text, has_access boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH modules AS (
    SELECT unnest(module_names) as name
  )
  SELECT 
    m.name,
    COALESCE(
      EXISTS (
        SELECT 1 FROM user_modules um
        JOIN system_modules sm ON um.module_id = sm.id
        WHERE um.user_id = user_id 
        AND sm.name = m.name
        AND um.is_enabled = true
        AND sm.is_active = true
      ),
      false
    ) as has_access
  FROM modules m;
END;
$$;