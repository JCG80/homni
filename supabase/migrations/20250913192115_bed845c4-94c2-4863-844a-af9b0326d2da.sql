-- Fix Anonymous Access Policies - Corrected version without invalid column references

-- Fix insurance types: Remove anonymous access
DROP POLICY IF EXISTS "Authenticated users view insurance types" ON public.insurance_types;
DROP POLICY IF EXISTS "allow_anon_read_insurance_types" ON public.insurance_types;
CREATE POLICY "insurance_types_authenticated_only" ON public.insurance_types  
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Feature flags should only be readable by authenticated users (skip if no anonymous policies exist)
DROP POLICY IF EXISTS "Anyone can read feature flags" ON public.feature_flags;
CREATE POLICY "feature_flags_authenticated_read_only" ON public.feature_flags
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix maintenance_tasks: Remove anonymous access
DROP POLICY IF EXISTS "allow_anon_read_maintenance_tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "mt_read_all" ON public.maintenance_tasks;
CREATE POLICY "maintenance_tasks_authenticated_read" ON public.maintenance_tasks
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix insurance companies: Remove anonymous access  
DROP POLICY IF EXISTS "Public read published insurance companies" ON public.insurance_companies;
CREATE POLICY "insurance_companies_authenticated_read" ON public.insurance_companies
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix detached_buildings: Remove anonymous access
DROP POLICY IF EXISTS "Public can view detached buildings" ON public.detached_buildings;
CREATE POLICY "detached_buildings_authenticated_read" ON public.detached_buildings
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix document_categories: Require authentication
DROP POLICY IF EXISTS "Document categories are viewable by authenticated users" ON public.document_categories;
CREATE POLICY "document_categories_authenticated_only" ON public.document_categories
FOR SELECT USING (auth.uid() IS NOT NULL);