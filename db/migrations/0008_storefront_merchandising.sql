-- Storefront merchandising managed from /admin/storefront ("Vitrina"):
-- banners (home hero, the thin strip under the header, catalogue pages) and
-- the deal of the day. The announcement bar lives in site_settings
-- ('storefront.announcements', JSON) — it is a handful of lines, not rows.

create table banners (
  id             bigserial primary key,
  placement      text not null check (placement in ('hero', 'strip', 'category')),
  title          jsonb not null,
  subtitle       jsonb not null default '{"uz":"","ru":""}',
  cta            jsonb not null default '{"uz":"","ru":""}',
  -- An internal path ("/product/…") or an https:// link.
  href           text not null check (href ~ '^(/[^/]|https://)' or href = '/'),
  image          text,
  image_mobile   text,
  theme          text not null default 'light' check (theme in ('light', 'dark')),
  starts_at      timestamptz,
  ends_at        timestamptz,
  -- A countdown is only ever a real end date.
  show_countdown boolean not null default false check (not show_countdown or ends_at is not null),
  sort           integer not null default 0,
  active         boolean not null default true,
  clicks         integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index banners_placement_idx on banners (placement, sort);

/*
  Deal of the day ("Bugungi taklif"). A row is a schedule entry, not a price
  edit: the catalogue engine computes the product's price from it on every
  read while now() is inside [starts_at, ends_at), and the product row itself
  is never touched — so a deal starts and ends on time with no process
  running at that moment, and the order action (which prices through the
  same engine) charges exactly what the page shows.

  Exactly one of percent / price. Two deals can never overlap in time.
*/
create table deals (
  id           bigserial primary key,
  product_slug text not null references products (slug) on update cascade on delete cascade,
  percent      integer check (percent is null or percent between 1 and 90),
  price        integer check (price is null or price > 0),
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  created_by   integer references admin_users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check ((percent is null) <> (price is null)),
  check (ends_at > starts_at),
  constraint deals_no_overlap exclude using gist (tstzrange(starts_at, ends_at) with &&)
);
create index deals_ends_idx on deals (ends_at);
