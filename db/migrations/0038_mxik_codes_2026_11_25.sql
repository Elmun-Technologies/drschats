-- MXIK (IKPU) codes re-checked against the Dr Schatz price list of 25.11.2026 (column «ИКПУ»),
-- which the owner named as the authoritative one. Every product of the catalogue that is on
-- the list gets the list's code, also where another code had been typed in the admin since
-- 0035 (which only filled empty fields). The codes themselves are the same as on 11.11.
-- Not on the list, so still without a code: Neuroforce, Aminomorin, Peano, Hamdard Safi and
-- the coffees. Package codes are not on the list either and stay as they are; without them no
-- receipt is sent (missingFiscalCodes) — /admin/products → «Fiskal kodsiz» shows what is left.

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
where p.slug = v.slug and p.mxik_code is distinct from v.mxik;
