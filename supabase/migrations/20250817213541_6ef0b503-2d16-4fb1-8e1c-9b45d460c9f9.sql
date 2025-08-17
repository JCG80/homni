
-- Phase 4: Fix canonical role resolution in Supabase

-- Replace public.get_auth_user_role to return canonical roles and normalize legacy ones
create or replace function public.get_auth_user_role()
returns text
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
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
