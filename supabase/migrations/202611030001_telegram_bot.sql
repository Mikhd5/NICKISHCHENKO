-- NICKISHCHENKO Telegram bot storage
-- Run this once in the Supabase SQL Editor. Access is server-only.

create table if not exists public.telegram_bot_sessions (
  chat_id bigint primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.telegram_bot_leads (
  id uuid primary key default gen_random_uuid(),
  source_update_id bigint not null unique,
  chat_id bigint not null,
  telegram_user_id bigint,
  telegram_username text,
  customer_name text not null,
  customer_contact text not null,
  service_key text not null check (service_key in ('usa', 'sell', 'trade', 'pick')),
  service_title text not null,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.telegram_bot_updates (
  update_id bigint primary key,
  processed_at timestamptz not null default now()
);

create index if not exists telegram_bot_leads_created_at_idx
  on public.telegram_bot_leads (created_at desc);
create index if not exists telegram_bot_leads_chat_id_idx
  on public.telegram_bot_leads (chat_id);
create index if not exists telegram_bot_leads_status_idx
  on public.telegram_bot_leads (status);

alter table public.telegram_bot_sessions enable row level security;
alter table public.telegram_bot_leads enable row level security;
alter table public.telegram_bot_updates enable row level security;

revoke all on public.telegram_bot_sessions from anon, authenticated;
revoke all on public.telegram_bot_leads from anon, authenticated;
revoke all on public.telegram_bot_updates from anon, authenticated;

grant all on public.telegram_bot_sessions to service_role;
grant all on public.telegram_bot_leads to service_role;
grant all on public.telegram_bot_updates to service_role;
