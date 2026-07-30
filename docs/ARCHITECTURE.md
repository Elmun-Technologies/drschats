# Go Vita — platforma arxitekturasi

Bu hujjat tanlangan stack'ni **hozirgi kod bazasiga** solishtiradi: nimasi
tayyor, nimasi o'zgaradi, qayerda men boshqa yechim tavsiya qilaman va nega.

Manba: `src/lib/shopflow/types.ts` (kontrakt), `src/lib/shopflow/http.ts`
(adapter), `docs/SHOPFLOW_API.md` (backend uchun endpoint spetsifikatsiyasi).

---

## 1. Hozirgi holat

| Qatlam | Maqsad | Hozir | Holat |
|---|---|---|---|
| Frontend | Next.js 15 (SSR/SEO) | Next.js 15 App Router, next-intl (uz/ru) | ✅ tayyor |
| Stil | Tailwind + komponent kutubxonasi | Tailwind v4, `@theme` tokenlari, o'z komponentlari | ✅ asosi tayyor |
| State | Zustand | Zustand + persist (cart, wishlist, upsell, toast) | ✅ tayyor |
| Backend | FastAPI (Python) | Yo'q. `ShopflowClient` interfeysi va `http` adapteri tayyor | ⚠️ backend yo'q |
| Navbatlar | Celery + broker | Yo'q | ❌ |
| Ma'lumotlar bazasi | PostgreSQL | Yo'q. Buyurtma faqat Telegram'ga xabar bo'lib ketadi, **saqlanmaydi** | ❌ |
| Qidiruv | Elastic/Meili | `getProducts(search)` backendga uzatiladi, indeks yo'q | ❌ |
| Kesh | Redis | Next.js ISR (`revalidate: 300`) | ⚠️ qisman |
| AI | Tavsiya, chat, rasm | `personalization/engine.ts` — content-based; quiz — qoidaviy | ⚠️ boshlang'ich |
| Mobil | React Native | Yo'q (PWA bor) | ❌ |
| DevOps | Docker, Nginx, CDN | Vercel | ⚠️ backend uchun yetmaydi |

Eng muhim bo'shliq — **baza yo'q**. Autentifikatsiya, buyurtma tarixi va
kabinetlar (LEVEL 2–5) shuning uchun boshlanmagan: ularning hammasi shu
poydevorga tayanadi.

---

## 2. Stack bo'yicha tavsiyalarim

Ro'yxatning ko'p qismi to'g'ri. Quyidagi olti nuqtada boshqacha qilishni
tavsiya qilaman — har biri bo'yicha sabab bor.

### 2.1 Ant Design emas → shadcn/ui

Ant Design o'zining dizayn tizimini olib keladi: o'z tokenlari, o'z
CSS-in-JS ishlab chiqarish qatlami, o'z tipografiyasi. Hozir loyihada
`src/styles/globals.css` ichida `@theme` tokenlari bor va endigina rang
sxemasi tanlanmoqda — Ant ularning ustidan yozadi, natijada ikkita
raqobatlashuvchi dizayn tizimi qoladi va bundle sezilarli og'irlashadi.

shadcn/ui — kutubxona emas, komponent kodini repoga **ko'chirib olish**.
Radix (a11y) + Tailwind (mavjud tokenlar). Dialog, Select, Popover,
Combobox kabi murakkab primitivlarni tayyor oladi, dizaynni buzmaydi.

### 2.2 Elasticsearch emas → Meilisearch

Katalog million emas — bir necha ming SKU. Farq operatsion:

| | Meilisearch | Elasticsearch |
|---|---|---|
| Resurs | ~100 MB RAM, bitta konteyner | JVM, 2–4 GB RAM, klaster mantiqi |
| Typo-tolerance | Qutidan | Sozlash kerak |
| Sozlash vaqti | Soatlar | Kunlar |

Typo-tolerance bu yerda hal qiluvchi: mijoz `magniy`, `магний`, `magnij`,
`magnesium` deb yozadi — to'rttasi ham bitta tovarni topishi shart.
Qidiruv API ortida turadi, shuning uchun kerak bo'lsa keyinchalik
Elasticsearch'ga ko'chish lokal o'zgarish bo'ladi.

### 2.3 RabbitMQ emas → Redis broker

Redis baribir kesh uchun kerak bo'ladi. Celery uni broker sifatida ham
ishlatadi — bu bitta xizmat kamayadi (monitoring, backup, yangilanish ham
shuncha kamayadi). Broker Celery konfiguratsiyasida bir qator; kunlik
yuz minglab vazifaga chiqqanda RabbitMQ'ga o'tish arzon.

### 2.4 Qdrant emas → PGVector

PostgreSQL baribir bo'ladi. Vektorlarni o'sha yerda saqlash — bitta
xizmat kam, bitta backup kam, JOIN esa oddiy SQL. Millionlab vektor va
alohida ANN indeks profili kerak bo'lganda Qdrant mantiqiy bo'ladi.

### 2.5 PyTorch / TensorFlow — hozir emas

Tavsiya modelini o'rgatish uchun ma'lumot kerak: ko'rishlar, savatga
qo'shishlar, buyurtmalar, qaytishlar. Hozir bularning **hech biri
saqlanmaydi** — buyurtma Telegram'ga ketadi va yo'qoladi.

