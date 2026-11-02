-- Customer reviews (moderated) and recorded subscriptions.

-- A review is written on the product page and shown only after an admin
-- approves it in /admin/reviews. Only approved rows feed the product's rating.
create table reviews (
  id            bigserial primary key,
  product_slug  text not null,
  rating        smallint not null check (rating between 1 and 5),
  author        text not null check (char_length(author) between 2 and 60),
  text          text not null check (char_length(text) between 10 and 2000),
  phone9        text check (phone9 ~ '^[0-9]{9}$'),
  -- True when this phone has a delivered order with this product (checked when written).
  verified      boolean not null default false,
  locale        text not null default 'uz',
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderated_by  text,
  moderated_at  timestamptz,
  created_at    timestamptz not null default now()
);
create index reviews_product_idx on reviews (product_slug, status, created_at desc);
create index reviews_status_idx on reviews (status, created_at desc);

-- "Obuna" lines of site orders: one active row per phone and product. The
-- next delivery date is a reminder for the operator and (through an opt-in
-- flow) the customer; nothing is charged or shipped automatically.
create table subscriptions (
  id                 bigserial primary key,
  phone9             text not null check (phone9 ~ '^[0-9]{9}$'),
  product_slug       text not null,
  product_name       text not null,
  quantity           integer not null check (quantity > 0),
  interval_days      integer not null check (interval_days between 7 and 365),
  locale             text not null default 'uz',
  customer_name      text,
  first_order_id     bigint references orders(id) on delete set null,
  last_order_id      bigint references orders(id) on delete set null,
  last_order_number  text,
  status             text not null default 'active' check (status in ('active', 'cancelled')),
  next_due_at        timestamptz not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create unique index subscriptions_active_uniq on subscriptions (phone9, product_slug) where status = 'active';
create index subscriptions_due_idx on subscriptions (status, next_due_at);
