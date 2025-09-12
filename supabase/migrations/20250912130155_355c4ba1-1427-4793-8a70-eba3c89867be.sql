-- Check and create only missing production monitoring infrastructure

-- Create production monitoring tables (with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit TEXT NOT NULL DEFAULT 'count',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}',
    service_name TEXT NOT NULL DEFAULT 'homni-platform'
);

-- Enable RLS (safe to run multiple times)
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to avoid conflicts
DROP POLICY IF EXISTS "System can insert health metrics" ON public.system_health_metrics;
DROP POLICY IF EXISTS "Admins can manage health metrics" ON public.system_health_metrics;

CREATE POLICY "Admins can manage health metrics" 
ON public.system_health_metrics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "System can insert health metrics"
ON public.system_health_metrics
FOR INSERT
WITH CHECK (true);

-- Create production-ready health check function
CREATE OR REPLACE FUNCTION public.system_health_check()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    result JSONB;
    db_connections INTEGER;
    recent_errors INTEGER;
BEGIN
    -- Check database connections
    SELECT count(*) INTO db_connections
    FROM pg_stat_activity 
    WHERE state = 'active';
    
    -- Calculate error rate (last hour) if error_tracking table exists
    BEGIN
        SELECT count(*) INTO recent_errors
        FROM public.error_tracking
        WHERE created_at > now() - INTERVAL '1 hour'
        AND severity IN ('error', 'critical');
    EXCEPTION 
        WHEN undefined_table THEN
            recent_errors := 0;
    END;
    
    -- Build health check result
    result := jsonb_build_object(
        'status', CASE 
            WHEN recent_errors > 50 THEN 'unhealthy'
            WHEN recent_errors > 10 THEN 'degraded'
            ELSE 'healthy'
        END,
        'timestamp', now(),
        'checks', jsonb_build_object(
            'database', jsonb_build_object(
                'status', CASE WHEN db_connections > 0 THEN 'healthy' ELSE 'unhealthy' END,
                'connections', db_connections
            ),
            'errors', jsonb_build_object(
                'recent_count', recent_errors,
                'status', CASE 
                    WHEN recent_errors > 50 THEN 'critical'
                    WHEN recent_errors > 10 THEN 'warning'
                    ELSE 'ok'
                END
            )
        )
    );
    
    RETURN result;
END;
$function$;