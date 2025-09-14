-- Continue fixing critical security issues by replacing problematic authenticated policies
-- Focus on explicit auth.uid() checks instead of role-based policies that may allow anon

-- 1. Replace localization policies to be more restrictive
DROP POLICY IF EXISTS "Everyone can view localization entries" ON public.localization_entries;
CREATE POLICY "Authenticated users can view localization entries"
ON public.localization_entries 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Fix lead_pricing_tiers - remove public access
DROP POLICY IF EXISTS "Everyone can view active pricing tiers" ON public.lead_pricing_tiers;
CREATE POLICY "Authenticated users can view active pricing tiers"
ON public.lead_pricing_tiers 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- 3. Fix company_reviews - remove anonymous viewing
DROP POLICY IF EXISTS "Anyone can view company reviews" ON public.company_reviews;
CREATE POLICY "Authenticated users can view company reviews"
ON public.company_reviews 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 4. Add explicit deny for maintenance_tasks to prevent anon access
CREATE POLICY "Deny anonymous access to maintenance_tasks"
ON public.maintenance_tasks 
FOR ALL 
TO anon
USING (false);

-- 5. Add explicit deny for insurance tables
CREATE POLICY "Deny anonymous access to insurance_types"
ON public.insurance_types 
FOR ALL 
TO anon
USING (false);

CREATE POLICY "Deny anonymous access to insurance_companies"
ON public.insurance_companies 
FOR ALL 
TO anon
USING (false);

-- 6. Add explicit deny for document categories
CREATE POLICY "Deny anonymous access to document_categories"
ON public.document_categories 
FOR ALL 
TO anon
USING (false);

-- 7. Add explicit deny for properties and property-related tables
CREATE POLICY "Deny anonymous access to properties"
ON public.properties 
FOR ALL 
TO anon
USING (false);

CREATE POLICY "Deny anonymous access to property_documents"
ON public.property_documents 
FOR ALL 
TO anon
USING (false);

-- 8. Add explicit deny for user preference tables
CREATE POLICY "Deny anonymous access to user_preferences"
ON public.user_preferences 
FOR ALL 
TO anon
USING (false);