-- Go Vita CRM: first-party visitor journey, admin-managed promotions,
-- segment campaigns and plain (non-secret) site settings.

-- One row per browser (first-party cookie gv_vid). Phone is attached only
-- when the visitor places an order; until then the row is anonymous.
create table visitors (
  id             uuid primary key,
  first_seen_at  timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  sessions       integer not null default 1,
  last_session   text,
  page_views     integer not null default 0,
  locale         text,
  device         text check (device in ('mobile', 'tablet', 'desktop')),
  first_touch    jsonb,
  last_touch     jsonb,
  stage          text not null default 'visit'
                 check (stage in ('visit', 'product', 'cart', 'checkout', 'customer')),
  cart_value     integer not null default 0,
  cart_items     jsonb not null default '[]',
  cart_at        timestamptz,
  phone9         text check (phone9 ~ '^[0-9]{9}$'),
  name           text,
  orders_count   integer not null default 0,
  last_order_at  timestamptz
);
create index visitors_last_seen_idx on visitors (last_seen_at desc);
create index visitors_phone_idx on visitors (phone9) where phone9 is not null;
create index visitors_stage_idx on visitors (stage, last_seen_at desc);

create table visitor_events (
  id           bigserial primary key,
  visitor_id   uuid not null references visitors (id) on delete cascade,
  session_id   text not null,
  type         text not null check (type in (
                 'page_view', 'view_item', 'add_to_cart', 'remove_from_cart',
                 'view_cart', 'begin_checkout', 'purchase', 'search',
                 'add_to_wishlist', 'quiz_complete'
               )),
  path         text,
  product_slug text,
  value        integer,
  meta         jsonb,
  created_at   timestamptz not null default now()
);
create index visitor_events_visitor_idx on visitor_events (visitor_id, created_at desc);
create index visitor_events_created_idx on visitor_events (created_at desc);
create index visitor_events_type_idx on visitor_events (type, created_at desc);
create index visitor_events_product_idx on visitor_events (product_slug, created_at desc) where product_slug is not null;

alter table orders add column visitor_id uuid references visitors (id) on delete set null;
create index orders_visitor_idx on orders (visitor_id) where visitor_id is not null;

-- Promotions the admin manages. The built-in ones in code are only a
-- fallback for a database without rows here.
create table promotions (
  id            text primary key,
  type          text not null check (type in ('percent_off', 'buy_x_get_y', 'free_shipping_over')),
  title         jsonb not null,
  description   jsonb not null,
  percent       integer check (percent is null or percent between 1 and 90),
  threshold     integer check (threshold is null or threshold >= 0),
  product_slugs jsonb,
  active        boolean not null default true,
  starts_at     timestamptz,
  ends_at       timestamptz,
  sort          integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table campaigns (
  id            bigserial primary key,
  name          text not null check (length(name) between 1 and 120),
  channel       text not null check (channel in ('telegram')),
  segment       text not null,
  message       text not null check (length(message) between 1 and 3500),
  status        text not null default 'draft' check (status in ('draft', 'sent')),
  audience      integer not null default 0,
  queued        integer not null default 0,
  created_by    integer references admin_users (id) on delete set null,
  created_at    timestamptz not null default now(),
  sent_at       timestamptz
);

-- Public, non-secret settings (analytics IDs, verification codes, flags).
-- Secrets stay in integration_settings, encrypted.
create table site_settings (
  key         text primary key,
  value       text not null,
  updated_by  integer references admin_users (id) on delete set null,
  updated_at  timestamptz not null default now()
);

-- Bumped to sign every session of an admin out (password change, "log out everywhere").
alter table admin_users add column session_epoch integer not null default 0;
