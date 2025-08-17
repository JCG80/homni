
-- 1) Enum + table ------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('member','company','content_editor','admin','master_admin');
  end if;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- 2) Functions (security definer + search_path) ------------------------------

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = _user_id
      and ur.role = _role
  );
$$;

-- Oppdater get_auth_user_role til å foretrekke user_roles først
create or replace function public.get_auth_user_role()
returns text
language plpgsql
stable
security definer
set search_path = public
as $function$
declare
  user_role text;
begin
  -- 1) Fra user_roles (prioriter høyeste rolle: master_admin > admin > company > content_editor > member)
  select r.role::text
  into user_role
  from public.user_roles r
  where r.user_id = auth.uid()
  order by case r.role
    when 'master_admin' then 1
    when 'admin' then 2
    when 'company' then 3
    when 'content_editor' then 4
    when 'member' then 5
    else 6
  end
  limit 1;

  if user_role is not null then
    return user_role;
  end if;

  -- 2) Fallback til user_profiles.role (dersom tabell/kolonne finnes)
  begin
    select role::text into user_role
    from public.user_profiles
    where id = auth.uid();
  exception when undefined_table or undefined_column then
    -- Ignorer og bruk neste fallback
    null;
  end;

  if user_role is not null then
    return user_role;
  end if;

  -- 3) Fallback til auth.users raw metadata
  begin
    select raw_user_meta_data->>'role' into user_role
    from auth.users
    where id = auth.uid();
  exception when others then
    null;
  end;

  return coalesce(user_role, 'member');
end;
$function$;

-- 3) RLS for user_roles -------------------------------------------------------

-- Rydd opp gamle policies hvis de finnes
drop policy if exists "Users can view their own roles" on public.user_roles;
drop policy if exists "Admins can view all roles" on public.user_roles;
drop policy if exists "Admins can manage roles" on public.user_roles;

-- SELECT: egen rad eller admin/master_admin
create policy "Users can view their own roles"
  on public.user_roles
  for select
  using (
    user_id = auth.uid()
    or public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'master_admin')
  );

-- INSERT/UPDATE/DELETE: kun admin/master_admin
create policy "Admins can manage roles"
  on public.user_roles
  for all
  using (
    public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'master_admin')
  )
  with check (
    public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'master_admin')
  );

-- 4) Leads RLS (idempotent) --------------------------------------------------

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'leads'
  ) then
    -- Enable RLS
    execute 'alter table public.leads enable row level security';

    -- Drop existing policies to avoid duplicates
    perform 1;
    begin
      execute 'drop policy if exists "Users can view their own leads" on public.leads';
      execute 'drop policy if exists "Companies can view leads assigned to them" on public.leads';
      execute 'drop policy if exists "Admins can view all leads" on public.leads';
      execute 'drop policy if exists "Users can create their own leads" on public.leads';
      execute 'drop policy if exists "Admins can update any lead" on public.leads';
      execute 'drop policy if exists "Companies can update their assigned leads" on public.leads';
    exception when others then
      null;
    end;

    -- SELECT policies
    execute $p$
      create policy "Users can view their own leads"
        on public.leads
        for select
        using (submitted_by = auth.uid());
    $p$;

    execute $p$
      create policy "Companies can view leads assigned to them"
        on public.leads
        for select
        using (
          public.has_role(auth.uid(), 'company')
          and company_id = public.get_current_user_company_id()
        );
    $p$;

    execute $p$
      create policy "Admins can view all leads"
        on public.leads
        for select
        using (
          public.has_role(auth.uid(), 'admin')
          or public.has_role(auth.uid(), 'master_admin')
        );
    $p$;

    -- INSERT policy
    execute $p$
      create policy "Users can create their own leads"
        on public.leads
        for insert
        with check (submitted_by = auth.uid());
    $p$;

    -- UPDATE policies
    execute $p$
      create policy "Admins can update any lead"
        on public.leads
        for update
        using (
          public.has_role(auth.uid(), 'admin')
          or public.has_role(auth.uid(), 'master_admin')
        );
    $p$;

    execute $p$
      create policy "Companies can update their assigned leads"
        on public.leads
        for update
        using (
          public.has_role(auth.uid(), 'company')
          and company_id = public.get_current_user_company_id()
        );
    $p$;

  end if;
end $$;
