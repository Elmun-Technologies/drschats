# Sahifa → URL xaritasi

Mavjud yoʻnalishlar (route) saqlanadi; quyidagi URL'lar — taklif. Claude Code avval loyihadagi mavjud yoʻnalishlarni tekshirib, moslashtiradi.

## Desktop
| Dizayn fayli | Sahifa | Taklif URL |
|---|---|---|
| HomeV3 | Bosh sahifa | `/` |
| MegaMenuV3 | Katalog menyusi (Header ichidagi ochiluvchi panel) | — |
| CatalogV3 | Kategoriya | `/catalog/[category]` |
| SearchV3 | Qidiruv natijalari + takliflar oynasi (Header'dagi autocomplete) | `/search?q=` |
| SearchEmptyV3 | Qidiruv — natija yoʻq | `/search?q=` (holat) |
| SaleV3 | Aksiyalar | `/sale` |
| BrandsV3 | Brendlar | `/brands` |
| BrandV3 | Brend sahifasi | `/brands/[slug]` |
| ProductV3 | Mahsulot | `/product/[slug]` |
| CompareV3 | Taqqoslash | `/compare` |
| FavoritesV3 | Sevimlilar | `/wishlist` |
| CartV3 | Savat + rasmiylashtirish (bitta sahifa) | `/cart` |
| CartEmptyV3 | Boʻsh savat | `/cart` (holat) |
| OrderSuccessV3 | Buyurtma qabul qilindi | `/checkout/success` |
| LoginV3 | Kirish (Telegram kodi) | `/account/login` |
| AccountV3 | Kabinet — buyurtmalar | `/account` |
| OrderDetailV3 | Buyurtma tafsiloti | `/account/orders/[id]` |
| SubscriptionsV3 | Obunalarim | `/account/subscriptions` |
| ProfileV3 | Profilim | `/account/profile` |
| QuizV3 / QuizResultV3 | Vitamin testi / natija | `/quiz`, `/quiz/result` |
| DeliveryV3 | Yetkazib berish | `/delivery` |
| PaymentV3 | Toʻlov | `/payment` |
| GuaranteeV3 | Kafolat va qaytarish | `/guarantee` |
| LoyaltyV3 | Chegirma tizimi | `/loyalty` |
| AboutV3 | Biz haqimizda (+ rekvizitlar) | `/about` |
| LicensesV3 | Litsenziya va sertifikatlar | `/licenses` |
| PartnersV3 | Dorixonalar va hamkorlar | `/partners` |
| ContactV3 | Aloqa | `/contact` |
| BlogV3 / ArticleV3 | Blog / maqola | `/blog`, `/blog/[slug]` |
| NotFoundV3 | 404 | `not-found.tsx` |

## Mobil (390 px)
Mobil sahifalar desktop sahifalarning responsiv koʻrinishi — alohida route emas. Xos ekranlar:
| Dizayn fayli | Nima |
|---|---|
| HomeMobileFirstV3 / ProductMobileFirstV3 | Birinchi ekran: fixed tab bar / xarid paneli joyi |
| MenuMobileV3 | Tab bar → «Katalog» ekrani |
| FiltersMobileV3 | Filtrlar — pastdan chiqadigan sheet |
| SearchMobileV3 | Toʻliq ekranli qidiruv |
| qolganlari | Mos desktop sahifaning mobil koʻrinishi |
