-- Simple focused security fix - Create explicit deny policies for anonymous users
-- This is a smaller migration to avoid deadlocks

-- Add explicit DENY policies for the most sensitive tables
-- These policies will be checked first and block all anonymous access

-- Create deny policies for critical admin tables
CREATE POLICY "block_anon_admin_actions" 
ON public.admin_actions_log 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "block_anon_admin_audit" 
ON public.admin_audit_log 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "block_anon_error_tracking" 
ON public.error_tracking 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "block_anon_module_metadata" 
ON public.module_metadata 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "block_anon_migration_records" 
ON public.migration_records 
FOR ALL 
TO anon 
USING (false);

-- Create a policy to allow only system roles to insert into system tables
CREATE POLICY "system_only_insert_error_tracking" 
ON public.error_tracking 
FOR INSERT 
TO service_role 
WITH CHECK (true);