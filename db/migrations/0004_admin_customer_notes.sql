-- Private operational notes for customers. The phone tail is the same 9-digit
-- matching key used by the existing Telegram/order lookup; note content must
-- stay operational (never store health or payment-card data here).
create table admin_customer_notes (
  id            bigserial primary key,
  phone9        text not null check (phone9 ~ '^[0-9]{9}$'),
  admin_user_id integer references admin_users (id) on delete set null,
  note          text not null check (length(note) between 1 and 2000),
  created_at    timestamptz not null default now()
);
create index admin_customer_notes_customer_idx on admin_customer_notes (phone9, created_at desc);
