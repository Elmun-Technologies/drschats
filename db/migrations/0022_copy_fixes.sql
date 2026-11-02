-- Copy fixed in src/lib/shopflow/mock.ts after the catalogue was first copied
-- into the database (lib/admin/seed.ts runs once). Each change applies only
-- where the row still holds the old seeded text, so anything the team edited
-- in the admin panel is left exactly as it is.

-- Category names: Uzbek apostrophe (ʻ, U+02BB), and one name for `herbal`
-- (the same as categoryNames.herbal in uz/ru.json). catSimple() seeded the
-- name into the description too.
update categories set
  name = jsonb_set(name, '{uz}', to_jsonb('Oʻsimlik mahsulotlari'::text)),
  updated_at = now()
where slug = 'herbal' and name ->> 'uz' in ('O''simlik vositalari', 'Oʻsimlik vositalari');
update categories set
  name = jsonb_set(name, '{ru}', to_jsonb('Растительные продукты'::text)),
  updated_at = now()
where slug = 'herbal' and name ->> 'ru' = 'Растительные средства';
update categories set
  description = jsonb_set(jsonb_set(description, '{uz}', to_jsonb('Oʻsimlik mahsulotlari'::text)), '{ru}', to_jsonb('Растительные продукты'::text)),
  updated_at = now()
where slug = 'herbal' and description ->> 'uz' in ('O''simlik vositalari', 'Oʻsimlik vositalari') and description ->> 'ru' = 'Растительные средства';

update categories set name = jsonb_set(name, '{uz}', to_jsonb('Omega va baliq yogʻi'::text)), updated_at = now()
where slug = 'omega' and name ->> 'uz' = 'Omega va baliq yog''i';
update categories set description = jsonb_set(description, '{uz}', to_jsonb('Omega va baliq yogʻi'::text)), updated_at = now()
where slug = 'omega' and description ->> 'uz' = 'Omega va baliq yog''i';

update categories set name = jsonb_set(name, '{uz}', to_jsonb('Boʻgʻimlar'::text)), updated_at = now()
where slug = 'joints' and name ->> 'uz' = 'Bo''g''imlar';
update categories set description = jsonb_set(description, '{uz}', to_jsonb('Boʻgʻimlar'::text)), updated_at = now()
where slug = 'joints' and description ->> 'uz' = 'Bo''g''imlar';

-- «Kompyuterda»: the seeded FAQ had a Cyrillic «ер» inside the word and ASCII apostrophes.
update products set
  content = replace(
    replace(content::text, 'Kompyutерda ko''p ishlaydiganlarga mosmi?', 'Kompyuterda koʻp ishlaydiganlarga mosmi?'),
    'Ha, raqamli qurilmalar ko''z toliqishida juda foydali.', 'Ha, raqamli qurilmalar koʻz toliqishida juda foydali.'
  )::jsonb,
  updated_at = now()
where content::text like '%Kompyutерda ko''p ishlaydiganlarga mosmi?%'
   or content::text like '%Ha, raqamli qurilmalar ko''z toliqishida juda foydali.%';

-- Hamdard Safi: no medical promise ("qonni tozalash", acne). Field by field,
-- each only while it still equals the seeded text.
update products set content = jsonb_set(content, '{tagline}', '{"uz": "Hindistonda ishlab chiqarilgan oʻsimlik siropi", "ru": "Растительный сироп индийского производства"}'::jsonb), updated_at = now()
where slug = 'hamdard-safi-eks1-200ml'
  and content -> 'tagline' = '{"uz": "Qonni kompleks tozalash uchun oʻsimlik siropi", "ru": "Растительный сироп для комплексного очищения крови"}'::jsonb;

update products set content = jsonb_set(content, '{description}', '{"uz": "HAMDARD SAFI — oʻsimlik ekstraktlari asosidagi sirop, Hindistonda ishlab chiqarilgan. 200 ml. Biologik faol qoʻshimcha, dori vositasi emas.", "ru": "HAMDARD SAFI — сироп на основе растительных экстрактов, произведён в Индии. 200 мл. Биологически активная добавка, не является лекарством."}'::jsonb), updated_at = now()
where slug = 'hamdard-safi-eks1-200ml'
  and content -> 'description' = '{"uz": "HAMDARD SAFI — qonni tozalash uchun Hindiston oʻsimlik siropi. Teridagi muammolar va organizmni tozalash uchun anʼanaviy vosita. 200 ml.", "ru": "HAMDARD SAFI — индийский растительный сироп для очищения крови. Традиционное средство для кожных проблем и детоксикации организма. 200 мл."}'::jsonb;

update products set content = jsonb_set(content, '{highlights}', '{"uz": ["Oʻsimlik asosida", "Hindiston formulasi", "200 ml"], "ru": ["На растительной основе", "Индийская формула", "200 мл"]}'::jsonb), updated_at = now()
where slug = 'hamdard-safi-eks1-200ml'
  and content -> 'highlights' = '{"uz": ["Qonni tozalash", "Oʻsimlik asosida", "Hindiston formulasi", "200 ml"], "ru": ["Очищение крови", "На растительной основе", "Индийская формула", "200 мл"]}'::jsonb;

update products set content = jsonb_set(content, '{benefits}', '{"uz": [{"icon": "shield", "title": "Oʻsimlik asosida", "description": "Oʻsimlik ekstraktlari kompleksi."}, {"icon": "sparkle", "title": "Anʼanaviy retsept", "description": "Hindiston formulasi boʻyicha tayyorlangan."}], "ru": [{"icon": "shield", "title": "На растительной основе", "description": "Комплекс растительных экстрактов."}, {"icon": "sparkle", "title": "Традиционный рецепт", "description": "Приготовлен по индийской формуле."}]}'::jsonb), updated_at = now()
where slug = 'hamdard-safi-eks1-200ml'
  and content -> 'benefits' = '{"uz": [{"icon": "shield", "title": "Qon tozalash", "description": "Tanani ichkaridan tozalaydi."}, {"icon": "sparkle", "title": "Teri muammolari", "description": "Akne va teri kasalliklarida yordam beradi."}], "ru": [{"icon": "shield", "title": "Очищение крови", "description": "Очищает организм изнутри."}, {"icon": "sparkle", "title": "Проблемы кожи", "description": "Помогает при акне и кожных заболеваниях."}]}'::jsonb;
