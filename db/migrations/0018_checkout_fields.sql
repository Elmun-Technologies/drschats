-- Checkout and product page fields.

-- One order per checkout form session: a double tap or a network retry sends
-- the same key and gets the first order back instead of a second one.
alter table orders add column idempotency_key text;
create unique index orders_idempotency_key_uniq on orders (idempotency_key) where idempotency_key is not null;

-- Package facts for the product page, shown only when filled:
-- facts = { contraindications: {uz, ru}, shelfLife: {uz, ru}, storage: {uz, ru} }.
alter table products
  add column facts jsonb,
  add column registration_number text;
