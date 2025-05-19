
-- 1. First check if tables already exist before creating them (idempotent migrations)

-- user_modules table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_modules') THEN
    CREATE TABLE public.user_modules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      module_id UUID REFERENCES public.system_modules(id) ON DELETE CASCADE NOT NULL,
      is_enabled BOOLEAN DEFAULT true NOT NULL,
      settings JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      UNIQUE(user_id, module_id)
    );

    -- Create updated_at trigger
    CREATE TRIGGER set_user_modules_updated_at
    BEFORE UPDATE ON public.user_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

    -- Add comments
    COMMENT ON TABLE public.user_modules IS 'User-specific module settings and enablement status';
  END IF;
END $$;

-- service_modules table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'service_modules') THEN
    CREATE TABLE public.service_modules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service_id TEXT NOT NULL,
      module_id UUID REFERENCES public.system_modules(id) ON DELETE CASCADE NOT NULL,
      settings JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      UNIQUE(service_id, module_id)
    );

    -- Create updated_at trigger
    CREATE TRIGGER set_service_modules_updated_at
    BEFORE UPDATE ON public.service_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

    -- Add comments
    COMMENT ON TABLE public.service_modules IS 'Service-specific module configurations';
  END IF;
END $$;

-- module_dependencies table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'module_dependencies') THEN
    CREATE TABLE public.module_dependencies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      module_id UUID REFERENCES public.system_modules(id) ON DELETE CASCADE NOT NULL,
      dependency_id UUID REFERENCES public.system_modules(id) ON DELETE CASCADE NOT NULL,
      relationship_type TEXT NOT NULL DEFAULT 'requires',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      UNIQUE(module_id, dependency_id),
      CHECK (module_id != dependency_id) -- Prevent self-reference
    );

    -- Create updated_at trigger
    CREATE TRIGGER set_module_dependencies_updated_at
    BEFORE UPDATE ON public.module_dependencies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

    -- Add comments
    COMMENT ON TABLE public.module_dependencies IS 'Dependencies between system modules';
    COMMENT ON COLUMN public.module_dependencies.relationship_type IS 'Type of dependency relationship (e.g., requires, enhances, conflicts)';
  END IF;
END $$;

-- feature_flags table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feature_flags') THEN
    CREATE TABLE public.feature_flags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      is_enabled BOOLEAN DEFAULT false NOT NULL,
      percentage_rollout INTEGER DEFAULT 100 CHECK (percentage_rollout BETWEEN 0 AND 100),
      target_roles TEXT[] DEFAULT '{}'::TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );

    -- Create updated_at trigger
    CREATE TRIGGER set_feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

    -- Add comments
    COMMENT ON TABLE public.feature_flags IS 'Feature flags for controlling feature availability';
    COMMENT ON COLUMN public.feature_flags.percentage_rollout IS 'Percentage of users who should see this feature (0-100)';
    COMMENT ON COLUMN public.feature_flags.target_roles IS 'Specific user roles that should see this feature';
  END IF;
END $$;
