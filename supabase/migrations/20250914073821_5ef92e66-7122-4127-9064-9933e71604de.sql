-- Fix database security issues - Add missing SET search_path to functions
-- This fixes the "Function Search Path Mutable" warnings

-- Update functions to have proper search_path security
CREATE OR REPLACE FUNCTION public.update_company_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Update the company's review count and average rating
    UPDATE insurance_companies 
    SET 
      review_count = (SELECT COUNT(*) FROM company_reviews WHERE company_id = OLD.company_id),
      customer_rating = (SELECT COALESCE(AVG(rating), 0) FROM company_reviews WHERE company_id = OLD.company_id)
    WHERE id = OLD.company_id;
    RETURN OLD;
  ELSE
    -- Update the company's review count and average rating
    UPDATE insurance_companies 
    SET 
      review_count = (SELECT COUNT(*) FROM company_reviews WHERE company_id = NEW.company_id),
      customer_rating = (SELECT COALESCE(AVG(rating), 0) FROM company_reviews WHERE company_id = NEW.company_id)
    WHERE id = NEW.company_id;
    RETURN NEW;
  END IF;
END;
$function$;

-- Update other functions to have proper search_path
CREATE OR REPLACE FUNCTION public.maint_due_tasks(p_user uuid, p_season text)
RETURNS TABLE(task_id uuid, title text, description text, priority text, frequency_months integer, last_completed timestamp with time zone, is_due boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  WITH latest AS (
    SELECT task_id, max(completed_at) AS last_completed 
    FROM user_task_log 
    WHERE user_id = p_user 
    GROUP BY task_id
  )
  SELECT 
    t.id, 
    t.title, 
    t.description, 
    t.priority, 
    t.frequency_months,
    l.last_completed,
    COALESCE((now() - COALESCE(l.last_completed, to_timestamp(0))) > make_interval(months => t.frequency_months), true) AS is_due
  FROM maintenance_tasks t
  LEFT JOIN latest l ON l.task_id = t.id
  WHERE p_season = ANY (t.seasons)
$function$;