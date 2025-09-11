-- Add missing columns to properties table to match TypeScript interface
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS current_value numeric,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'owned';

-- Add check constraint for status values (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'properties_status_check'
    ) THEN
        ALTER TABLE public.properties 
        ADD CONSTRAINT properties_status_check 
        CHECK (status IN ('owned', 'rented', 'for_sale', 'sold', 'under_renovation'));
    END IF;
END $$;

-- Create index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);

-- Create or replace trigger for updated_at
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();