Shuning uchun tartib teskari bo'lishi kerak: avval ma'lumot yig'ish
(Faza 1), keyin model. Boshlanishiga mavjud content-based engine +
PGVector embedding'lari (`text-embedding-3-small`) yetarli — ular
"o'xshash mahsulot" va "sizga mos" bloklarini bugun ishlatadi.
Bir necha oy real ma'lumotdan keyin o'rgatilgan model mantiqqa kiradi.

### 2.6 Rasm qidiruvi — obyekt aniqlash emas, OCR

Vitamin qutisi — obyekt emas, **matn tashuvchi**. Mijoz rasmga oladi,
javob esa quti yuzidagi yozuvda: brend, ingredient nomi, dozasi.
Kerak bo'lgani — Google Vision'ning **Text Detection (OCR)** qismi,
obyekt aniqlash emas. Bu arzonroq, aniqroq va OCR natijasini to'g'ridan
to'g'ri katalog qidiruviga uzatish mumkin.

---

## 3. Deploy: ikki joy, bitta API

FastAPI, Celery, PostgreSQL, Redis va Meilisearch — bularning hech biri
Vercel'da ishlamaydi (Vercel serversiz funksiyalar, doimiy jarayon emas).

```
  Vercel                          Hetzner / DigitalOcean (Docker)
  ┌──────────────┐   HTTPS        ┌────────────────────────────────┐
  │ Next.js      │ ─────────────► │ Nginx → FastAPI                │
  │ SSR, ISR, CDN│                │        Celery worker           │
  └──────────────┘                │        PostgreSQL + PGVector   │
         ▲                        │        Redis, Meilisearch      │
    Cloudflare                    └────────────────────────────────┘
```

Frontend Vercel'da qoladi — SSR, ISR va CDN aynan shu yerda kuchli, SEO
uchun ham shu muhim. Backend alohida serverda Docker Compose bilan
ko'tariladi. Ular orasidagi yagona bog'lanish — HTTPS API, va uni
`SHOPFLOW_API_URL` allaqachon qo'llab-quvvatlaydi.

---

## 4. Frontend uchun nima o'zgaradi

Deyarli hech narsa. Butun ma'lumot qatlami bitta interfeys ortida:

```ts
// src/lib/shopflow/types.ts
interface ShopflowClient {
  getCategories, getProducts, getProduct,
  getUpsells, getPromotions, createOrder
}
```

FastAPI shu 6 ta endpoint'ni bergan kuni `SHOPFLOW_MODE=http` qilinadi va
sayt real backend'ga o'tadi — boshqa hech qanday kod o'zgarmaydi. Kutilayotgan
so'rov/javob shakllari `docs/SHOPFLOW_API.md` da, kodning o'zidan olingan.
Javoblar Zod bilan chegarada tekshiriladi, shuning uchun shakl mos kelmasa
UI ichida emas, o'sha yerda xato beradi.

Yangi imkoniyatlar (auth, buyurtma tarixi, kabinetlar, qidiruv suggest, AI
konsultant) interfeysga yangi metod bo'lib qo'shiladi — mavjudlari tegilmaydi.

`SHOPFLOW_*` nomlari keyinchalik `GOVITA_API_*` ga o'zgartiriladi; bu bitta
faylga tegadigan o'zgarish, hozir shoshilinch emas.

---

## 5. Bosqichlar

| Faza | Mazmun | Nima ochiladi |
|---|---|---|
| **0** | Infra: `docker-compose.yml` (Postgres+PGVector, Redis, Meilisearch) | Backend jamoasi bugun ishlay boshlaydi |
| **1** | FastAPI: katalog, auth (JWT), buyurtma; Alembic migratsiyalari | **Buyurtma nihoyat saqlanadi**; mijoz hisobi paydo bo'ladi |
| **2** | Meilisearch indeksi + Celery sinxronizatsiya vazifasi | Tezkor qidiruv, filtr, suggest |
| **3** | Kabinetlar: user → doctor → partner → admin | LEVEL 2–5 |
| **4** | AI: PGVector embedding, OCR, LangChain konsultant | Rasm orqali qidiruv, aqlli tavsiya |
| **5** | React Native ilova | iOS + Android |

Faza 1 eng qimmatli: undan keyin **har bir buyurtma bazada qoladi**, ya'ni
tahlil, qayta sotuv va tavsiya modeli uchun ma'lumot to'plana boshlaydi.

---

## 6. Hali hal qilinmagan savollar

- **To'lov provayderi** — Payme, Click, Uzum Bank? Ularning har biri
  backend'da alohida integratsiya va Faza 1 hajmiga ta'sir qiladi.
- **Buyurtma hozir** faqat Telegram'ga xabar bo'lib boradi va saqlanmaydi.
  Faza 1 gacha shunday qoladi — bu tan olingan vaqtinchalik yechim.
- **Server va domen** hisoblari kim nomiga ochiladi.
- **Tibbiy matnlar** (sog'liq mavzulari, ingredient tavsiflari) kim
  tomonidan yoziladi — sayt strukturasi tayyor, kontent kutilmoqda.
