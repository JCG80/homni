-- Phase 3: API Integrations & Advanced Features
-- Create tables for external service management and API integration tracking

-- API Integration Configuration Table
CREATE TABLE IF NOT EXISTS public.api_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  service_type TEXT NOT NULL, -- 'payment', 'real_estate', 'communication', 'maps', 'analytics'
  endpoint_url TEXT,
  api_version TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
  configuration JSONB NOT NULL DEFAULT '{}',
  credentials_configured BOOLEAN NOT NULL DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  rate_limit_config JSONB DEFAULT '{"requests_per_minute": 60, "burst_limit": 100}',
  retry_config JSONB DEFAULT '{"max_retries": 3, "backoff_multiplier": 2}',
  health_check_interval INTEGER DEFAULT 300, -- seconds
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API Request Logs for monitoring and debugging
CREATE TABLE IF NOT EXISTS public.api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.api_integrations(id) ON DELETE CASCADE,
  request_method TEXT NOT NULL,
  request_url TEXT NOT NULL,
  request_headers JSONB,
  request_body JSONB,
  response_status INTEGER,
  response_headers JSONB,
  response_body JSONB,
  response_time_ms INTEGER,
  error_message TEXT,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- External Service Webhooks Management
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.api_integrations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret_token TEXT, -- For webhook signature verification
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  retry_config JSONB DEFAULT '{"max_retries": 3, "retry_delay_seconds": 30}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API Rate Limiting and Usage Tracking
CREATE TABLE IF NOT EXISTS public.api_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.api_integrations(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hour INTEGER NOT NULL DEFAULT EXTRACT(hour FROM now()),
  request_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  average_response_time_ms NUMERIC,
  total_data_transferred_bytes BIGINT DEFAULT 0,
  cost_usd NUMERIC(10,4) DEFAULT 0.0000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(integration_id, date, hour)
);

-- External Data Sync Status
CREATE TABLE IF NOT EXISTS public.external_data_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.api_integrations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'full', 'incremental', 'delta'
  entity_type TEXT NOT NULL, -- 'properties', 'market_data', 'companies', etc.
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_deleted INTEGER DEFAULT 0,
  error_details JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies for API Integration tables
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_data_sync ENABLE ROW LEVEL SECURITY;

-- Admin-only access for API integrations management
CREATE POLICY "Admin full access to api_integrations" ON public.api_integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'master_admin')
    )
  );

-- API request logs viewable by admins and system
CREATE POLICY "Admin access to api_request_logs" ON public.api_request_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'master_admin')
    )
  );

-- Webhook endpoints managed by admins
CREATE POLICY "Admin access to webhook_endpoints" ON public.webhook_endpoints
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'master_admin')
    )
  );

-- API usage metrics viewable by admins
CREATE POLICY "Admin access to api_usage_metrics" ON public.api_usage_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'master_admin')
    )
  );

