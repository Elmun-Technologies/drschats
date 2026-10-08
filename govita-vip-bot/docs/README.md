# GoVita VIP Salomatlik Klubi — bot paketi

ShopFlow'da generic quriladi, GoVita — birinchi tenant. Mavjud doʻkon boti klub botiga kengayadi (ikkinchi bot yoʻq).

## Tarkib
| Fayl | Nima |
|---|---|
| `SPEC.md` | Mahsulot va texnik spetsifikatsiya: oqimlar, arxitektura, xavfsizlik, metrikalar, bosqichlar, xavflar |
| `DATA-MODEL.md` | Prisma qoʻshimchalari va hisob qoidalari |
| `API.md` | Public API v1 `/club/*` endpointlari (sayt uchun) |
| `MESSAGES.md` | Bot tizim xabarlari uz/ru + callback formati |
| `botflow/govita-botflow-now.json` | **Bugun** yuklasa boʻladigan BotFlow (hozirgi sxemada valid) |
| `botflow/govita-botflow.json` | Yangi actionlar bilan yakuniy BotFlow |
| `botflow/bot-flow-schema.patch` | Sxemaga 7 ta yangi action |
| `botflow/gen_flow.py`, `validate.mts` | JSON generatori va zod tekshiruvi |
| `TASKS-shopflow.md` | ShopFlow repo uchun 0–8 bosqich promptlari |
| `TASKS-govita-site.md` | govita.uz integratsiyasi (A–E) |
| `OPEN-QUESTIONS.md` | Javob kerak boʻlgan 12 savol |
| `mockups/*.png` | 10 ta bot ekrani (390×844) |

## Claude Code'da ishlatish
1. ShopFlow sessiyasiga zip'ni yuboring: «`docs/club/` ga och, `TASKS-shopflow.md` Bosqich 0 ni bajar».
2. Har bosqich — alohida draft PR. Review → merge → keyingi bosqich.
3. ShopFlow Bosqich 4 tayyor boʻlgach — govita.uz sessiyasida `TASKS-govita-site.md`.

## Ishga tushirish (kodsiz qism)
1. Admin → Bot konstruktori → `govita-botflow-now.json` import (darhol).
2. BotFather: nom, tavsif, rasm, buyruqlar (`/start`, `/aksiyalar`, `/klub`, `/yordam` — BotFlow'dan avtomatik).
3. Admin → Sozlamalar → Klub: imkoniyatlarni bosqichma-bosqich yoqish.
4. Mahsulotlarga doza maʼlumoti (kurs tugashi shunga bogʻliq).
5. `club-backfill` dry-run → tekshirish → `--apply`.
6. Feature'lar tayyor boʻlgach — `govita-botflow.json` import.
7. Saytdagi bot havolalari (footer, LoyaltyV3, OrderSuccess, Login).
