-- Continue security hardening: Fix more critical admin table policies (corrected syntax)
-- Focus on tables with sensitive admin/system data

-- 1. Fix user_profiles - should deny anonymous access to user data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to user_profiles' AND tablename = 'user_profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to user_profiles" ON public.user_profiles FOR ALL TO anon USING (false)';
  END IF;
END $$;

-- 2. Fix user_roles - should deny anonymous access to role management
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to user_roles' AND tablename = 'user_roles'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to user_roles" ON public.user_roles FOR ALL TO anon USING (false)';
  END IF;
END $$;

-- 3. Fix role_grants - should deny anonymous access to role grants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to role_grants' AND tablename = 'role_grants'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to role_grants" ON public.role_grants FOR ALL TO anon USING (false)';
  END IF;
END $$;

-- 4. Fix user_modules - should deny anonymous access to module management
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to user_modules' AND tablename = 'user_modules'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to user_modules" ON public.user_modules FOR ALL TO anon USING (false)';
  END IF;
END $$;

-- 5. Fix system_modules - should deny anonymous access to system configuration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to system_modules' AND tablename = 'system_modules'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to system_modules" ON public.system_modules FOR ALL TO anon USING (false)';
  END IF;
END $$;

-- 6. Fix feature_flags - should deny anonymous access to feature configuration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to feature_flags' AND tablename = 'feature_flags'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to feature_flags" ON public.feature_flags FOR ALL TO anon USING (false)';
  END IF;
END $$;

-- 7. Fix company_profiles - should deny anonymous access to company data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to company_profiles' AND tablename = 'company_profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to company_profiles" ON public.company_profiles FOR ALL TO anon USING (false)';
  END IF;
END $$;

-- 8. Fix todos - should deny anonymous access to user todos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to todos' AND tablename = 'todos'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to todos" ON public.todos FOR ALL TO anon USING (false)';
  END IF;
END $$;