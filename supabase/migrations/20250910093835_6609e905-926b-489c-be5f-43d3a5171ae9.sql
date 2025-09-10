-- Migration: Additional function search_path hardening (Phase 2C-1 batch 2)

-- Ensure fixed search_path for remaining SECURITY DEFINER functions missing it
ALTER FUNCTION public.track_analytics_event(text, text, jsonb, uuid, text) SET search_path = public;
ALTER FUNCTION public.aggregate_user_daily_activity(date) SET search_path = public;