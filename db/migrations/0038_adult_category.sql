-- The 18+ shelf (Dolphi — official distributor). Products in it are kept out of
-- every shared listing in code (lib/catalog/adult.ts); only the category row lives here.
insert into categories (id, slug, name, description, image, sort)
values (
  'cat-adult',
  'adult',
  '{"uz": "18+ Juftliklar uchun", "ru": "18+ Для пар"}'::jsonb,
  '{"uz": "Prezervativlar — rasmiy distributordan, maxfiy qadoqda.", "ru": "Презервативы — от официального дистрибьютора, в анонимной упаковке."}'::jsonb,
  null,
  900
)
on conflict (slug) do nothing;
