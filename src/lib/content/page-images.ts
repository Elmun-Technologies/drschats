import type { TopicImage } from "./topic-images";

/**
 * Photos for the 30-day programme pages and the ingredient cards — licensed
 * Adobe Stock shots from the image bank (`docs/IMAGE-BANK.md`). Bold,
 * high-contrast frames chosen to stop the scroll; real photography only, no
 * packshots and no text in the frame. A slug without an entry renders without
 * a photo.
 */
const PROGRAM_IMAGES: Record<string, TopicImage> = {
  "immunity-30": { file: "woman-mask-off-yellow", alt: { uz: "Sariq fonda niqobini yechib kulayotgan ayol", ru: "Женщина снимает маску и смеётся на жёлтом фоне" } },
  "stress-recovery": { file: "calm-woman-yellow", alt: { uz: "Sariq fonda koʻzini yumib xotirjam oʻtirgan ayol", ru: "Спокойная женщина с закрытыми глазами на жёлтом фоне" } },
  "healthy-skin": { file: "serum-woman-yellow", alt: { uz: "Ayol yuziga pipetkadan zardob tomizmoqda", ru: "Женщина наносит сыворотку на лицо из пипетки" } },
  "office-worker": { file: "office-stretch-woman", alt: { uz: "Ofisda noutbuk yonida choʻzilib dam olayotgan ayol", ru: "Женщина потягивается за рабочим столом в офисе" } },
  "womens-health": { file: "woman-heart-yellow", alt: { uz: "Sariq fonda qoʻlini yuragiga qoʻyib kulayotgan ayol", ru: "Смеющаяся женщина держит руки у сердца на жёлтом фоне" } },
  "kids-growth": { file: "child-height-measure", alt: { uz: "Ota-ona bolaning boʻyini devorda oʻlchamoqda", ru: "Родитель измеряет рост ребёнка у стены" }, position: "50% 30%" },
  "senior-health": { file: "elderly-couple-park", alt: { uz: "Keksa juftlik bogʻda sayr qilmoqda", ru: "Пожилая пара гуляет в парке" } },
};

const INGREDIENT_IMAGES: Record<string, TopicImage> = {
  "epa-dha": { file: "omega-spoon-yellow", alt: { uz: "Sariq fonda yogʻoch qoshiqdagi omega-3 kapsulalari", ru: "Капсулы омега-3 в деревянной ложке на жёлтом фоне" } },
  "vitamin-d3": { file: "woman-sunlight-eyes-closed", alt: { uz: "Ayol koʻzini yumib quyosh nurida turibdi", ru: "Женщина с закрытыми глазами на солнце" } },
  "vitamin-k2": { file: "eggs-yolk-blue", alt: { uz: "Koʻk fonda tuxum va tuxum sarigʻi", ru: "Яйца и желток на синем фоне" } },
  magnesium: { file: "food-magnesium-2", alt: { uz: "Kosadagi qovoq urugʻlari", ru: "Тыквенные семечки в миске" } },
  "vitamin-c": { file: "mandarins-turquoise", alt: { uz: "Feruza fonda mandarin boʻlaklari", ru: "Дольки мандаринов на бирюзовом фоне" } },
  zinc: { file: "chickpea-seeds-bowl", alt: { uz: "Noʻxat, urugʻlar va sabzavotli kosa", ru: "Миска с нутом, семенами и овощами" } },
  collagen: { file: "woman-glowing-skin", alt: { uz: "Yuz terisiga qoʻl tekkizib turgan ayol", ru: "Женщина касается кожи лица" } },
  biotin: { file: "hair-shiny", alt: { uz: "Yaltiroq sochli ayol", ru: "Женщина с блестящими волосами" } },
  "vitamin-b12": { file: "b12-animal-foods", alt: { uz: "Baliq, goʻsht, tuxum va pishloq", ru: "Рыба, мясо, яйца и сыр" } },
  iron: { file: "iron-foods-bowls", alt: { uz: "Kosalardagi jigar, dukkaklilar, yongʻoq va koʻkatlar", ru: "Печень, бобовые, орехи и зелень в мисках" } },
  calcium: { file: "milk-splash-color", alt: { uz: "Rangli fonda sut sachrayotgan stakan", ru: "Стакан молока с брызгами на цветном фоне" } },
  probiotics: { file: "buttermilk-glass", alt: { uz: "Stakandagi qatiq ichimligi", ru: "Кисломолочный напиток в стакане" } },
};

export function programImage(slug: string): TopicImage | null {
  return PROGRAM_IMAGES[slug] ?? null;
}

export function ingredientImage(slug: string): TopicImage | null {
  return INGREDIENT_IMAGES[slug] ?? null;
}

export const PAGE_IMAGE_FILES = [...Object.values(PROGRAM_IMAGES), ...Object.values(INGREDIENT_IMAGES)].map((i) => i.file);
