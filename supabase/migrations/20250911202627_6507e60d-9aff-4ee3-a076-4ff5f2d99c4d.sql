-- Create user_filters table for saving lead filter preferences
CREATE TABLE public.user_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    filter_name TEXT,
    filter_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_filters_user_id_check CHECK (user_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.user_filters ENABLE ROW LEVEL SECURITY;

-- Create policies for user_filters
CREATE POLICY "Users can view their own filters" ON public.user_filters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own filters" ON public.user_filters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own filters" ON public.user_filters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own filters" ON public.user_filters
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all filters
CREATE POLICY "Admins can manage all filters" ON public.user_filters
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- Create index for performance
CREATE INDEX idx_user_filters_user_id ON public.user_filters(user_id);
CREATE INDEX idx_user_filters_default ON public.user_filters(user_id, is_default);

-- Add updated_at trigger
CREATE TRIGGER update_user_filters_updated_at
    BEFORE UPDATE ON public.user_filters
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();