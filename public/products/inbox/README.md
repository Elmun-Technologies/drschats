# Rasmlar kirish papkasi / Inbox for real product photos

Real mahsulot rasmlarini **shu yerga** tashlang — fayl nomlari qanday bo'lsa
shunday qolsin (rus tilida, bo'shliq bilan, `(1)` bilan — muhim emas).

Кладите настоящие фото товаров **сюда** — имена файлов можно не менять
(русские названия, пробелы, `(1)` — не важно).

```bash
node scripts/assets/ingest-product-images.mjs          # ko'rish / dry run
node scripts/assets/ingest-product-images.mjs --write  # qo'llash / apply
```

Skript nima qiladi / What the script does:

1. Fayl nomini lotin slufiga o'giradi (`Витамин С 550мг.jpg` → `vitamin-c-550mg`).
2. Katalogdagi mahsulotga moslaydi (`src/lib/shopflow/mock.ts` o'qiladi).
3. Rasmni `public/products/<slug>.jpg` ga ko'chiradi va
   `src/lib/content/product-photos.ts` ni yangilaydi.
4. Mos kelmagan rasmlarni **inbox'da qoldiradi** va hisobotda chiqaradi —
   ular uchun yangi mahsulot sahifasi ochish kerak bo'ladi.

Files that match nothing are left here on purpose: inventing a product page
from a filename is a guess, so the report lists them for a human instead.
