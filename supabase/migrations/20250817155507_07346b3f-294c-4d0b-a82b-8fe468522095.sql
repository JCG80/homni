-- Fix remaining functions that still need search_path fix
-- Based on security linter warnings

-- 1) Fix remaining trigger functions
CREATE OR REPLACE FUNCTION public.update_plugin_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_modified_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$function$;