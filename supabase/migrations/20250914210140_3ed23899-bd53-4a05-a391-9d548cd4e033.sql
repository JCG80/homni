-- Simple role system migration - no function conflicts
CREATE TABLE IF NOT EXISTS public._migration_log (
    id SERIAL PRIMARY KEY,
    migration_name TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN,
    error_message TEXT
);

-- Create enum if not exists
DO $$ 
BEGIN
    CREATE TYPE public.app_role AS ENUM ('guest', 'user', 'company', 'content_editor', 'admin', 'master_admin');
EXCEPTION WHEN duplicate_object THEN 
    NULL;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;

-- Create payment_records table
CREATE TABLE IF NOT EXISTS public.payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    transaction_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for payment_records  
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records FORCE ROW LEVEL SECURITY;

-- Simple role check function (no expires_at for now)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Basic policies using new function
CREATE POLICY "Users view own roles" ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

-- Payment policies
CREATE POLICY "Users read own payments" ON public.payment_records
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins read all payments" ON public.payment_records  
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

-- Secure sensitive tables
ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions_log FORCE ROW LEVEL SECURITY;

-- Drop dangerous anon policies
DROP POLICY IF EXISTS "deny_anon_admin_actions" ON public.admin_actions_log;
DROP POLICY IF EXISTS "block_anon_admin_actions" ON public.admin_actions_log;

CREATE POLICY "Admin log secure access" ON public.admin_actions_log
FOR SELECT TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin') OR actor_user_id = auth.uid());

-- Secure user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY "Profile secure access" ON public.user_profiles
FOR SELECT TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin') OR id = auth.uid());

-- Migrate existing roles from user_profiles
DO $$
BEGIN
    INSERT INTO public.user_roles (user_id, role, granted_at)
    SELECT user_id, role::public.app_role, created_at
    FROM public.user_profiles 
    WHERE role IS NOT NULL AND user_id IS NOT NULL AND role <> 'guest'
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public._migration_log (migration_name, success) VALUES ('migrate_roles', TRUE);
EXCEPTION WHEN others THEN
    INSERT INTO public._migration_log (migration_name, success, error_message) VALUES ('migrate_roles', FALSE, SQLERRM);
END $$;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON public.payment_records(user_id);

INSERT INTO public._migration_log (migration_name, success) VALUES ('role_system_simple', TRUE);