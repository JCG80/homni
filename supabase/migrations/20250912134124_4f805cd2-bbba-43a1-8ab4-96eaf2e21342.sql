-- PHASE 0D: Final Security Policy Fixes
-- Fix column name issue and complete remaining security policies

-- Fix insurance companies with correct column name
DROP POLICY IF EXISTS "Public read published insurance companies" ON public.insurance_companies;
DROP POLICY IF EXISTS "Public can read published insurance companies" ON public.insurance_companies;
CREATE POLICY "Public can read published insurance companies" ON public.insurance_companies 
  FOR SELECT 
  USING (is_published = true);

-- Add missing authentication checks to remaining critical tables
-- Fix module access policies
DROP POLICY IF EXISTS "Authenticated users can view their own module access" ON public.module_access;
CREATE POLICY "Only authenticated users view own module access" ON public.module_access 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix user modules policies  
DROP POLICY IF EXISTS "Users can read their own module access" ON public.user_modules;
CREATE POLICY "Authenticated users read own module access" ON public.user_modules 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix role grants
DROP POLICY IF EXISTS "Users can view their own grants" ON public.role_grants;
CREATE POLICY "Authenticated users view own grants" ON public.role_grants 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Success log with correct target_kind
DO $$ 
BEGIN
  -- Only insert if we haven't already logged this phase
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_actions_log 
    WHERE action = 'security_hardening_phase_0d' 
    AND created_at > now() - INTERVAL '1 hour'
  ) THEN
    INSERT INTO public.admin_actions_log (
      target_kind, 
      action, 
      metadata
    ) VALUES (
      'system', 
      'security_hardening_phase_0d', 
      jsonb_build_object(
        'phase', 'Phase_0D_Final_Security_Fix',
        'description', 'Completed final RLS policy security hardening',
        'status', 'success',
        'timestamp', now()
      )
    );
  END IF;
END $$;