
-- 1) Leads: stram inn policies og fjern duplikater
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Drop eksisterende for å unngå dublikater/implicit TO public
  BEGIN DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Companies can view assigned leads" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Companies can view leads assigned to them" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END; -- rydde legacy-duplikat
  BEGIN DROP POLICY IF EXISTS "Companies can update their assigned leads" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Admins can update any lead" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

-- Behold anonym innsending separat (public). Reopprett eksplisitt for tydelighet (valgfritt):
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'leads' AND policyname = 'Anon can insert minimal lead'
  ) THEN
    CREATE POLICY "Anon can insert minimal lead"
      ON public.leads
      FOR INSERT
      TO public
      WITH CHECK (
        submitted_by IS NULL
        AND company_id IS NULL
        AND (
          status IS NULL
          OR status = ANY (ARRAY['new','qualified','contacted','negotiating','converted','lost','paused']::lead_status[])
        )
      );
  END IF;
END $$;

-- Reopprett policies med TO authenticated
CREATE POLICY "Users can create their own leads"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can view their own leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = submitted_by);

CREATE POLICY "Companies can view assigned leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'company'::app_role)
    AND company_id IS NOT NULL
    AND company_id = get_current_user_company_id()
  );

CREATE POLICY "Companies can update their assigned leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'company'::app_role)
    AND company_id = get_current_user_company_id()
  );

CREATE POLICY "Admins can view all leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'master_admin'::app_role)
  );

CREATE POLICY "Admins can update any lead"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'master_admin'::app_role)
  );

-- 2) Lead assignments
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Admins manage assignments" ON public.lead_assignments; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Buyers view assigned leads" ON public.lead_assignments; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Admins manage assignments"
  ON public.lead_assignments
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Buyers view assigned leads"
  ON public.lead_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles up
      WHERE up.id = auth.uid()
        AND (up.company_id)::text = (lead_assignments.buyer_id)::text
    )
  );

-- 3) Lead assignment history
ALTER TABLE public.lead_assignment_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Admins manage assignment history" ON public.lead_assignment_history; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Buyers view assignment history" ON public.lead_assignment_history; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Admins manage assignment history"
  ON public.lead_assignment_history
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Buyers view assignment history"
  ON public.lead_assignment_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.lead_assignments la
      JOIN public.user_profiles up ON (up.company_id)::text = (la.buyer_id)::text
      WHERE la.id = public.lead_assignment_history.assignment_id
        AND up.id = auth.uid()
    )
  );

-- 4) Buyer-kontoer og ledger
ALTER TABLE public.buyer_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Admins manage buyer accounts" ON public.buyer_accounts; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Buyers view own account" ON public.buyer_accounts; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Admins manage buyer accounts"
  ON public.buyer_accounts
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Buyers view own account"
  ON public.buyer_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND (up.company_id)::text = (buyer_accounts.id)::text
    )
  );

ALTER TABLE public.buyer_spend_ledger ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Admins manage spending" ON public.buyer_spend_ledger; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Buyers view own spending" ON public.buyer_spend_ledger; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Admins manage spending"
  ON public.buyer_spend_ledger
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Buyers view own spending"
  ON public.buyer_spend_ledger
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND (up.company_id)::text = (buyer_spend_ledger.buyer_id)::text
    )
  );

ALTER TABLE public.buyer_package_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Admins manage subscriptions" ON public.buyer_package_subscriptions; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Buyers view own subscriptions" ON public.buyer_package_subscriptions; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Admins manage subscriptions"
  ON public.buyer_package_subscriptions
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Buyers view own subscriptions"
  ON public.buyer_package_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND (up.company_id)::text = (buyer_package_subscriptions.buyer_id)::text
    )
  );

-- 5) Bruker/roller/moduler
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS user_profiles_admin_select_all ON public.user_profiles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS user_profiles_admin_update_all ON public.user_profiles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS user_profiles_insert_own ON public.user_profiles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS user_profiles_select_own ON public.user_profiles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS user_profiles_update_own ON public.user_profiles; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY user_profiles_admin_select_all
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (get_auth_user_role() IN ('admin','master_admin'));

CREATE POLICY user_profiles_admin_update_all
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (get_auth_user_role() IN ('admin','master_admin'))
  WITH CHECK (get_auth_user_role() IN ('admin','master_admin'));

CREATE POLICY user_profiles_insert_own
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY user_profiles_select_own
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY user_profiles_update_own
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Admins can manage all user modules" ON public.user_modules; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Users can view their own module access" ON public.user_modules; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Admins can manage all user modules"
  ON public.user_modules
  FOR ALL
  TO authenticated
  USING (get_auth_user_role() IN ('admin','master_admin'))
  WITH CHECK (get_auth_user_role() IN ('admin','master_admin'));

CREATE POLICY "Users can view their own module access"
  ON public.user_modules
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 6) Feature flags og system modules
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Feature flags are viewable by authenticated users" ON public.feature_flags; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Feature flags viewable by authenticated" ON public.feature_flags; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Only admins can manage feature flags" ON public.feature_flags; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Only admins can modify feature flags" ON public.feature_flags; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Feature flags viewable by authenticated"
  ON public.feature_flags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify feature flags"
  ON public.feature_flags
  FOR ALL
  TO authenticated
  USING (has_role_level(auth.uid(), 80))
  WITH CHECK (has_role_level(auth.uid(), 80));

ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Authenticated admins can manage system modules" ON public.system_modules; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Authenticated users can view system modules" ON public.system_modules; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Authenticated admins can manage system modules"
  ON public.system_modules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND (up.metadata->>'role') IN ('admin','master_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND (up.metadata->>'role') IN ('admin','master_admin')
    )
  );

CREATE POLICY "Authenticated users can view system modules"
  ON public.system_modules
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 7) Company profiles og admin logs (selektivt)
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Admins can update all company profiles" ON public.company_profiles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Admins can view all company profiles" ON public.company_profiles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Authenticated can view company profiles" ON public.company_profiles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Companies can update their own profile" ON public.company_profiles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Companies can view their own profile" ON public.company_profiles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Users can create their own company profile" ON public.company_profiles; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Users can update their own company profile" ON public.company_profiles; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Admins can view all company profiles"
  ON public.company_profiles
  FOR SELECT
  TO authenticated
  USING ( (SELECT user_profiles.metadata->>'role' FROM user_profiles WHERE user_profiles.id = auth.uid()) IN ('admin','master_admin') );

CREATE POLICY "Admins can update all company profiles"
  ON public.company_profiles
  FOR UPDATE
  TO authenticated
  USING ( (SELECT user_profiles.metadata->>'role' FROM user_profiles WHERE user_profiles.id = auth.uid()) IN ('admin','master_admin') )
  WITH CHECK ( (SELECT user_profiles.metadata->>'role' FROM user_profiles WHERE user_profiles.id = auth.uid()) IN ('admin','master_admin') );

CREATE POLICY "Authenticated can view company profiles"
  ON public.company_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Companies can view their own profile"
  ON public.company_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own company profile"
  ON public.company_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company profile"
  ON public.company_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Authenticated admins can manage admin logs" ON public.admin_logs; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Authenticated admins can manage admin logs"
  ON public.admin_logs
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- 8) Funksjon: fast search_path (linter)
CREATE OR REPLACE FUNCTION public.get_active_mode()
RETURNS text
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT NULLIF((current_setting('request.jwt.claims', true)::json->'app_metadata'->>'active_mode')::text, '');
$function$;

