-- Create webhook logs table for tracking external lead sources
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create import logs table for tracking bulk imports
CREATE TABLE public.import_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_records INTEGER NOT NULL DEFAULT 0,
  successful_records INTEGER NOT NULL DEFAULT 0,
  failed_records INTEGER NOT NULL DEFAULT 0,
  import_type TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

-- Webhook logs policies (admin access only)
CREATE POLICY "Admins can view webhook logs" 
ON public.webhook_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'master_admin')
  )
);

-- Import logs policies (users can view their own imports)
CREATE POLICY "Users can view their own import logs" 
ON public.import_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all import logs" 
ON public.import_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'master_admin')
  )
);

-- Add indexes for performance
CREATE INDEX idx_webhook_logs_source ON public.webhook_logs(source);
CREATE INDEX idx_webhook_logs_processed_at ON public.webhook_logs(processed_at);
CREATE INDEX idx_import_logs_user_id ON public.import_logs(user_id);
CREATE INDEX idx_import_logs_import_type ON public.import_logs(import_type);