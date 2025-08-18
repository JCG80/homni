-- Update app_role enum to include canonical roles
-- First add the new role values
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'user';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'guest';

-- Update pipeline_stage enum to use slug values  
-- First add the new slug values
ALTER TYPE pipeline_stage ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE pipeline_stage ADD VALUE IF NOT EXISTS 'won';

-- Update any existing lead_assignments to use slug pipeline stages
UPDATE lead_assignments 
SET pipeline_stage = CASE 
  WHEN pipeline_stage = '📥 new' THEN 'new'::pipeline_stage
  WHEN pipeline_stage = '🚀 in_progress' THEN 'in_progress'::pipeline_stage  
  WHEN pipeline_stage = '🏆 won' THEN 'won'::pipeline_stage
  WHEN pipeline_stage = '❌ lost' THEN 'lost'::pipeline_stage
  WHEN pipeline_stage = '👀 qualified' THEN 'in_progress'::pipeline_stage
  WHEN pipeline_stage = '💬 contacted' THEN 'in_progress'::pipeline_stage
  WHEN pipeline_stage = '📞 negotiating' THEN 'in_progress'::pipeline_stage
  WHEN pipeline_stage = '✅ converted' THEN 'won'::pipeline_stage
  WHEN pipeline_stage = '⏸️ paused' THEN 'in_progress'::pipeline_stage
  ELSE pipeline_stage
END
WHERE pipeline_stage IN ('📥 new', '🚀 in_progress', '🏆 won', '❌ lost', '👀 qualified', '💬 contacted', '📞 negotiating', '✅ converted', '⏸️ paused');

-- Update any existing leads to use slug statuses
UPDATE leads 
SET status = CASE 
  WHEN status = '📥 new' THEN 'new'
  WHEN status = '👀 qualified' THEN 'qualified'
  WHEN status = '💬 contacted' THEN 'contacted'
  WHEN status = '📞 negotiating' THEN 'negotiating'
  WHEN status = '✅ converted' THEN 'converted'
  WHEN status = '❌ lost' THEN 'lost'
  WHEN status = '⏸️ paused' THEN 'paused'
  ELSE status
END
WHERE status IN ('📥 new', '👀 qualified', '💬 contacted', '📞 negotiating', '✅ converted', '❌ lost', '⏸️ paused');