
-- This is a SQL file that needs to be run in the Supabase SQL editor
-- to set up proper RLS policies for the leads table

-- First, enable RLS on the leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own submitted leads
CREATE POLICY "Users can view their own leads"
  ON public.leads
  FOR SELECT
  USING (auth.uid() = submitted_by);

-- Policy to allow companies to view leads assigned to them
CREATE POLICY "Companies can view leads assigned to them"
  ON public.leads
  FOR SELECT
  USING ((SELECT role FROM auth.users WHERE id = auth.uid()) = 'company' AND company_id = (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

-- Policy to allow admins to view all leads
CREATE POLICY "Admins can view all leads"
  ON public.leads
  FOR SELECT
  USING ((SELECT role FROM auth.users WHERE id = auth.uid()) IN ('admin', 'master-admin'));

-- Policy to allow users to create their own leads
CREATE POLICY "Users can create their own leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

-- Policy to allow admins to update any lead
CREATE POLICY "Admins can update any lead"
  ON public.leads
  FOR UPDATE
  USING ((SELECT role FROM auth.users WHERE id = auth.uid()) IN ('admin', 'master-admin'));

-- Policy to allow companies to update leads assigned to them
CREATE POLICY "Companies can update their assigned leads"
  ON public.leads
  FOR UPDATE
  USING ((SELECT role FROM auth.users WHERE id = auth.uid()) = 'company' AND company_id = (SELECT company_id FROM user_profiles WHERE id = auth.uid()));
