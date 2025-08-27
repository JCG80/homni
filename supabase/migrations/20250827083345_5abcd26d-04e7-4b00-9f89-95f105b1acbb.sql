
-- 1) Generisk tabell for eksterne integrasjoner (f.eks. e-postprovider)
create table if not exists public.external_integrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,                         -- f.eks. 'email' eller 'email_default'
  provider text not null,                     -- 'resend' | 'sendgrid' | 'smtp' | 'mailgun' | ...
  category text not null default 'email',     -- kategorisere integrasjonen (utvidbart)
  config jsonb not null default '{}'::jsonb,  -- ikke-hemmelig konfig (from_name, reply_to etc.)
  secret_name text null,                      -- navn på secret i Supabase (f.eks. RESEND_API_KEY)
  is_enabled boolean not null default false,
  created_by uuid null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint external_integrations_unique unique (category, name)
);

-- RLS
alter table public.external_integrations enable row level security;

-- Kun admin/master_admin kan lese/endre
create policy if not exists "Admins read integrations"
  on public.external_integrations for select
  using (has_role_level(auth.uid(), 80));

create policy if not exists "Admins write integrations"
  on public.external_integrations for all
  using (has_role_level(auth.uid(), 80))
  with check (has_role_level(auth.uid(), 80));

-- Trigger for updated_at
drop trigger if exists trg_external_integrations_updated_at on public.external_integrations;
create trigger trg_external_integrations_updated_at
  before update on public.external_integrations
  for each row execute function public.update_updated_at_column();

-- 2) E-postmaler
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,                   -- f.eks. 'lead_confirmation'
  subject text not null,
  html text not null,
  text text null,
  category text not null default 'email',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_templates enable row level security;

-- Kun admin/master_admin kan lese/endre
create policy if not exists "Admins read email templates"
  on public.email_templates for select
  using (has_role_level(auth.uid(), 80));

create policy if not exists "Admins write email templates"
  on public.email_templates for all
  using (has_role_level(auth.uid(), 80))
  with check (has_role_level(auth.uid(), 80));

-- Trigger for updated_at
drop trigger if exists trg_email_templates_updated_at on public.email_templates;
create trigger trg_email_templates_updated_at
  before update on public.email_templates
  for each row execute function public.update_updated_at_column();

-- Seed standard e-postmal for bekreftelse (kun hvis den ikke finnes)
insert into public.email_templates (key, subject, html, text)
select
  'lead_confirmation',
  'Vi har mottatt forespørselen din',
  '<h2>Takk for forespørselen!</h2>
   <p>Vi har mottatt forespørselen din og starter prosessen.</p>
   <p>Du kan følge status her: <a href="{{base_url}}/mine-foresporsler?email={{email}}">{{base_url}}/mine-foresporsler</a></p>
   <p>Hvis du ikke opprettet denne forespørselen, vennligst kontakt oss.</p>',
  'Takk for forespørselen! Vi har mottatt den og starter prosessen.
   Følg status: {{base_url}}/mine-foresporsler?email={{email}}'
where not exists (
  select 1 from public.email_templates where key = 'lead_confirmation'
);

-- 3) E-posthendelser (logg) – klar for bruk når API tas i bruk
create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  template_key text not null,
  to_email text not null,
  lead_id uuid null,
  provider text null,                          -- f.eks. 'resend'
  status text not null default 'queued',       -- 'queued' | 'sent' | 'failed'
  error text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz null
);

alter table public.email_events enable row level security;

-- Kun admin/master_admin kan lese/endre
create policy if not exists "Admins read email events"
  on public.email_events for select
  using (has_role_level(auth.uid(), 80));

create policy if not exists "Admins write email events"
  on public.email_events for all
  using (has_role_level(auth.uid(), 80))
  with check (has_role_level(auth.uid(), 80));

-- Indekser for raskt oppslag
create index if not exists idx_email_events_to_email on public.email_events (lower(to_email));
create index if not exists idx_email_events_template_key on public.email_events (template_key);
create index if not exists idx_email_events_lead_id on public.email_events (lead_id);

-- (Valgfritt) pek oppdateringskolonne hvis du senere legger til updated_at
-- create trigger trg_email_events_updated_at before update on public.email_events
-- for each row execute function public.update_updated_at_column();
