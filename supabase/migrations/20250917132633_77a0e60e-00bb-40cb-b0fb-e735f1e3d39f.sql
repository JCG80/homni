-- Enable RLS on _migration_log table for security compliance
-- This table tracks database migrations and should be restricted to system/admin access

-- Enable RLS on the migration log table
ALTER TABLE public._migration_log ENABLE ROW LEVEL SECURITY;

-- Add policy: Only allow system/admin users to view migration logs
CREATE POLICY "Only admins can view migration logs"
  ON public._migration_log
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  );

-- Add policy: Only system can insert migration logs (for automated migration tracking)
CREATE POLICY "System can insert migration logs"
  ON public._migration_log
  FOR INSERT
  WITH CHECK (true);  -- System-level operations should be able to insert

-- Note: No UPDATE or DELETE policies as migration logs should be immutable