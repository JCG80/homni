-- Lead Marketplace Migration UP (Fixed)
-- ENUM for pipeline-stage
DO $$ BEGIN
  CREATE TYPE pipeline_stage AS ENUM ('new','working','won','lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Leads (enhance existing or create)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NULL,
  role text CHECK (role IN ('user','company')) NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  source text,
  user_id uuid NULL,
  title text,
  description text,
  category text,
  status text DEFAULT 'new'
);

-- Buyer accounts (peker mot company/user)
CREATE TABLE IF NOT EXISTS public.buyer_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NULL,
  user_id uuid NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Pakker (Admin konfig)
CREATE TABLE IF NOT EXISTS public.lead_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  priority int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Kjøpers påmelding + budsjett
CREATE TABLE IF NOT EXISTS public.buyer_package_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES public.buyer_accounts(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.lead_packages(id) ON DELETE CASCADE,
  auto_buy boolean NOT NULL DEFAULT false,
  daily_cap_cents integer NOT NULL DEFAULT 0 CHECK (daily_cap_cents >= 0),
  monthly_cap_cents integer NOT NULL DEFAULT 0 CHECK (monthly_cap_cents >= 0),
  is_paused boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (buyer_id, package_id)
);

-- Tildelinger (lead → buyer), inkl. pipeline
CREATE TABLE IF NOT EXISTS public.lead_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES public.buyer_accounts(id) ON DELETE CASCADE,
  package_id uuid NULL REFERENCES public.lead_packages(id) ON DELETE SET NULL,
  price_cents integer NOT NULL DEFAULT 0,
  is_purchased boolean NOT NULL DEFAULT false,
  purchased_at timestamptz NULL,
  pipeline_stage pipeline_stage NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lead_id, buyer_id)
);

