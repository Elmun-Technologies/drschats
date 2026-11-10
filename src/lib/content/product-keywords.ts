/*
  The words people search a product by (docs/REJA-JALB-QILISH.md §6, T1).

  Buyers type «kalsiy d3», «магний б6», «витамины для беременных» — not
  «Calcivit» or «Prenatal Forte», which only someone who already knows the
  brand searches. Each entry is the product's own composition or form, put the
  way people type it (lib/keywords/subjects.ts holds the search phrases), and
  leads the page title, joins the H1 and the search index. Short card names
  stay as they are.

  Only what the pack says: an ingredient, a form, who it is made for. No
  promise of effect (health-claims.test.ts).
*/

export const PRODUCT_KEYWORDS: Record<string, { uz: string; ru: string }> = {
  "swiss-energy-calcivit-30": { uz: "Kalsiy D3 K2, kapsula", ru: "Кальций с D3 и K2, капсулы" },
  "swiss-energy-visiovit-30": { uz: "Koʻz uchun vitaminlar, lyutein", ru: "Витамины для глаз с лютеином" },
  "swiss-energy-immunovit-30": { uz: "Exinatseya, propolis va sink", ru: "Эхинацея, прополис, цинк" },
  "swiss-energy-hair-nail-skin-30": { uz: "Soch va tirnoq uchun vitaminlar", ru: "Витамины для волос и ногтей" },
  "swiss-energy-neuroforce-30": { uz: "B guruhi vitaminlari", ru: "Витамины группы B" },
  "swiss-energy-potenton-30": { uz: "Erkaklar uchun vitaminlar", ru: "Витамины для мужчин" },
  "swiss-energy-prenatal-forte-60": { uz: "Homiladorlar uchun vitaminlar", ru: "Витамины для беременных" },
  "swiss-energy-nature-collagen": { uz: "Kollagen kukuni", ru: "Коллаген порошок" },
  "swiss-energy-vitamin-c-20": { uz: "Vitamin C 550 mg, shipuchi", ru: "Витамин С 550 мг шипучий" },
  "dr-frei-multivitamins-biotin-20": { uz: "Multivitamin + biotin", ru: "Мультивитамины с биотином" },
  "dr-frei-antistress-magniy-20": { uz: "Magniy B6 shipuchi", ru: "Магний B6 шипучий" },
  "dr-frei-gold-vitamins-20": { uz: "Lyutein va vitaminlar, shipuchi", ru: "Витамины с лютеином, шипучие" },
  "dr-frei-kids-multivitamins-20": { uz: "Bolalar vitaminlari, 7 yoshdan", ru: "Детские витамины с 7 лет" },
  "aminomorin-forte-30": { uz: "Aminokislotalar va vitaminlar", ru: "Аминокислоты с витаминами" },
  "dr-frei-tonometr-a20": { uz: "Qon bosimi tonometri", ru: "Тонометр для давления" },
  "dr-frei-turbo-base-ingalyator": { uz: "Nebulayzer, kompressorli", ru: "Небулайзер компрессорный" },
  "dr-frei-turbo-lex-ingalyator": { uz: "Bolalar nebulayzeri", ru: "Детский небулайзер" },
  "dr-frei-thermometer-t10": { uz: "Elektron termometr", ru: "Электронный градусник" },
  "dr-frei-thermometer-t30": { uz: "Bolalar elektron termometri", ru: "Детский электронный градусник" },
  "hiew-cooling-plaster-16": { uz: "Sovutuvchi plastir, isitmada", ru: "Охлаждающий пластырь при жаре" },
  "peano-balzam-30g": { uz: "Teri uchun balzam", ru: "Крем-бальзам для кожи" },
  "hamdard-safi-eks1-200ml": { uz: "Oʻsimlik siropi", ru: "Растительный сироп" },
  "delical-vanil-200ml": { uz: "Klinik ovqatlanish ichimligi", ru: "Лечебное питание, напиток" },
  "delical-shokolad-200ml": { uz: "Klinik ovqatlanish ichimligi", ru: "Лечебное питание, напиток" },
  "delical-abrikos-200ml": { uz: "Klinik ovqatlanish ichimligi", ru: "Лечебное питание, напиток" },
  "swiss-energy-coffee-edel-250g": { uz: "Maydalangan qahva, arabika", ru: "Молотый кофе арабика" },
  "swiss-energy-coffee-edel-500g": { uz: "Maydalangan qahva, arabika", ru: "Молотый кофе арабика" },
  "swiss-energy-coffee-crema-250g": { uz: "Donli qahva", ru: "Кофе в зёрнах" },
  "swiss-energy-coffee-crema-500g": { uz: "Donli qahva", ru: "Кофе в зёрнах" },
  "swiss-energy-coffee-mokka-500g": { uz: "Qahva, arabika va robusta", ru: "Кофе арабика и робуста" },
};

export function productKeyword(slug: string, locale: "uz" | "ru"): string | undefined {
  return PRODUCT_KEYWORDS[slug]?.[locale];
}
