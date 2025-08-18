-- Add missing canonical roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'user';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'guest';

-- Add missing pipeline stages to pipeline_stage enum  
ALTER TYPE pipeline_stage ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE pipeline_stage ADD VALUE IF NOT EXISTS 'won';