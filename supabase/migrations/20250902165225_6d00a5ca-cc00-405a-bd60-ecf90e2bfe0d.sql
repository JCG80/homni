-- Analytics & Reporting System Database Schema

-- Create analytics events table for tracking user actions
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics metrics table for aggregated data
CREATE TABLE public.analytics_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  dimensions JSONB DEFAULT '{}',
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user activity summary table
CREATE TABLE public.user_activity_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date_summary DATE NOT NULL DEFAULT CURRENT_DATE,
  total_events INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  features_used JSONB DEFAULT '{}',
  conversion_events INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date_summary)
);

-- Create system health metrics table
CREATE TABLE public.system_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'normal', -- normal, warning, critical
  threshold_config JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business intelligence reports table
CREATE TABLE public.bi_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- daily, weekly, monthly, quarterly
  report_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  generated_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'completed' -- generating, completed, failed
);

-- Enable RLS on all analytics tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
CREATE POLICY "Users can view their own events" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all events" ON public.analytics_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

-- RLS Policies for analytics_metrics
CREATE POLICY "Authenticated users can view metrics" ON public.analytics_metrics
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage metrics" ON public.analytics_metrics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

-- RLS Policies for user_activity_summaries
CREATE POLICY "Users can view their own activity" ON public.user_activity_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity" ON public.user_activity_summaries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

-- RLS Policies for system_health_metrics
CREATE POLICY "Admins can view system health" ON public.system_health_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

CREATE POLICY "System can insert health metrics" ON public.system_health_metrics
  FOR INSERT WITH CHECK (true);

-- RLS Policies for bi_reports
CREATE POLICY "Admins can manage BI reports" ON public.bi_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

CREATE POLICY "Companies can view relevant BI reports" ON public.bi_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'company') OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);

CREATE INDEX idx_analytics_metrics_name ON public.analytics_metrics(metric_name);
CREATE INDEX idx_analytics_metrics_date ON public.analytics_metrics(date_recorded);

CREATE INDEX idx_user_activity_user_date ON public.user_activity_summaries(user_id, date_summary);

CREATE INDEX idx_system_health_recorded_at ON public.system_health_metrics(recorded_at);
CREATE INDEX idx_system_health_status ON public.system_health_metrics(status);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_metrics_updated_at
  BEFORE UPDATE ON public.analytics_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER update_user_activity_summaries_updated_at
  BEFORE UPDATE ON public.user_activity_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

-- Create analytics aggregation function
CREATE OR REPLACE FUNCTION public.aggregate_user_daily_activity(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_activity_summaries (
    user_id, 
    date_summary, 
    total_events, 
    session_count, 
    time_spent_minutes, 
    features_used,
    conversion_events
  )
  SELECT 
    user_id,
    target_date,
    COUNT(*) as total_events,
    COUNT(DISTINCT session_id) as session_count,
    COALESCE(EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / 60, 0)::INTEGER as time_spent_minutes,
    jsonb_object_agg(event_type, COUNT(*)) as features_used,
    COUNT(*) FILTER (WHERE event_name LIKE '%conversion%' OR event_name LIKE '%purchase%' OR event_name LIKE '%lead_submitted%') as conversion_events
  FROM public.analytics_events 
  WHERE DATE(created_at) = target_date 
    AND user_id IS NOT NULL
  GROUP BY user_id
  ON CONFLICT (user_id, date_summary) 
  DO UPDATE SET
    total_events = EXCLUDED.total_events,
    session_count = EXCLUDED.session_count,
    time_spent_minutes = EXCLUDED.time_spent_minutes,
    features_used = EXCLUDED.features_used,
    conversion_events = EXCLUDED.conversion_events,
    updated_at = now();
END;
$$;

-- Create function to track analytics events
CREATE OR REPLACE FUNCTION public.track_analytics_event(
  p_event_type TEXT,
  p_event_name TEXT,
  p_properties JSONB DEFAULT '{}',
  p_user_id UUID DEFAULT auth.uid(),
  p_session_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.analytics_events (
    user_id,
    session_id,
    event_type,
    event_name,
    properties,
    user_agent,
    ip_address
  ) VALUES (
    p_user_id,
    COALESCE(p_session_id, gen_random_uuid()::text),
    p_event_type,
    p_event_name,
    p_properties,
    current_setting('request.headers', true)::json->>'user-agent',
    inet_client_addr()
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;