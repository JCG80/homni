-- Enhance Property Documentation System
-- Create document categories table
CREATE TABLE public.document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'FileText',
  color TEXT DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default document categories
INSERT INTO public.document_categories (name, description, icon, color, is_required, sort_order) VALUES
('Kjøpekontrakt', 'Kjøpekontrakt og eiendomsdokumenter', 'FileSignature', '#3b82f6', true, 1),
('Forsikring', 'Forsikringsdokumenter og poliser', 'Shield', '#10b981', true, 2),
('Teknisk dokumentasjon', 'Tekniske tegninger og installasjoner', 'Wrench', '#f59e0b', false, 3),
('Garantier', 'Garantier på utstyr og installasjoner', 'Award', '#8b5cf6', false, 4),
('Vedlikehold', 'Vedlikeholdslogg og servicerapporter', 'Tool', '#ef4444', false, 5),
('Faktura og kvitteringer', 'Fakturaer og kvitteringer', 'Receipt', '#06b6d4', false, 6),
('Bilder og media', 'Bilder og videoer av eiendommen', 'Camera', '#ec4899', false, 7),
('Rapporter', 'Tilstandsrapporter og verdivurderinger', 'BarChart3', '#84cc16', false, 8);

-- Create property document versions table for version control
CREATE TABLE public.property_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.property_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  upload_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add new columns to property_documents table
ALTER TABLE public.property_documents ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.document_categories(id);
ALTER TABLE public.property_documents ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE public.property_documents ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE public.property_documents ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;
ALTER TABLE public.property_documents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.property_documents ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.property_documents ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE public.property_documents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.property_documents ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE public.property_documents ADD COLUMN IF NOT EXISTS current_version INTEGER DEFAULT 1;

-- Create property document access table for sharing
CREATE TABLE public.property_document_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.property_documents(id) ON DELETE CASCADE,
  granted_to UUID REFERENCES auth.users(id),
  granted_by UUID REFERENCES auth.users(id) NOT NULL,
  access_level TEXT NOT NULL CHECK (access_level IN ('view', 'edit', 'admin')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create maintenance tasks table (proper implementation)
CREATE TABLE public.property_maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('hvac', 'plumbing', 'electrical', 'exterior', 'interior', 'garden', 'security', 'other')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  assigned_to TEXT,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('monthly', 'quarterly', 'biannual', 'annual')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage bucket for property documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-documents',
  'property-documents', 
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- RLS Policies for document_categories
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document categories are viewable by authenticated users" 
ON public.document_categories FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage document categories"
ON public.document_categories FOR ALL
USING (get_auth_user_role() = ANY(ARRAY['admin', 'master_admin']));

-- RLS Policies for property_document_versions
ALTER TABLE public.property_document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of documents they own"
ON public.property_document_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.property_documents pd
    JOIN public.properties p ON p.id = pd.property_id
    WHERE pd.id = property_document_versions.document_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert versions for their documents"
ON public.property_document_versions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.property_documents pd
    JOIN public.properties p ON p.id = pd.property_id
    WHERE pd.id = property_document_versions.document_id
    AND p.user_id = auth.uid()
  )
);

-- RLS Policies for property_document_access
ALTER TABLE public.property_document_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage access they granted"
ON public.property_document_access FOR ALL
USING (granted_by = auth.uid());

CREATE POLICY "Users can view access granted to them"
ON public.property_document_access FOR SELECT
USING (granted_to = auth.uid());

-- RLS Policies for property_maintenance_tasks
ALTER TABLE public.property_maintenance_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tasks for their properties"
ON public.property_maintenance_tasks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_maintenance_tasks.property_id
    AND p.user_id = auth.uid()
  )
);

-- Storage policies for property documents
CREATE POLICY "Users can upload documents for their properties"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their property documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their property documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their property documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_categories_updated_at 
    BEFORE UPDATE ON public.document_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_maintenance_tasks_updated_at 
    BEFORE UPDATE ON public.property_maintenance_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();