-- Phase 3: Data-driven Personalization Tables

-- User preferences and behavioral learning
CREATE TABLE public.user_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    preference_type text NOT NULL, -- 'widget_order', 'notification_settings', 'dashboard_layout', etc.
    preference_data jsonb NOT NULL DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, preference_type)
);

-- Smart notifications system
CREATE TABLE public.smart_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    notification_type text NOT NULL, -- 'achievement', 'reminder', 'insight', 'tip', etc.
    title text NOT NULL,
    content text NOT NULL,
    priority text NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    read_at timestamp with time zone,
    dismissed_at timestamp with time zone,
    expires_at timestamp with time zone,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

-- Personalized insights and recommendations
CREATE TABLE public.user_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    insight_type text NOT NULL, -- 'recommendation', 'trend', 'prediction', 'tip'
    title text NOT NULL,
    description text NOT NULL,
    data jsonb DEFAULT '{}',
    confidence_score numeric(3,2) DEFAULT 0.5, -- 0.0 to 1.0
    is_active boolean DEFAULT true,
    viewed_at timestamp with time zone,
    acted_on_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + interval '7 days')
);

-- Behavioral analytics for learning
CREATE TABLE public.user_behavior_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    event_type text NOT NULL, -- 'click', 'view', 'complete', 'dismiss', etc.
    event_target text NOT NULL, -- what was interacted with
    event_context jsonb DEFAULT '{}',
    session_id text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage their own preferences"
ON public.user_preferences
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all preferences"
ON public.user_preferences
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.user_id = auth.uid() 
        AND up.role IN ('admin', 'master_admin')
    )
);

-- RLS Policies for smart_notifications  
CREATE POLICY "Users can manage their own notifications"
ON public.smart_notifications
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.smart_notifications
FOR INSERT
WITH CHECK (true);

-- RLS Policies for user_insights
CREATE POLICY "Users can view their own insights"
ON public.user_insights
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their insight interactions"
ON public.user_insights
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can manage insights"
ON public.user_insights
FOR ALL
WITH CHECK (true);

-- RLS Policies for user_behavior_events
CREATE POLICY "Users can insert their own behavior events"
ON public.user_behavior_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own behavior events"
ON public.user_behavior_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all behavior events"
ON public.user_behavior_events
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.user_id = auth.uid() 
        AND up.role IN ('admin', 'master_admin')
    )
);

-- Create indexes for performance
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_smart_notifications_user_id ON public.smart_notifications(user_id);
CREATE INDEX idx_smart_notifications_created_at ON public.smart_notifications(created_at);
CREATE INDEX idx_user_insights_user_id ON public.user_insights(user_id);
CREATE INDEX idx_user_insights_active ON public.user_insights(is_active, expires_at);
CREATE INDEX idx_user_behavior_events_user_id ON public.user_behavior_events(user_id);
CREATE INDEX idx_user_behavior_events_created_at ON public.user_behavior_events(created_at);

-- Create trigger for updating updated_at on preferences
CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_preferences_updated_at();