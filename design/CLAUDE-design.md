## Dizayn tizimi (GoVita, yakuniy dizayn — 2026-10)

Manba: `design/` papkasi. Har bir UI ishi oldidan tegishli `design/pages/<Sahifa>.html` va `design/screenshots/<Sahifa>.jpg` ni oʻqing. Dizayndan chetga chiqish faqat kelishilgan holda.

### Qatʼiy qoidalar
- **Yashil rang yoʻq.** Asosiy harakat — `ink` (#17191B) tugma, oq matn. Brend ranglari `forest` (#0F2D24) va `gold` (#B8954F) faqat logoda.
- **Qizil (#C8161D)** faqat chegirma uchun (pill badge «−11%», «Aksiyalar» havolasi). **Sariq (#FFD43B)** faqat «Xit» / «Arzon narx kafolati».
- **Faqat real maʼlumot.** Taymer, toʻqima sharh/reyting, «N kishi sotib oldi», oʻylab topilgan eski narx — yoʻq. Sharh boʻlmasa: «Hali sharh yoʻq» + «Sharh yozish».
- **AI-generatsiya rasm ishlatilmaydi.** Mahsulot — haqiqiy packshotning fonidan ajratilgan PNG (`c-*.png`), `tile` (#F1F3F0) fonida `object-fit: contain`. Lifestyle — litsenziyali stok foto.
- **BAD ogohlantirishi** mahsulot, test va maqola sahifalarida: «Biologik faol qoʻshimcha. Dori vositasi emas. Qabul qilishdan oldin mutaxassis bilan maslahatlashing.»
- **Tibbiy vaʼda yoʻq:** «davolaydi», «stressni kamaytiradi», «100% natija» kabi soʻzlar ishlatilmaydi.
- **Oʻzbek apostrofi** — `ʻ` (U+02BB): oʻ, gʻ, soʻm. Oddiy `'` emas.
- **Narx formati:** `79 000 soʻm` (minglik boʻsh joy bilan). Birlik narxi kartada: `3 950 soʻm / tabletka`.

### Tokenlar (`design/tokens.json` → Tailwind `theme.extend`)
- Ranglar: `bg #FFFFFF`, `tile #F1F3F0`, `tile-hover #E6E8E5`, `chip-strong #E3E6E9`, `line #E4E6E8`, `line-strong #D9DCDF`, `ink #17191B`, `ink-2 #44494E`, `muted #63686E`, `dark-panel #1C1F22`, `on-dark-2 #C9CDD1`, `red #C8161D`, `yellow #FFD43B`, `yellow-banner #FFE58A`, `forest #0F2D24`, `gold #B8954F`.
- Shrift: **Onest** 400/500/600/700 (`next/font/google`, `latin` + `cyrillic`). Logo — Playfair Display 500 (yoki SVG logo).
- Radius: badge `9999px`, tugma/input/chip `12px`, mahsulot rasmi `16px`, karta/panel `20px`, plitka/banner `24–28px`.
- Soya: faqat strelka tugmalari, xarid bloki va popoverlarda (`tokens.json` → `shadow`).
- Konteyner: `max-width: 1296px; padding: 0 24px`. Mobil gutter 16px.

### Tipografiya (desktop / mobil)
- Sahifa sarlavhasi 36/42 bold · mobil 28/34.
- Boʻlim sarlavhasi 30/36 bold · mobil 22/28.
- Asosiy matn 15–17px, `ink-2`. Meta 13–14px, `muted`.
- Narx: kartada 20px bold, PDP'da 34px bold.

### Komponentlar (dizayn fayli → React)
| Dizayn | React komponenti | Eslatma |
|---|---|---|
| `HeaderV3` | `Header` | utility qator + logo + qora «Katalog» + qidiruv + ikonlar + kategoriya qatori; `active`, `cartCount` props |
| `HeaderMobileV3` | `MobileHeader` | logo, shahar, til, telefon, qidiruv maydoni (bosilganda qidiruv ekrani) |
| `TabBarV3` | `MobileTabBar` | `position: fixed; bottom: 0` + `env(safe-area-inset-bottom)`; kontentga pastdan joy |
| `FooterV3` / `FooterMobileV3` | `Footer` | mobilda ustunlar akkordeon |
| `ProductCardV3` | `ProductCard` | props: product, inCart/qty, fav; rasm `contain` + 9% padding; `onCard` (qora panel ichida oq fon) |
| `AccountNavV3` | `AccountSidebar` | kabinet sahifalari |
| `InfoNavV3` | `InfoSidebar` | maʼlumot sahifalari |

### Mobil pastki panellar
Tab bar va PDP/savatdagi xarid paneli — **`position: fixed`**. Hech qachon `position: absolute; top: Npx` bilan emas (avvalgi «sahifa boʻsh koʻrinadi» xatosi shundan edi). Dizayndagi «birinchi ekran» (390×844) artboardlari panelning ekrandagi oʻrnini koʻrsatadi.

### Accessibility
- Interaktiv elementlar — `<button>` / `<a href>`; ikon tugmalarida `aria-label`.
- Teginish maydoni ≥ 44px. Matn kontrasti ≥ 4.5:1 (muted oqda 5.6:1).
