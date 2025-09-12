-- Security hardening for production readiness
-- Fix function search_path vulnerabilities

-- Update all existing functions to include proper search_path
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  r text;
begin
  -- Prefer user_roles with role precedence (canonical roles)
  select ur.role::text into r
  from public.user_roles ur
  where ur.user_id = auth.uid()
  order by case ur.role
    when 'master_admin' then 1
    when 'admin' then 2
    when 'company' then 3
    when 'content_editor' then 4
    when 'user' then 5
    else 100
  end
  limit 1;

  if r is not null then
    return r;
  end if;

  -- Fallback to user_profiles.role (normalize legacy values)
  select up.role into r
  from public.user_profiles up
  where up.id = auth.uid();

  if r is not null then
    r := lower(r);
    if r = 'member' then
      r := 'user';
    elsif r = 'anonymous' then
      r := 'guest';
    end if;
    return r;
  end if;

  -- Fallback to auth.users raw metadata (normalize legacy values)
  select lower(au.raw_user_meta_data->>'role') into r
  from auth.users au
  where au.id = auth.uid();

  if r is not null then
    if r = 'member' then
      r := 'user';
    elsif r = 'anonymous' then
      r := 'guest';
    end if;
    return r;
  end if;

  -- Default canonical role
  return 'user';
end;
$function$;

-- Create production monitoring tables
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit TEXT NOT NULL DEFAULT 'count',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}',
    service_name TEXT NOT NULL DEFAULT 'homni-platform'
);

CREATE TABLE IF NOT EXISTS public.error_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    user_agent TEXT,
    url TEXT,
    severity TEXT NOT NULL DEFAULT 'error',
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.performance_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_route TEXT NOT NULL,
    load_time_ms INTEGER NOT NULL,
    first_contentful_paint INTEGER,
    largest_contentful_paint INTEGER,
    cumulative_layout_shift NUMERIC,
    first_input_delay INTEGER,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    device_type TEXT,
    network_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

-- Enable RLS on new tables
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_monitoring ENABLE ROW LEVEL SECURITY;

-- RLS policies for system health metrics
CREATE POLICY "Admins can manage health metrics" 
ON public.system_health_metrics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "System can insert health metrics"
ON public.system_health_metrics
FOR INSERT
WITH CHECK (true);

-- RLS policies for error tracking
CREATE POLICY "Admins can manage error tracking"
ON public.error_tracking
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "System can insert error tracking"
ON public.error_tracking
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own errors"
ON public.error_tracking
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policies for performance monitoring
CREATE POLICY "Admins can manage performance monitoring"
ON public.performance_monitoring
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "System can insert performance data"
ON public.performance_monitoring
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_recorded_at ON public.system_health_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_metric_name ON public.system_health_metrics(metric_name);

CREATE INDEX IF NOT EXISTS idx_error_tracking_created_at ON public.error_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_tracking_severity ON public.error_tracking(severity);
CREATE INDEX IF NOT EXISTS idx_error_tracking_resolved ON public.error_tracking(resolved);

CREATE INDEX IF NOT EXISTS idx_performance_monitoring_created_at ON public.performance_monitoring(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_monitoring_page_route ON public.performance_monitoring(page_route);

-- Production-ready health check function
CREATE OR REPLACE FUNCTION public.system_health_check()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    result JSONB;
    db_connections INTEGER;
    avg_query_time NUMERIC;
    error_rate NUMERIC;
    recent_errors INTEGER;
BEGIN
    -- Check database connections
    SELECT count(*) INTO db_connections
    FROM pg_stat_activity 
    WHERE state = 'active';
    
    -- Calculate error rate (last hour)
    SELECT count(*) INTO recent_errors
    FROM public.error_tracking
    WHERE created_at > now() - INTERVAL '1 hour'
    AND severity IN ('error', 'critical');
    
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