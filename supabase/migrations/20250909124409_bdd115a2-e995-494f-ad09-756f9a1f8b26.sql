-- Phase 1B: Initialize user module access and enhance admin functionality (Fixed)

-- First, create audit logging table for module access changes
CREATE TABLE IF NOT EXISTS public.module_access_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  admin_user_id uuid,
  module_id uuid NOT NULL,
  action text NOT NULL, -- 'granted', 'revoked', 'auto_assigned'
  reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.module_access_audit ENABLE ROW LEVEL SECURITY;

-- Create policies for audit table
CREATE POLICY "Admins can view all audit logs"
ON public.module_access_audit
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('admin', 'master_admin')
  )
);

CREATE POLICY "System can insert audit logs"
ON public.module_access_audit
FOR INSERT
WITH CHECK (true);

-- Function to get role-based default modules
CREATE OR REPLACE FUNCTION public.get_role_default_modules(user_role text)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  module_ids uuid[];
BEGIN
  CASE user_role
    WHEN 'master_admin' THEN
      -- Master admins get ALL modules
      SELECT ARRAY(SELECT id FROM system_modules WHERE is_active = true)
      INTO module_ids;
    
    WHEN 'admin' THEN
      -- Admins get admin and core modules
      SELECT ARRAY(SELECT id FROM system_modules 
                   WHERE is_active = true 
                   AND category IN ('admin', 'core', 'content'))
      INTO module_ids;
    
    WHEN 'content_editor' THEN
      -- Content editors get core and content modules
      SELECT ARRAY(SELECT id FROM system_modules 
                   WHERE is_active = true 
                   AND category IN ('core', 'content'))
      INTO module_ids;
    
    WHEN 'company' THEN
      -- Companies get core and company modules
      SELECT ARRAY(SELECT id FROM system_modules 
                   WHERE is_active = true 
                   AND category IN ('core', 'company'))
      INTO module_ids;
    
    WHEN 'user' THEN
      -- Regular users get core modules only
      SELECT ARRAY(SELECT id FROM system_modules 
                   WHERE is_active = true 
                   AND category = 'core')
      INTO module_ids;
    
    ELSE
      -- Guests and unknown roles get no modules
      module_ids := ARRAY[]::uuid[];
  END CASE;
  
  RETURN COALESCE(module_ids, ARRAY[]::uuid[]);
END;
$$;

-- Function to initialize user module access (Fixed variable naming)
CREATE OR REPLACE FUNCTION public.initialize_user_module_access(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
  default_modules uuid[];
  current_module_id uuid;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM user_profiles WHERE id = target_user_id;
  
  IF user_role IS NULL THEN
    user_role := 'user'; -- Default role
  END IF;
  
  -- Get default modules for this role
  SELECT public.get_role_default_modules(user_role) INTO default_modules;
  
  -- Insert module access (ignore conflicts for existing records)
  FOREACH current_module_id IN ARRAY default_modules
  LOOP
    INSERT INTO user_modules (user_id, module_id, is_enabled)
    VALUES (target_user_id, current_module_id, true)
    ON CONFLICT (user_id, module_id) 
    DO UPDATE SET is_enabled = true;
    
    -- Log the auto-assignment
    INSERT INTO module_access_audit (user_id, module_id, action, reason, metadata)
    VALUES (
      target_user_id, 
      current_module_id, 
      'auto_assigned', 
      'Role-based default access',
      jsonb_build_object('role', user_role, 'initialized_at', now())
    );
  END LOOP;
END;
$$;

-- Bulk function to update user module access with audit logging
CREATE OR REPLACE FUNCTION public.bulk_update_user_module_access(
  target_user_id uuid,
  module_ids uuid[],
  enable_access boolean,
  admin_id uuid DEFAULT auth.uid(),
  reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_module_id uuid;
  action_type text;
BEGIN
  -- Determine action type
  action_type := CASE WHEN enable_access THEN 'granted' ELSE 'revoked' END;
  
  -- Process each module
  FOREACH current_module_id IN ARRAY module_ids
  LOOP
    -- Update or insert access
    INSERT INTO user_modules (user_id, module_id, is_enabled)
    VALUES (target_user_id, current_module_id, enable_access)
    ON CONFLICT (user_id, module_id)
    DO UPDATE SET is_enabled = enable_access, updated_at = now();
    
    -- Log the change
    INSERT INTO module_access_audit (
      user_id, admin_user_id, module_id, action, reason, metadata
    )
    VALUES (
      target_user_id,
      admin_id,
      current_module_id,
      action_type,
      reason,
      jsonb_build_object('bulk_operation', true, 'changed_at', now())
    );
  END LOOP;
END;
$$;

-- Function to get modules by category for a user
CREATE OR REPLACE FUNCTION public.get_user_modules_by_category(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  category text,
  modules jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.category,
    jsonb_agg(
      jsonb_build_object(
        'id', sm.id,
        'name', sm.name,
        'description', sm.description,
        'icon', sm.icon,
        'route', sm.route,
        'sort_order', sm.sort_order,
        'has_access', COALESCE(um.is_enabled, false)
      )
      ORDER BY sm.sort_order, sm.name
    ) as modules
  FROM system_modules sm
  LEFT JOIN user_modules um ON sm.id = um.module_id AND um.user_id = target_user_id
  WHERE sm.is_active = true
  GROUP BY sm.category
  ORDER BY 
    CASE sm.category
      WHEN 'admin' THEN 1
      WHEN 'core' THEN 2  
      WHEN 'content' THEN 3
      WHEN 'company' THEN 4
      ELSE 5
    END;
END;
$$;

-- Initialize module access for ALL existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id FROM user_profiles WHERE deleted_at IS NULL
  LOOP
    PERFORM public.initialize_user_module_access(user_record.id);
  END LOOP;
END;
$$;

-- Create trigger to auto-initialize module access for new users
CREATE OR REPLACE FUNCTION public.auto_initialize_user_modules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Initialize module access when a new user profile is created
  PERFORM public.initialize_user_module_access(NEW.id);
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS auto_initialize_user_modules_trigger ON public.user_profiles;
CREATE TRIGGER auto_initialize_user_modules_trigger
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_initialize_user_modules();

-- Add indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_module_access_audit_user_id ON public.module_access_audit(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_module_access_audit_created_at ON public.module_access_audit(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_modules_category ON public.system_modules(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_modules_composite ON public.user_modules(user_id, module_id, is_enabled);