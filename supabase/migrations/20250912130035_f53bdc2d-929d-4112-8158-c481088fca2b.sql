-- Production readiness: Create monitoring tables (if not exists)
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_recorded_at ON public.system_health_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_metric_name ON public.system_health_metrics(metric_name);

CREATE INDEX IF NOT EXISTS idx_error_tracking_created_at ON public.error_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_tracking_severity ON public.error_tracking(severity);
CREATE INDEX IF NOT EXISTS idx_error_tracking_resolved ON public.error_tracking(resolved);

CREATE INDEX IF NOT EXISTS idx_performance_monitoring_created_at ON public.performance_monitoring(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_monitoring_page_route ON public.performance_monitoring(page_route);