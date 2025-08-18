-- Create module_metadata table
CREATE TABLE IF NOT EXISTS public.module_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  dependencies TEXT[] DEFAULT '{}',
  feature_flags JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.module_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Module metadata is viewable by authenticated users" 
ON public.module_metadata 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins can modify module metadata" 
ON public.module_metadata 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'master_admin')
  )
);

-- Create feature_flags table  
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Feature flags are viewable by authenticated users" 
ON public.feature_flags 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins can modify feature flags" 
ON public.feature_flags 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'master_admin')
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_module_metadata_updated_at
BEFORE UPDATE ON public.module_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial feature flags
INSERT INTO public.feature_flags (name, description, is_enabled, target_roles) VALUES
('visitor_wizard_enabled', 'Enable 3-step visitor wizard on homepage', true, '{"guest"}'),
('lead_marketplace_enabled', 'Enable lead marketplace for companies', true, '{"company", "admin", "master_admin"}'),
('property_documentation_enabled', 'Enable property documentation module', false, '{"user", "company"}'),
('diy_sales_enabled', 'Enable DIY property sales module', false, '{"user"}')
ON CONFLICT (name) DO NOTHING;

-- Insert initial module metadata
INSERT INTO public.module_metadata (name, description, version, dependencies, active) VALUES
('lead-generation', 'Lead generation and marketplace (Bytt.no style)', '1.0.0', '{}', true),
('property-docs', 'Property documentation and maintenance (Boligmappa.no style)', '1.0.0', '{}', false),
('diy-sales', 'DIY property sales flow (Propr.no style)', '1.0.0', '{}', false),
('auth-system', 'Authentication and user management', '1.0.0', '{}', true),
('dashboard', 'Role-based dashboard system', '1.0.0', '{"auth-system"}', true)
ON CONFLICT (name) DO NOTHING;