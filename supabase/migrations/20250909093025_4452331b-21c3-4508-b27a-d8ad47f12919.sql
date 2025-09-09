-- Create a test internal admin user profile for development/testing
-- Note: This will only work if there's already a user with this email in auth.users

-- First, let's create a function to safely set internal admin status
CREATE OR REPLACE FUNCTION public.set_internal_admin_status(user_email text, is_admin boolean DEFAULT true)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record record;
  result_msg text;
BEGIN
  -- Only master_admin can call this function
  IF NOT (get_auth_user_role() = 'master_admin') THEN
    RAISE EXCEPTION 'Access denied: Only master admins can set internal admin status';
  END IF;
  
  -- Find user by email in user_profiles
  SELECT * INTO user_record 
  FROM public.user_profiles 
  WHERE email = user_email 
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Update the user's metadata to set internal_admin flag
  UPDATE public.user_profiles 
  SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('internal_admin', is_admin),
      updated_at = now()
  WHERE id = user_record.id;
  
  IF is_admin THEN
    result_msg := 'Successfully granted internal admin access to: ' || user_email;
  ELSE
    result_msg := 'Successfully revoked internal admin access from: ' || user_email;
  END IF;
  
  RETURN result_msg;
END;
$$;

-- Grant some test system modules for development
INSERT INTO public.system_modules (name, description, is_active, route, ui_component, icon)
VALUES 
  ('User Management', 'Manage users and their profiles', true, '/admin/users', 'UserManagementComponent', 'Users'),
  ('Company Management', 'Manage company profiles and settings', true, '/admin/companies', 'CompanyManagementComponent', 'Building'),
  ('Lead Management', 'Manage leads and lead distribution', true, '/admin/leads', 'LeadManagementComponent', 'Target'),
  ('Analytics Dashboard', 'View system analytics and reports', true, '/admin/analytics', 'AnalyticsComponent', 'BarChart3'),
  ('System Settings', 'Configure system-wide settings', true, '/admin/settings', 'SettingsComponent', 'Settings')
ON CONFLICT (name) DO NOTHING;