-- A sale with an end: after sale_ends_at the product sells at its old price
-- again and the countdown disappears (src/lib/catalog/engine.ts).
alter table products add column sale_ends_at timestamptz;