-- External data sync viewable by admins
CREATE POLICY "Admin access to external_data_sync" ON public.external_data_sync
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'master_admin')
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_api_integrations_updated_at
  BEFORE UPDATE ON public.api_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_usage_metrics_updated_at
  BEFORE UPDATE ON public.api_usage_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_external_data_sync_updated_at
  BEFORE UPDATE ON public.external_data_sync
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log API requests
CREATE OR REPLACE FUNCTION public.log_api_request(
  p_integration_name TEXT,
  p_method TEXT,
  p_url TEXT,
  p_request_headers JSONB DEFAULT '{}',
  p_request_body JSONB DEFAULT '{}',
  p_response_status INTEGER DEFAULT NULL,
  p_response_headers JSONB DEFAULT '{}',
  p_response_body JSONB DEFAULT '{}',
  p_response_time_ms INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT auth.uid(),
  p_session_id TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_integration_id UUID;
  v_log_id UUID;
BEGIN
  -- Get integration ID
  SELECT id INTO v_integration_id 
  FROM public.api_integrations 
  WHERE name = p_integration_name;
  
  IF v_integration_id IS NULL THEN
    RAISE EXCEPTION 'Integration not found: %', p_integration_name;
  END IF;
  
  -- Insert log entry
  INSERT INTO public.api_request_logs (
    integration_id, request_method, request_url, request_headers, request_body,
    response_status, response_headers, response_body, response_time_ms,
    error_message, user_id, session_id
  ) VALUES (
    v_integration_id, p_method, p_url, p_request_headers, p_request_body,
    p_response_status, p_response_headers, p_response_body, p_response_time_ms,
    p_error_message, p_user_id, p_session_id
  ) RETURNING id INTO v_log_id;
  
  -- Update usage metrics
  INSERT INTO public.api_usage_metrics (integration_id, request_count, success_count, error_count)
  VALUES (
    v_integration_id, 
    1, 
    CASE WHEN p_response_status BETWEEN 200 AND 299 THEN 1 ELSE 0 END,
    CASE WHEN p_response_status NOT BETWEEN 200 AND 299 OR p_error_message IS NOT NULL THEN 1 ELSE 0 END
  )
  ON CONFLICT (integration_id, date, hour)
  DO UPDATE SET
    request_count = api_usage_metrics.request_count + 1,
    success_count = api_usage_metrics.success_count + CASE WHEN p_response_status BETWEEN 200 AND 299 THEN 1 ELSE 0 END,
    error_count = api_usage_metrics.error_count + CASE WHEN p_response_status NOT BETWEEN 200 AND 299 OR p_error_message IS NOT NULL THEN 1 ELSE 0 END,
    updated_at = now();
  
  RETURN v_log_id;
END;
$$;

-- Function to get integration health status
CREATE OR REPLACE FUNCTION public.get_integration_health(p_integration_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_integration_id UUID;
  v_recent_success_rate NUMERIC;
  v_avg_response_time NUMERIC;
  v_last_error TEXT;
BEGIN
  -- Get integration ID
  SELECT id INTO v_integration_id 
  FROM public.api_integrations 
  WHERE name = p_integration_name;
  
  IF v_integration_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Integration not found');
  END IF;
  
  -- Calculate recent success rate (last 24 hours)
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 100 
      ELSE (COUNT(*) FILTER (WHERE response_status BETWEEN 200 AND 299) * 100.0 / COUNT(*))
    END,
    AVG(response_time_ms)
  INTO v_recent_success_rate, v_avg_response_time
  FROM public.api_request_logs
  WHERE integration_id = v_integration_id
    AND created_at > now() - INTERVAL '24 hours';
  
  -- Get last error
  SELECT error_message INTO v_last_error
  FROM public.api_request_logs
  WHERE integration_id = v_integration_id
    AND error_message IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN jsonb_build_object(
    'success_rate_24h', COALESCE(v_recent_success_rate, 100),
    'avg_response_time_ms', COALESCE(v_avg_response_time, 0),
    'last_error', v_last_error,
    'status', CASE 
      WHEN v_recent_success_rate >= 95 THEN 'healthy'
      WHEN v_recent_success_rate >= 80 THEN 'degraded'
      ELSE 'unhealthy'
    END
  );
END;
$$;

-- Insert default API integrations
INSERT INTO public.api_integrations (name, service_type, status, configuration) VALUES
  ('stripe', 'payment', 'inactive', '{"webhook_endpoints": [], "supported_events": ["payment_intent.succeeded", "subscription.created"]}'),
  ('finn_api', 'real_estate', 'inactive', '{"base_url": "https://www.finn.no/api/search-api", "rate_limit": {"requests_per_minute": 100}}'),
  ('sendgrid', 'communication', 'inactive', '{"templates": {"lead_notification": "", "welcome_email": ""}}'),
  ('google_maps', 'maps', 'inactive', '{"geocoding": true, "places": true, "static_maps": true}'),
  ('postnord_api', 'logistics', 'inactive', '{"tracking": true, "address_validation": true}')
ON CONFLICT (name) DO NOTHING;