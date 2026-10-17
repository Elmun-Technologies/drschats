-- Go Vita: real stock quantities, their audit trail, and the restock /
-- price-drop waitlist.

-- null = not tracked: the product behaves exactly as before (in_stock alone).
-- When tracked, in_stock follows the count (0 → false) and orders take from it.
alter table products
  add column stock_qty    integer check (stock_qty is null or stock_qty >= 0),
  add column low_stock_at integer check (low_stock_at is null or low_stock_at between 1 and 1000);

-- Every change to a tracked count, so "where did the 12 go" has an answer.
-- An order's net (order + cancel rows) is what makes cancelling idempotent.
create table stock_movements (
  id          bigserial primary key,
  product_id  text not null references products (id) on delete cascade,
  delta       integer not null check (delta <> 0),
  reason      text not null check (reason in ('order', 'cancel', 'manual', 'import')),
  order_id    bigint references orders (id) on delete set null,
  admin_note  text,
  created_at  timestamptz not null default now()
);
create index stock_movements_product_idx on stock_movements (product_id, created_at desc);
create index stock_movements_order_idx on stock_movements (order_id) where order_id is not null;

-- "Tell me when it is back" / "tell me when it is cheaper". One waiting
-- request per product, phone and kind; a repeat submission refreshes it.
create table restock_requests (
  id               bigserial primary key,
  product_id       text not null references products (id) on delete cascade,
  product_slug     text not null,
  phone9           text not null check (phone9 ~ '^[0-9]{9}$'),
  phone            text not null,
  locale           text not null default 'uz' check (locale in ('uz', 'ru')),
  kind             text not null default 'restock' check (kind in ('restock', 'price_drop')),
  target_price     integer check (target_price is null or target_price >= 0),
  telegram_chat_id bigint,
  status           text not null default 'waiting' check (status in ('waiting', 'notified', 'cancelled')),
  notified_via     text check (notified_via in ('telegram', 'sms', 'operator', 'manual')),
  created_at       timestamptz not null default now(),
  notified_at      timestamptz
);
create unique index restock_requests_waiting_uq on restock_requests (product_id, phone9, kind) where status = 'waiting';
create index restock_requests_status_idx on restock_requests (status, created_at desc);
