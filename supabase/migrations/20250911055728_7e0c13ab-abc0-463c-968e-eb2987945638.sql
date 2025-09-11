-- Create storage policies for property-documents bucket
-- Policy for viewing documents - users can view documents for properties they own
CREATE POLICY "Users can view documents for their properties" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'property-documents' 
  AND EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.property_documents pd ON p.id = pd.property_id
    WHERE pd.file_path = storage.objects.name
    AND p.user_id = auth.uid()
  )
);

-- Policy for uploading documents - users can upload to their properties folder
CREATE POLICY "Users can upload documents for their properties" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'property-documents'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for updating documents - users can update documents for their properties
CREATE POLICY "Users can update documents for their properties" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'property-documents'
  AND EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.property_documents pd ON p.id = pd.property_id
    WHERE pd.file_path = storage.objects.name
    AND p.user_id = auth.uid()
  )
);

-- Policy for deleting documents - users can delete documents for their properties
CREATE POLICY "Users can delete documents for their properties" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'property-documents'
  AND EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.property_documents pd ON p.id = pd.property_id
    WHERE pd.file_path = storage.objects.name
    AND p.user_id = auth.uid()
  )
);