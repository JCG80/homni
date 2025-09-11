-- Fix critical RLS policies for leads functionality
-- Remove anonymous access from leads-related tables

-- Update leads table RLS policies to remove anonymous access
DROP POLICY IF EXISTS "Anonymous can view approved leads" ON public.leads;
DROP POLICY IF EXISTS "Public can view active leads" ON public.leads;

-- Create secure policies for leads table
CREATE POLICY "Users can view their own leads" 
ON public.leads 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role IN ('admin', 'master_admin')
  ) OR
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE role = 'company' AND company_id IS NOT NULL
  )
);

CREATE POLICY "Users can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and companies can update leads" 
ON public.leads 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role IN ('admin', 'master_admin', 'company')
  )
);

-- Fix lead_assignments table policies
DROP POLICY IF EXISTS "Anonymous can view assignments" ON public.lead_assignments;

CREATE POLICY "Users can view their lead assignments" 
ON public.lead_assignments 
FOR SELECT 
USING (
  auth.uid() = buyer_id OR 
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role IN ('admin', 'master_admin')
  )
);

-- Fix lead_distributions table policies  
DROP POLICY IF EXISTS "Public can view distributions" ON public.lead_distributions;

CREATE POLICY "Authenticated users can view lead distributions" 
ON public.lead_distributions 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role IN ('admin', 'master_admin', 'company')
  )
);

-- Update function search_path for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;