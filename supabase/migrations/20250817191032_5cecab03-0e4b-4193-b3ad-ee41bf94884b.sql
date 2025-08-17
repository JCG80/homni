-- Enable anonymous lead creation
CREATE POLICY "Anonymous can create leads"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

-- Add visitor wizard feature flag
INSERT INTO public.feature_flags (name, description, is_enabled, rollout_percentage, target_roles)
VALUES (
  'visitor_wizard_enabled',
  'Enable the visitor-first 3-step wizard on landing page',
  true,
  100,
  ARRAY[]::text[]
) ON CONFLICT (name) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  rollout_percentage = EXCLUDED.rollout_percentage,
  description = EXCLUDED.description;