-- Økonomi-logg
CREATE TABLE IF NOT EXISTS public.buyer_spend_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES public.buyer_accounts(id) ON DELETE CASCADE,
  assignment_id uuid NULL REFERENCES public.lead_assignments(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL, -- negativt ved kjøp, positivt ved kreditering
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Touch trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$$;

DROP TRIGGER IF EXISTS t_touch_pkg ON public.lead_packages;
CREATE TRIGGER t_touch_pkg BEFORE UPDATE ON public.lead_packages
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS t_touch_assign ON public.lead_assignments;
CREATE TRIGGER t_touch_assign BEFORE UPDATE ON public.lead_assignments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- === RLS ===
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_package_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_spend_ledger ENABLE ROW LEVEL SECURITY;

-- Leads: anon kan insert (fra publikum), admin kan alt
DROP POLICY IF EXISTS lead_insert_public ON public.leads;
CREATE POLICY lead_insert_public ON public.leads
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS lead_admin_all ON public.leads;
CREATE POLICY lead_admin_all ON public.leads
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'master_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'master_admin'::public.app_role));

-- Pakker: admin full, authenticated read
DROP POLICY IF EXISTS pkg_admin_all ON public.lead_packages;
CREATE POLICY pkg_admin_all ON public.lead_packages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'master_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'master_admin'::public.app_role));

DROP POLICY IF EXISTS pkg_read_auth ON public.lead_packages;
CREATE POLICY pkg_read_auth ON public.lead_packages
  FOR SELECT TO authenticated USING (active=true);

-- Buyer konti & påmeldinger: admin full, eier read/write
DROP POLICY IF EXISTS buyer_admin_all ON public.buyer_accounts;
CREATE POLICY buyer_admin_all ON public.buyer_accounts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'master_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'master_admin'::public.app_role));

DROP POLICY IF EXISTS buyer_owner_rw ON public.buyer_accounts;
CREATE POLICY buyer_owner_rw ON public.buyer_accounts
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS sub_owner_rw ON public.buyer_package_subscriptions;
CREATE POLICY sub_owner_rw ON public.buyer_package_subscriptions
  FOR ALL TO authenticated
  USING (buyer_id IN (SELECT id FROM public.buyer_accounts WHERE user_id=auth.uid()))
  WITH CHECK (buyer_id IN (SELECT id FROM public.buyer_accounts WHERE user_id=auth.uid()));

-- Assignments: admin full, kjøper rw egne
DROP POLICY IF EXISTS assign_admin_all ON public.lead_assignments;
CREATE POLICY assign_admin_all ON public.lead_assignments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'master_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'master_admin'::public.app_role));

DROP POLICY IF EXISTS assign_owner_rw ON public.lead_assignments;
CREATE POLICY assign_owner_rw ON public.lead_assignments
  FOR ALL TO authenticated
  USING (buyer_id IN (SELECT id FROM public.buyer_accounts WHERE user_id=auth.uid()))
  WITH CHECK (buyer_id IN (SELECT id FROM public.buyer_accounts WHERE user_id=auth.uid()));

-- Ledger: admin full, kjøper read egne
DROP POLICY IF EXISTS ledger_admin_all ON public.buyer_spend_ledger;
CREATE POLICY ledger_admin_all ON public.buyer_spend_ledger
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'master_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'master_admin'::public.app_role));

DROP POLICY IF EXISTS ledger_owner_r ON public.buyer_spend_ledger;
CREATE POLICY ledger_owner_r ON public.buyer_spend_ledger
  FOR SELECT TO authenticated
  USING (buyer_id IN (SELECT id FROM public.buyer_accounts WHERE user_id=auth.uid()));

-- === FUNKSJONER ===
-- Budsjett-sjekk (dag/mnd)
CREATE OR REPLACE FUNCTION public.has_budget(buyer uuid, price int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  daily_spent int;
  monthly_spent int;
  daily_cap int;
  monthly_cap int;
BEGIN
  SELECT COALESCE(SUM(-amount_cents),0) INTO daily_spent
  FROM buyer_spend_ledger WHERE buyer_id=buyer AND amount_cents<0 AND created_at::date = now()::date;

  SELECT COALESCE(SUM(-amount_cents),0) INTO monthly_spent
  FROM buyer_spend_ledger WHERE buyer_id=buyer AND amount_cents<0 AND date_trunc('month', created_at)=date_trunc('month', now());

  SELECT s.daily_cap_cents, s.monthly_cap_cents INTO daily_cap, monthly_cap
  FROM buyer_package_subscriptions s
  WHERE s.buyer_id=buyer
  ORDER BY created_at DESC LIMIT 1;

  IF daily_cap = 0 THEN daily_cap := 2147483647; END IF;
  IF monthly_cap = 0 THEN monthly_cap := 2147483647; END IF;

  RETURN (daily_spent + price) <= daily_cap AND (monthly_spent + price) <= monthly_cap;
END;
$$;

-- Distribusjon: enkel stub (match alle aktive pakker; TODO: filtrering på rules)
CREATE OR REPLACE FUNCTION public.distribute_new_lead(p_lead uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pkg record;
  sub record;
  assignment_id uuid;
BEGIN
  FOR pkg IN SELECT * FROM lead_packages WHERE active=true ORDER BY priority LOOP
    FOR sub IN
      SELECT s.*, b.id as bid FROM buyer_package_subscriptions s
      JOIN buyer_accounts b ON b.id = s.buyer_id
      WHERE s.package_id = pkg.id AND s.is_paused = false
    LOOP
      -- skip om allerede tildelt denne kjøperen
      IF EXISTS (SELECT 1 FROM lead_assignments WHERE lead_id=p_lead AND buyer_id=sub.bid) THEN
        CONTINUE;
      END IF;

      INSERT INTO lead_assignments (lead_id, buyer_id, package_id, price_cents)
      VALUES (p_lead, sub.bid, pkg.id, pkg.price_cents)
      RETURNING id INTO assignment_id;

      -- auto-buy hvis mulig
      IF sub.auto_buy AND public.has_budget(sub.bid, pkg.price_cents) THEN
        UPDATE lead_assignments SET is_purchased=true, purchased_at=now() WHERE id=assignment_id;
        INSERT INTO buyer_spend_ledger (buyer_id, assignment_id, amount_cents, reason)
        VALUES (sub.bid, assignment_id, -pkg.price_cents, 'auto_buy');
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- Trigger på leads
DROP TRIGGER IF EXISTS t_distribute_on_lead ON public.leads;
CREATE TRIGGER t_distribute_on_lead
AFTER INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.distribute_new_lead(NEW.id);