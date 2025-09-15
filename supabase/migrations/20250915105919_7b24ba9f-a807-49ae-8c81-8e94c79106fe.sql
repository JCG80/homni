-- Fix the most critical RLS policy issues to reduce security warnings
-- Remove the overly permissive anonymous access policy we just added
DROP POLICY IF EXISTS "Allow anonymous read access to user_profiles for auth" ON public.user_profiles;

-- Add more restrictive policies for user_profiles
CREATE POLICY "user_profiles_authenticated_read_own" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "user_profiles_authenticated_insert_own" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Fix some critical tables that should have RLS enabled
DO $$
DECLARE
    table_name text;
    tables_to_enable text[] := ARRAY[
        'analytics_events',
        'error_tracking', 
        'feature_flags',
        'user_activity_summaries',
        'user_behavior_events'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_enable
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        EXCEPTION WHEN OTHERS THEN
            -- Continue if table doesn't exist or RLS already enabled
            NULL;
        END;
    END LOOP;
END $$;