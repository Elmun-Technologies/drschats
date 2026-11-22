import { getArticles } from "@/lib/content/blog";
import { SITE_URL } from "@/lib/config/site";

const MAX_ARTICLES = 30;

export function llmsTxt(siteUrl: string = SITE_URL): string {
  const articles = [...getArticles("uz")]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_ARTICLES);

  return [
    "# govita",
    "",
    "> govita.uz — O'zbekistondagi onlayn do'kon: vitaminlar, biologik faol qo'shimchalar (BAD) va med-kosmetika. Toshkentda va viloyatlarga yetkazib berish. Saytda uz va ru tillari bor.",
    "",
    "BAD — dori vositasi emas. Maqolalar umumiy ma'lumot uchun; qabul qilishdan oldin mutaxassis bilan maslahatlashing.",
    "",
    "## Asosiy bo'limlar",
    `- [Mahsulotlar](${siteUrl}/uz/products): to'liq katalog, narxlar va mavjudlik`,
    `- [Vitaminlar](${siteUrl}/uz/vitamins): vitaminlar bo'yicha qo'llanmalar`,
    `- [Maqsadlar](${siteUrl}/uz/goals): sog'liq maqsadi bo'yicha tanlash`,
    `- [Belgilar](${siteUrl}/uz/symptoms): bezovta qilayotgan belgi bo'yicha tanlash`,
    `- [Test](${siteUrl}/uz/quiz): qisqa savollar orqali tavsiya`,
    `- [Blog](${siteUrl}/uz/blog): maqolalar`,
    `- [Yetkazib berish](${siteUrl}/uz/delivery): shartlar va muddatlar`,
    `- [Qayerdan sotib olish](${siteUrl}/uz/where-to-buy): dorixonalar`,
    "",
    "## Til versiyalari",
    `- O'zbekcha: ${siteUrl}/uz`,
    `- Ruscha: ${siteUrl}/ru`,
    "",
    "## So'nggi maqolalar",
    ...articles.map((a) => `- [${a.title}](${siteUrl}/uz/blog/${a.slug})`),
    "",
    "## Texnik",
    `- [Sitemap](${siteUrl}/sitemap.xml)`,
    "",
  ].join("\n");
}
