-- Add missing columns to properties table to match TypeScript interface
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS current_value numeric,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'owned';

-- Add check constraint for status values
ALTER TABLE public.properties 
ADD CONSTRAINT properties_status_check 
CHECK (status IN ('owned', 'rented', 'for_sale', 'sold', 'under_renovation'));

-- Create index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);

-- Update updated_at trigger for properties table
CREATE TRIGGER IF NOT EXISTS update_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();