-- Go Vita promo codes and the automatic first-order discount.
-- Rules live in src/lib/promo/rules.ts; redemption is atomic in
-- src/lib/promo/server.ts (row lock on the code, one transaction with the order).

create table promo_codes (
  code            text primary key check (code ~ '^[A-Z0-9][A-Z0-9-]{2,31}$'),
  kind            text not null check (kind in ('percent', 'fixed')),
  value           integer not null check (value > 0),
  min_subtotal    integer check (min_subtotal is null or min_subtotal >= 0),
  max_uses        integer check (max_uses is null or max_uses > 0),
  uses            integer not null default 0 check (uses >= 0),
  per_phone_limit integer not null default 1 check (per_phone_limit > 0),
  -- A personal code: only this phone (last 9 digits) may redeem it.
  phone9          text check (phone9 is null or phone9 ~ '^[0-9]{9}$'),
  product_slugs   jsonb,
  starts_at       timestamptz,
  ends_at         timestamptz,
  active          boolean not null default true,
  source          text not null default 'manual'
                  check (source in ('manual', 'campaign', 'flow', 'referral', 'birthday', 'first-order')),
  campaign_id     text,
  note            text,
  created_at      timestamptz not null default now(),
  check (kind <> 'percent' or value <= 90),
  check (starts_at is null or ends_at is null or ends_at > starts_at)
);
create index promo_codes_created_idx on promo_codes (created_at desc);
create index promo_codes_phone_idx on promo_codes (phone9) where phone9 is not null;

create table promo_redemptions (
  id          bigserial primary key,
  code        text not null references promo_codes (code) on update cascade on delete restrict,
  order_id    bigint not null references orders (id) on delete cascade,
  phone9      text not null check (phone9 ~ '^[0-9]{9}$'),
  discount    integer not null check (discount >= 0),
  created_at  timestamptz not null default now(),
  unique (code, order_id)
);
create index promo_redemptions_code_phone_idx on promo_redemptions (code, phone9);
create index promo_redemptions_created_idx on promo_redemptions (created_at desc);

-- The code an order used (null for none). The discount lines themselves sit
-- in orders.totals.adjustments next to subtotal/discount/shipping/total.
alter table orders add column promo_code text;
create index orders_promo_code_idx on orders (promo_code) where promo_code is not null;
