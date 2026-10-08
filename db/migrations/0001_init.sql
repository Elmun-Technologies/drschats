-- Go Vita: catalogue, orders and admin accounts.
-- Localised text is stored as {"uz": …, "ru": …} JSON, the same shape the
-- built-in catalogue uses, so both sources feed one engine (src/lib/catalog).

create table categories (
  id          text primary key,
  slug        text not null unique,
  name        jsonb not null,
  description jsonb not null,
  image       text,
  sort        integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table brands (
  slug       text primary key,
  name       text not null,
  sort       integer not null default 0,
  created_at timestamptz not null default now()
);

create table products (
  id            text primary key,
  slug          text not null unique,
  category_slug text references categories (slug) on update cascade on delete set null,
  brand_slug    text references brands (slug) on update cascade on delete set null,
  price         integer not null check (price >= 0),
  old_price     integer check (old_price is null or old_price >= 0),
  in_stock      boolean not null default true,
  kind          text not null default 'core' check (kind in ('core', 'addon', 'unlisted')),
  sort          integer not null default 0,
  images        jsonb not null default '[]',
  cutout        text,
  unit          jsonb,
  content       jsonb not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index products_category_idx on products (category_slug);

create table orders (
  id          bigserial primary key,
  number      text generated always as ('GV-' || lpad(id::text, 6, '0')) stored unique,
  status      text not null default 'new'
              check (status in ('new', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total       integer not null,
  customer    jsonb not null,
  delivery    jsonb not null,
  payment     jsonb,
  items       jsonb not null,
  totals      jsonb not null,
  locale      text not null,
  attribution jsonb,
  admin_note  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index orders_created_idx on orders (created_at desc);
create index orders_status_idx on orders (status);

create table admin_users (
  id            serial primary key,
  email         text not null unique,
  name          text not null,
  password_hash text not null,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);
