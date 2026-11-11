-- MXIK (IKPU) codes from the Dr Schatz product list of 11.11.2026, for the fiscal receipt
-- Payme prints (lib/payments/fiscal.ts). The list kept them as numbers, so the leading zero
-- was lost: 2106999028000000 there is 02106999028000000 here (17 digits).
-- Only empty codes are filled: a code an admin has typed in /admin/products is never
-- overwritten. Package codes are not on the list and stay empty until filled in the admin;
-- without them no receipt is sent (missingFiscalCodes).
-- Not on the list: Neuroforce, Aminomorin, Peano, Hamdard Safi and the coffees.

update products as p set mxik_code = v.mxik, updated_at = now()
from (values
  ('swiss-energy-calcivit-30', '02106999028000000'),
  ('swiss-energy-visiovit-30', '02106999028000000'),
  ('swiss-energy-immunovit-30', '02106999028000000'),
  ('swiss-energy-hair-nail-skin-30', '02106999028000000'),
  ('swiss-energy-potenton-30', '02106999028000000'),
  ('swiss-energy-prenatal-forte-60', '02106999028000000'),
  ('swiss-energy-vitamin-c-20', '02106999028000000'),
  ('swiss-energy-nature-collagen', '02106999028000000'),
  ('dr-frei-multivitamins-biotin-20', '02106999028000000'),
  ('dr-frei-antistress-magniy-20', '02106999028000000'),
  ('dr-frei-gold-vitamins-20', '02106999028000000'),
  ('dr-frei-kids-multivitamins-20', '02106999028000000'),
  ('delical-vanil-200ml', '02106999028000000'),
  ('delical-shokolad-200ml', '02106999028000000'),
  ('delical-abrikos-200ml', '02106999028000000'),
  ('dr-frei-tonometr-a20', '09018001227000000'),
  ('dr-frei-turbo-base-ingalyator', '09018001229000000'),
  ('dr-frei-turbo-lex-ingalyator', '09018001229000000'),
  ('dr-frei-thermometer-t10', '09025001002000000'),
  ('dr-frei-thermometer-t30', '09025001002000000'),
  ('hiew-cooling-plaster-16', '03304999072000000')
) as v(slug, mxik)
where p.slug = v.slug and p.mxik_code is null;
