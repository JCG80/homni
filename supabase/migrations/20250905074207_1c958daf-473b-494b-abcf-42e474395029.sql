-- Database Audit & Normalization Migration

-- A) Set user_id = id where missing
UPDATE public.user_profiles 
SET user_id = id 
WHERE user_id IS NULL;

-- B) Normalize roles from metadata (canonical roles only)
UPDATE public.user_profiles up
SET role = COALESCE(
  CASE LOWER(NULLIF(up.metadata->>'role',''))
    WHEN 'anonymous' THEN 'guest'
    WHEN 'member' THEN 'user'
    WHEN 'business' THEN 'company'
    WHEN 'provider' THEN 'company'
    WHEN 'editor' THEN 'content_editor'
    WHEN 'super_admin' THEN 'master_admin'
    ELSE LOWER(NULLIF(up.metadata->>'role',''))
  END, 'user'
)
WHERE up.role IS NULL;

-- C) Mirror account_type in metadata for clarity
UPDATE public.user_profiles 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'),
  '{account_type}',
  CASE WHEN company_id IS NOT NULL THEN '"company"' ELSE '"user"' END::jsonb
)
WHERE metadata->>'account_type' IS NULL OR metadata->>'account_type' != CASE WHEN company_id IS NOT NULL THEN 'company' ELSE 'user' END;

-- D) Create company_profiles for company-role users without company_id
WITH need_company AS (
  SELECT id, full_name FROM public.user_profiles 
  WHERE role='company' AND company_id IS NULL
),
new_companies AS (
  INSERT INTO public.company_profiles (id, user_id, name, status, subscription_plan, contact_name)
  SELECT 
    gen_random_uuid() as id,
    nc.id as user_id,
    COALESCE(nc.full_name || ' AS', 'Test Company ' || substr(nc.id::text,1,6)) as name,
    'active' as status,
    'free' as subscription_plan,
    nc.full_name as contact_name
  FROM need_company nc
  RETURNING id, user_id
)
UPDATE public.user_profiles up
SET 
  company_id = nc.id,
  metadata = jsonb_set(COALESCE(metadata, '{}'), '{account_type}', '"company"')
FROM new_companies nc
WHERE up.id = nc.user_id;

-- E) Add validation trigger for role consistency
CREATE OR REPLACE FUNCTION public.validate_user_role_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure the role is canonical
  IF NEW.role NOT IN ('guest', 'user', 'company', 'content_editor', 'admin', 'master_admin') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be one of: guest, user, company, content_editor, admin, master_admin', NEW.role;
  END IF;
  
  -- Ensure user_id = id
  IF NEW.user_id != NEW.id THEN
    NEW.user_id := NEW.id;
  END IF;
  
  -- Auto-set account_type in metadata
  NEW.metadata := jsonb_set(
    COALESCE(NEW.metadata, '{}'),
    '{account_type}',
    CASE WHEN NEW.company_id IS NOT NULL THEN '"company"' ELSE '"user"' END::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply trigger to user_profiles
DROP TRIGGER IF EXISTS validate_user_role_consistency ON public.user_profiles;
CREATE TRIGGER validate_user_role_consistency
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_role_consistency();