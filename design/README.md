# GoVita — yakuniy dizayn, Claude Code uchun topshiriq paketi

Bu papka govita.uz saytini yangi dizaynga oʻtkazish uchun kerak boʻlgan hamma narsani oʻz ichiga oladi. Dizayn manbasi — Claude'dagi «GoVita — sayt dizayni» kanvasi, «Yakuniy dizayn» sahifasi.

## Ichida nima bor

| Papka / fayl | Nima | Kim uchun |
|---|---|---|
| `pages/*.html` | Har bir sahifaning statik HTML nusxasi (brauzerda ochiladi, rasmlar bilan). 48 ta ekran + 8 ta komponent | Claude Code — markup va oʻlchamlar uchun asosiy manba |
| `pages/index.json` | Sahifalar roʻyxati: nomi, eni, balandligi, guruhi | Claude Code |
| `screenshots/*.jpg` | Har bir sahifaning toʻliq skrinshoti | Vizual solishtirish |
| `assets/` | Qadoq kesmalari (`c-*.png`), asl packshotlar (`q-*`, `p-*`), stok fotolar (`st-*`) | `public/images/` ga koʻchiriladi |
| `data/products.json` | 19 ta mahsulot: narx, eski narx, birlik, rasm fayllari | Seed / tekshiruv uchun |
| `tokens.json` | Dizayn tokenlari: ranglar, shrift, radius, soya | Tailwind sozlamalari |
| `source/` | Kanvasdagi asl fayllar (`.dc.html`, `kit.css`, `data.js`) | Faqat maʼlumot uchun |
| `CLAUDE-design.md` | Loyihaning `CLAUDE.md` fayliga qoʻshiladigan dizayn qoidalari | Claude Code |
| `TASKS.md` | Bosqichma-bosqich tayyor topshiriqlar (copy-paste) | Siz → Claude Code |
| `PAGES.md` | Sahifa → URL xaritasi | Claude Code |
| `OPEN-QUESTIONS.md` | Ishga tushirishdan oldin javob kerak boʻlgan savollar | Siz |

## Qanday ishlatiladi

1. Bu papkani govita.uz repozitoriyasining ildiziga `design/` nomi bilan qoʻying (`design/pages`, `design/assets` …).
2. `CLAUDE-design.md` mazmunini loyihaning `CLAUDE.md` fayliga qoʻshing (yoki Claude Code'ga «qoʻsh» deb ayting — 0-bosqichda bor).
3. `TASKS.md` dagi topshiriqlarni **tartib bilan, bittadan** Claude Code'ga bering. Har bosqichdan keyin natijani brauzerda koʻrib, keyingisiga oʻting.

Muhim: hamma sahifani bir martada soʻramang. Bosqichlar bir-biriga tayanadi (tokenlar → komponentlar → sahifalar).
