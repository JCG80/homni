
-- Alter existing tables to support feature toggles and extended metadata

-- 1. Add feature_flags_enabled to system_modules if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'system_modules' 
                AND column_name = 'feature_flags_enabled') THEN
    ALTER TABLE public.system_modules 
    ADD COLUMN feature_flags_enabled BOOLEAN DEFAULT false;
    
    COMMENT ON COLUMN public.system_modules.feature_flags_enabled IS 'Whether this module uses feature flags';
  END IF;
END $$;

-- 2. Add extended_metadata to system_modules if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'system_modules' 
                AND column_name = 'extended_metadata') THEN
    ALTER TABLE public.system_modules 
    ADD COLUMN extended_metadata JSONB DEFAULT '{}'::jsonb;
    
    COMMENT ON COLUMN public.system_modules.extended_metadata IS 'Additional module configuration and metadata';
  END IF;
END $$;

-- 3. Add feature_preferences to user_profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'user_profiles' 
                AND column_name = 'feature_preferences') THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN feature_preferences JSONB DEFAULT '{}'::jsonb;
    
    COMMENT ON COLUMN public.user_profiles.feature_preferences IS 'User preferences for feature flags and experimental features';
  END IF;
END $$;

-- 4. Add feature_metadata to leads if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'leads' 
                AND column_name = 'feature_metadata') THEN
    ALTER TABLE public.leads 
    ADD COLUMN feature_metadata JSONB DEFAULT '{}'::jsonb;
    
    COMMENT ON COLUMN public.leads.feature_metadata IS 'Feature-specific metadata for lead processing';
  END IF;
END $$;
