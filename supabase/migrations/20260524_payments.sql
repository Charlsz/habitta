-- Payments table for residential/real_estate orgs
create table if not exists public.payments (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  resident_id      uuid references public.residents(id) on delete set null,
  resident_name    text not null,
  concept          text not null,
  amount           numeric(12,2) not null,
  currency         text not null default 'COP',
  due_date         date not null,
  paid_at          timestamptz,
  status           text not null default 'pending' check (status in ('pending','paid','overdue')),
  telegram_chat_id text,
  notes            text,
  created_at       timestamptz not null default now()
);

-- Index for fast org lookups
create index if not exists payments_org_idx on public.payments(organization_id);
create index if not exists payments_status_idx on public.payments(organization_id, status);

-- RLS
alter table public.payments enable row level security;

-- Org members can read their org payments
create policy "org_members_read_payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = payments.organization_id
        and om.user_id = auth.uid()
    )
  );

-- Org members can insert/update payments in their org
create policy "org_members_write_payments"
  on public.payments for insert
  with check (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = payments.organization_id
        and om.user_id = auth.uid()
    )
  );

create policy "org_members_update_payments"
  on public.payments for update
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = payments.organization_id
        and om.user_id = auth.uid()
    )
  );
