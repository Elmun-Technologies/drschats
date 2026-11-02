-- Operations: shared rate limits, CSP report counts, worker heartbeat and
-- alert state, the operator ping flag, and indexes for admin search.
-- Additive only (expand): nothing existing is dropped or renamed.

-- Rate limits shared by every machine and kept across deploys (lib/rate-limit-store.ts).
-- `key` is an HMAC of the scope's key (IP, phone, email), never the raw value.
create table rate_limit_hits (
  scope     text not null,
  key       text not null,
  count     integer not null default 1,
  reset_at  timestamptz not null,
  primary key (scope, key)
);
create index rate_limit_hits_reset_idx on rate_limit_hits (reset_at);

-- Content-Security-Policy violations, counted per day (POST /api/csp-report).
-- Only the directive and the blocked origin; no page URL with a query, no IP.
create table csp_reports (
  day        date not null,
  directive  text not null,
  blocked    text not null,
  count      integer not null default 0,
  last_at    timestamptz not null default now(),
  primary key (day, directive, blocked)
);

-- Small operational state: the worker's last tick, the last time each alert fired.
create table ops_state (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- The operator's Telegram ping: null = not delivered yet, the worker retries.
-- Orders that exist today count as delivered — they must not be re-sent.
alter table orders
  add column operator_notified_at timestamptz,
  add column operator_notify_attempts smallint not null default 0;
update orders set operator_notified_at = created_at;
create index orders_operator_unsent_idx on orders (created_at) where operator_notified_at is null;

-- Unpaid online orders the worker releases after a while (lib/orders/release.ts).
create index orders_new_online_idx on orders (created_at) where status = 'new' and payment_status in ('unpaid', 'pending');

-- The same phone-9 expression orders_phone9 uses, for telegram_links lookups by phone.
create index telegram_links_phone9 on telegram_links (right(regexp_replace(phone, '\D', '', 'g'), 9));

-- Retention sweeps delete by age.
create index bot_jobs_created_idx on bot_jobs (created_at);
create index banner_exposures_created_idx on banner_exposures (created_at);

-- Admin search: trigram indexes when the extension is available. Managed
-- Postgres may not allow it; the search still works without them (seq scan).
do $$
begin
  begin
    create extension if not exists pg_trgm;
  exception when others then
    raise notice 'pg_trgm not available: admin search stays unindexed';
  end;
  if exists (select 1 from pg_extension where extname = 'pg_trgm') then
    execute 'create index if not exists orders_customer_name_trgm on orders using gin ((customer ->> ''name'') gin_trgm_ops)';
    execute 'create index if not exists orders_customer_phone_trgm on orders using gin ((customer ->> ''phone'') gin_trgm_ops)';
    execute 'create index if not exists orders_number_trgm on orders using gin (number gin_trgm_ops)';
    execute 'create index if not exists products_name_uz_trgm on products using gin ((content -> ''name'' ->> ''uz'') gin_trgm_ops)';
    execute 'create index if not exists products_name_ru_trgm on products using gin ((content -> ''name'' ->> ''ru'') gin_trgm_ops)';
  end if;
end
$$;
