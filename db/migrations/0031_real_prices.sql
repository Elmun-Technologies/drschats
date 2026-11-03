-- Real prices from the Dr Schatz single price list of 21.10.2026 (price with 12% VAT, so'm).
-- The built-in catalogue (lib/shopflow/mock.ts) carried demo prices; a database seeded from it
-- still has them. Only rows still at the seeded demo price change: a price an admin has set by
-- hand is never overwritten. The demo "old price" goes too, so no product shows a discount that
-- was never real. Delical is "ожидается" (awaited, no price) on the list: off sale until it arrives.

update products as p set price = v.price, old_price = null, updated_at = now()
from (values
  ('swiss-energy-calcivit-30', 265950, 276000),
  ('swiss-energy-visiovit-30', 265950, 276000),
  ('swiss-energy-immunovit-30', 265950, 276000),
  ('swiss-energy-hair-nail-skin-30', 265950, 276000),
  ('swiss-energy-potenton-30', 265950, 480000),
  ('swiss-energy-prenatal-forte-60', 379000, 470000),
  ('dr-frei-multivitamins-biotin-20', 79000, 66000),
  ('dr-frei-antistress-magniy-20', 79000, 66000),
  ('dr-frei-gold-vitamins-20', 69000, 66000),
  ('dr-frei-kids-multivitamins-20', 79000, 66000),
  ('swiss-energy-vitamin-c-20', 107000, 66000),
  ('swiss-energy-nature-collagen', 289000, 391000),
  ('dr-frei-tonometr-a20', 242000, 253000),
  ('dr-frei-turbo-base-ingalyator', 502950, 552000),
  ('dr-frei-turbo-lex-ingalyator', 489000, 673000),
  ('dr-frei-thermometer-t10', 89000, 44000),
  ('dr-frei-thermometer-t30', 99000, 64000),
  ('hiew-cooling-plaster-16', 65000, 150000)
) as v(slug, demo_price, price)
where p.slug = v.slug and p.price = v.demo_price;

update products set in_stock = false, old_price = null, updated_at = now()
where slug in ('delical-vanil-200ml', 'delical-shokolad-200ml', 'delical-abrikos-200ml')
  and price = 118000 and in_stock;
