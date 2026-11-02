-- Online payments (Payme Merchant API, Click SHOP API): lib/payments/.

-- One row per provider transaction. Payme sends its own transaction id;
-- Click sends click_trans_id. State follows Payme's numbers for both:
--   1 created / prepared, 2 performed / completed,
--  -1 cancelled before it was paid, -2 cancelled (refunded) after it was paid.
create table payments (
  id              bigserial primary key,
  provider        text not null check (provider in ('payme', 'click')),
  provider_tx_id  text not null,
  order_number    text not null references orders(number),
  amount          bigint not null,             -- tiyin (1/100 so'm), as Payme counts
  state           smallint not null default 1 check (state in (1, 2, -1, -2)),
  reason          smallint,                     -- Payme cancel reason code
  create_time     bigint not null,              -- ms since epoch, our clock
  perform_time    bigint,
  cancel_time     bigint,
  provider_time   bigint,                       -- Payme's "time" param
  raw             jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (provider, provider_tx_id)
);
create index payments_order_idx on payments (order_number);
create index payments_create_time_idx on payments (provider, create_time);

-- What the shop knows about the money: unpaid (cash or not yet), pending
-- (sent to a gateway), paid, refunded.
alter table orders
  add column payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'refunded')),
  add column paid_at timestamptz;

-- Fiscal receipt data Payme needs per line (MXIK / IKPU code from tasnif.soliq.uz).
alter table products
  add column mxik_code text check (mxik_code is null or mxik_code ~ '^[0-9]{17}$'),
  add column package_code text check (package_code is null or package_code ~ '^[0-9]{1,20}$');
