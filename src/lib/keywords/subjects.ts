/*
  What people in Uzbekistan search for when they look for vitamins and
  supplements — the "subjects" of keyword research. Each subject is one thing
  demand is measured for (Vitamin D, magnesium, vitamins for hair, Solgar…),
  written the way people type it:

  - `ru` — Russian, the larger share of health searches in Uzbekistan;
  - `uz` — Uzbek Latin, typed with a plain apostrophe (o', g') or none, as on a
    phone keyboard. This is search data, not site copy, so the site's ʻ rule
    does not apply here;
  - Uzbek Cyrillic is derived from `uz` (translit.ts); `uzCyr` adds forms the
    transliteration cannot produce.

  The first entry of each list is the primary name and gets the modifiers
  (narxi, купить…); the rest are synonyms searched on their own. Subjects are
  listed whether or not the shop sells them — the point is to see the market.

  `site` ties a subject to the shop: product names/ingredients that count as
  "we have it" (`terms`, lowercase substrings, any language) and the page that
  answers it (`topic` — a health topic slug, or `category`).
*/

export type SubjectKind = "vitamin" | "mineral" | "supplement" | "category" | "goal" | "audience" | "symptom" | "form" | "brand";

export interface KeywordSubject {
  id: string;
  kind: SubjectKind;
  /** Name in the admin (Uzbek). */
  label: string;
  ru: string[];
  uz: string[];
  uzCyr?: string[];
  site?: { terms?: string[]; topic?: string; category?: string; path?: string };
}

export const SUBJECT_KIND_LABEL: Record<SubjectKind, string> = {
  vitamin: "Vitaminlar",
  mineral: "Minerallar",
  supplement: "BAD va boshqa moddalar",
  category: "Umumiy soʻrovlar",
  goal: "Maqsad boʻyicha",
  audience: "Kim uchun",
  symptom: "Belgilar boʻyicha",
  form: "Shakli boʻyicha",
  brand: "Brendlar",
};

export const SUBJECTS: KeywordSubject[] = [
  /* ---------- vitamins ---------- */
  { id: "vitamin-d", kind: "vitamin", label: "Vitamin D / D3", ru: ["витамин д3", "витамин д", "витамин d3", "витамин d", "холекальциферол", "д3 капли", "витамин д3 капли"], uz: ["vitamin d3", "vitamin d", "d3 vitamini", "d vitamini", "vitamin d tomchi"], uzCyr: ["д витамини"], site: { terms: ["d3", "д3", "xolekalsiferol", "холекальциферол"], topic: "vitamin-d3" } },
  { id: "vitamin-c", kind: "vitamin", label: "Vitamin C", ru: ["витамин с", "витамин c", "аскорбиновая кислота", "аскорбинка"], uz: ["vitamin c", "c vitamini", "askorbin kislotasi"], uzCyr: ["вит с"], site: { terms: ["vitamin c", "витамин c", "витамин с", "askorbin", "аскорбин"], topic: "vitamin-c" } },
  { id: "vitamin-b12", kind: "vitamin", label: "Vitamin B12", ru: ["витамин б12", "витамин b12", "цианокобаламин", "метилкобаламин"], uz: ["vitamin b12", "b12 vitamini"], site: { terms: ["b12", "б12", "kobalamin", "кобаламин"], topic: "vitamin-b12" } },
  { id: "vitamin-b-complex", kind: "vitamin", label: "B guruhi vitaminlari", ru: ["витамины группы б", "витамин б комплекс", "витамины группы b", "б комплекс"], uz: ["b guruhi vitaminlari", "vitamin b kompleks", "b vitaminlari"], site: { terms: ["b-kompleks", "b kompleks", "группы b", "b1", "b6"] } },
  { id: "vitamin-b6", kind: "vitamin", label: "Vitamin B6", ru: ["витамин б6", "витамин b6", "пиридоксин"], uz: ["vitamin b6", "b6 vitamini"], site: { terms: ["b6", "б6", "piridoksin", "пиридоксин"] } },
  { id: "vitamin-b1", kind: "vitamin", label: "Vitamin B1", ru: ["витамин б1", "тиамин"], uz: ["vitamin b1"], site: { terms: ["b1 ", "тиамин", "tiamin"] } },
  { id: "folic-acid", kind: "vitamin", label: "Foliy kislotasi (B9)", ru: ["фолиевая кислота", "витамин б9", "фолат", "метилфолат"], uz: ["foliy kislotasi", "folat kislota", "vitamin b9"], uzCyr: ["фолий кислотаси"], site: { terms: ["foli", "фоли", "folat", "фолат", "b9"] } },
  { id: "biotin", kind: "vitamin", label: "Biotin (B7)", ru: ["биотин", "витамин б7", "витамин h"], uz: ["biotin", "vitamin b7"], site: { terms: ["biotin", "биотин"] } },
  { id: "vitamin-a", kind: "vitamin", label: "Vitamin A", ru: ["витамин а", "ретинол"], uz: ["vitamin a", "a vitamini"], site: { terms: ["vitamin a", "витамин a", "retinol", "ретинол"] } },
  { id: "vitamin-e", kind: "vitamin", label: "Vitamin E", ru: ["витамин е", "витамин e", "токоферол"], uz: ["vitamin e", "e vitamini"], site: { terms: ["vitamin e", "витамин e", "tokoferol", "токоферол"] } },
  { id: "aevit", kind: "vitamin", label: "Aevit (A + E)", ru: ["аевит"], uz: ["aevit"], uzCyr: ["аевит"] },
  { id: "vitamin-k2", kind: "vitamin", label: "Vitamin K2", ru: ["витамин к2", "витамин k2", "д3 к2", "витамин д3 к2"], uz: ["vitamin k2", "d3 k2"], site: { terms: ["k2", "к2", "menaxinon", "менахинон"] } },

  /* ---------- minerals ---------- */
  { id: "magnesium", kind: "mineral", label: "Magniy", ru: ["магний", "магний б6", "магний в6", "магний цитрат", "магний хелат", "магне б6"], uz: ["magniy", "magniy b6", "magniy sitrat"], site: { terms: ["magniy", "магний", "magnesium"], topic: "magnesium" } },
  { id: "calcium", kind: "mineral", label: "Kalsiy", ru: ["кальций", "кальций д3", "кальций с витамином д3", "кальций цитрат"], uz: ["kalsiy", "kalsiy d3", "kaltsiy"], site: { terms: ["kalsiy", "кальций", "calci"], topic: "calcium" } },
  { id: "iron", kind: "mineral", label: "Temir", ru: ["железо", "железо в таблетках", "препараты железа", "железо хелат"], uz: ["temir", "temir preparati", "temir tabletka"], site: { terms: ["temir", "железо", "ferrum", "iron"], topic: "iron" } },
  { id: "zinc", kind: "mineral", label: "Rux (sink)", ru: ["цинк", "цинк пиколинат", "цинк хелат", "zinc"], uz: ["rux", "sink"], uzCyr: ["рух"], site: { terms: ["rux", "цинк", "zinc", "sink"], topic: "zinc" } },
  { id: "selenium", kind: "mineral", label: "Selen", ru: ["селен"], uz: ["selen"], site: { terms: ["selen", "селен"] } },
  { id: "iodine", kind: "mineral", label: "Yod", ru: ["йод", "йодомарин", "йод актив"], uz: ["yod", "yod tabletka"], site: { terms: ["yod", "йод", "iod"] } },
  { id: "potassium", kind: "mineral", label: "Kaliy", ru: ["калий магний", "калий"], uz: ["kaliy", "kaliy magniy"], site: { terms: ["kaliy", "калий"] } },

  /* ---------- supplements ---------- */
  { id: "omega-3", kind: "supplement", label: "Omega-3", ru: ["омега 3", "омега-3", "омега 3 капсулы", "рыбий жир", "рыбий жир в капсулах"], uz: ["omega 3", "omega-3", "baliq yog'i", "baliq yogi"], site: { terms: ["omega", "омега", "baliq yog", "рыбий жир", "epa", "dha"], topic: "omega-3" } },
  { id: "collagen", kind: "supplement", label: "Kollagen", ru: ["коллаген", "коллаген порошок", "коллаген для суставов", "морской коллаген"], uz: ["kollagen", "kollagen kukun"], site: { terms: ["kollagen", "коллаген", "collagen"], topic: "collagen" } },
  { id: "probiotics", kind: "supplement", label: "Probiotiklar", ru: ["пробиотики", "пробиотик", "пребиотики", "лактобактерии", "бифидобактерии"], uz: ["probiotik", "probiotiklar", "laktobakteriya"], site: { terms: ["probiotik", "пробиотик", "lakto", "лакто", "bifido", "бифидо"], topic: "probiotics" } },
  { id: "hyaluronic", kind: "supplement", label: "Gialuron kislotasi", ru: ["гиалуроновая кислота в капсулах", "гиалуроновая кислота"], uz: ["gialuron kislotasi"], site: { terms: ["gialuron", "гиалурон", "hyaluron"] } },
  { id: "coq10", kind: "supplement", label: "Koenzim Q10", ru: ["коэнзим q10", "коэнзим ку10", "q10"], uz: ["koenzim q10", "q10"], site: { terms: ["q10", "koenzim", "коэнзим"] } },
  { id: "glucosamine", kind: "supplement", label: "Glyukozamin va xondroitin", ru: ["глюкозамин хондроитин", "хондроитин", "глюкозамин"], uz: ["glyukozamin xondroitin", "xondroitin"], site: { terms: ["glyukozamin", "глюкозамин", "xondroitin", "хондроитин"] } },
  { id: "melatonin", kind: "supplement", label: "Melatonin", ru: ["мелатонин", "мелатонин таблетки"], uz: ["melatonin"], site: { terms: ["melatonin", "мелатонин"] } },
  { id: "lutein", kind: "supplement", label: "Lutein (koʻz uchun)", ru: ["лютеин", "лютеин для глаз"], uz: ["lutein"], site: { terms: ["lutein", "лютеин"] } },
  { id: "l-carnitine", kind: "supplement", label: "L-karnitin", ru: ["л карнитин", "l карнитин"], uz: ["l karnitin"], site: { terms: ["karnitin", "карнитин"] } },
  { id: "spirulina", kind: "supplement", label: "Spirulina", ru: ["спирулина"], uz: ["spirulina"], site: { terms: ["spirulina", "спирулина"] } },
  { id: "ginkgo", kind: "supplement", label: "Ginkgo biloba", ru: ["гинкго билоба"], uz: ["ginkgo biloba"], site: { terms: ["ginkgo", "гинкго"] } },
  { id: "ashwagandha", kind: "supplement", label: "Ashvaganda", ru: ["ашваганда"], uz: ["ashvaganda", "ashwagandha"], site: { terms: ["ashva", "ashwa", "ашваган"] } },
  { id: "inulin", kind: "supplement", label: "Inulin / kletchatka", ru: ["клетчатка", "инулин", "псиллиум"], uz: ["kletchatka", "inulin"], site: { terms: ["inulin", "инулин", "kletchatka", "клетчатка"] } },

  /* ---------- general ---------- */
  { id: "vitamins", kind: "category", label: "Vitaminlar (umumiy)", ru: ["витамины", "витамины купить", "хорошие витамины", "какие витамины пить", "лучшие витамины"], uz: ["vitaminlar", "vitamin", "yaxshi vitaminlar", "qanday vitamin ichish kerak"], site: { category: "vitamins" } },
  { id: "multivitamins", kind: "category", label: "Multivitaminlar", ru: ["мультивитамины", "витаминный комплекс", "витаминно минеральный комплекс"], uz: ["multivitamin", "multivitaminlar", "vitamin kompleks"], site: { terms: ["multivitamin", "мультивитамин", "multi-vitamin"] } },
  { id: "bad", kind: "category", label: "BAD (biologik faol qoʻshimchalar)", ru: ["бад", "бады", "биологически активные добавки", "пищевые добавки"], uz: ["bad", "biologik faol qo'shimcha", "biologik faol qo'shimchalar"], site: { path: "/products" } },
  { id: "pharmacy-online", kind: "category", label: "Onlayn dorixona", ru: ["аптека онлайн ташкент", "интернет аптека", "аптека с доставкой ташкент", "заказать витамины с доставкой"], uz: ["onlayn dorixona", "internet dorixona", "dorixona yetkazib berish", "vitamin yetkazib berish"], site: { path: "/" } },

  /* ---------- goals ---------- */
  { id: "goal-immunity", kind: "goal", label: "Immunitet uchun", ru: ["витамины для иммунитета", "для иммунитета", "укрепить иммунитет"], uz: ["immunitet uchun vitaminlar", "immunitetni oshirish", "immunitet uchun"], site: { topic: "immunity" } },
  { id: "goal-hair", kind: "goal", label: "Soch uchun", ru: ["витамины для волос", "витамины для роста волос", "витамины для волос кожи и ногтей"], uz: ["soch uchun vitamin", "soch uchun vitaminlar", "soch o'sishi uchun vitamin"], site: { topic: "beauty" } },
  { id: "goal-skin-nails", kind: "goal", label: "Teri va tirnoq uchun", ru: ["витамины для кожи", "витамины для ногтей"], uz: ["teri uchun vitamin", "tirnoq uchun vitamin"], site: { topic: "beauty" } },
  { id: "goal-energy", kind: "goal", label: "Energiya / charchoq", ru: ["витамины от усталости", "витамины для энергии", "витамины для бодрости"], uz: ["charchoq uchun vitamin", "energiya uchun vitamin", "holsizlik uchun vitamin"], site: { topic: "energy" } },
  { id: "goal-brain", kind: "goal", label: "Xotira va miya uchun", ru: ["витамины для памяти", "витамины для мозга", "витамины для памяти и концентрации"], uz: ["xotira uchun vitamin", "miya uchun vitamin"], site: { topic: "brain" } },
  { id: "goal-nerves", kind: "goal", label: "Asab va stress", ru: ["витамины для нервной системы", "витамины от стресса", "витамины от нервов"], uz: ["asab uchun vitamin", "stress uchun vitamin", "asab tizimi uchun vitaminlar"], site: { topic: "stress" } },
  { id: "goal-sleep", kind: "goal", label: "Uyqu uchun", ru: ["витамины для сна", "для хорошего сна"], uz: ["uyqu uchun vitamin", "uyqusizlik uchun"], site: { topic: "sleep" } },
  { id: "goal-heart", kind: "goal", label: "Yurak uchun", ru: ["витамины для сердца", "витамины для сердца и сосудов"], uz: ["yurak uchun vitamin", "yurak uchun vitaminlar"], site: { topic: "heart" } },
  { id: "goal-joints", kind: "goal", label: "Boʻgʻim va suyak uchun", ru: ["витамины для суставов", "витамины для костей", "для суставов и связок"], uz: ["bo'g'imlar uchun vitamin", "suyak uchun vitamin", "bo'g'im uchun"], site: { topic: "joints" } },
  { id: "goal-eyes", kind: "goal", label: "Koʻz uchun", ru: ["витамины для глаз", "витамины для зрения"], uz: ["ko'z uchun vitamin", "ko'rish uchun vitamin"] },
  { id: "goal-digestion", kind: "goal", label: "Hazm qilish uchun", ru: ["для кишечника", "для пищеварения", "для микрофлоры кишечника"], uz: ["ichak uchun", "hazm qilish uchun", "oshqozon uchun vitamin"], site: { topic: "digestion" } },
  { id: "goal-weight", kind: "goal", label: "Vazn nazorati", ru: ["для похудения бад", "витамины при похудении"], uz: ["ozish uchun", "vazn tashlash uchun vitamin"], site: { topic: "weight" } },
  { id: "goal-liver", kind: "goal", label: "Jigar uchun", ru: ["для печени бад", "витамины для печени"], uz: ["jigar uchun vitamin"] },

  /* ---------- audiences ---------- */
  { id: "aud-kids", kind: "audience", label: "Bolalar uchun", ru: ["витамины для детей", "детские витамины", "витамины для детей от 3 лет", "витамины для детей сироп", "жевательные витамины для детей"], uz: ["bolalar uchun vitamin", "bolalar uchun vitaminlar", "bolalar vitamini"], site: { terms: ["kids", "bolalar", "детск", "kinder"] } },
  { id: "aud-teens", kind: "audience", label: "Oʻsmirlar va maktab oʻquvchilari", ru: ["витамины для подростков", "витамины для школьников"], uz: ["o'smirlar uchun vitamin", "maktab o'quvchilari uchun vitamin"] },
  { id: "aud-pregnant", kind: "audience", label: "Homiladorlar uchun", ru: ["витамины для беременных", "витамины при беременности", "витамины для планирования беременности", "витамины для кормящих"], uz: ["homiladorlar uchun vitamin", "homiladorlik vitaminlari", "homiladorlikda vitamin"], site: { terms: ["prenatal", "homilador", "беремен"] } },
  { id: "aud-women", kind: "audience", label: "Ayollar uchun", ru: ["витамины для женщин", "витамины для женщин после 40", "витамины для женщин после 50"], uz: ["ayollar uchun vitamin", "ayollar uchun vitaminlar"], site: { terms: ["women", "ayollar", "женщин", "woman"] } },
  { id: "aud-men", kind: "audience", label: "Erkaklar uchun", ru: ["витамины для мужчин", "витамины для мужчин после 40"], uz: ["erkaklar uchun vitamin", "erkaklar uchun vitaminlar"], site: { terms: ["erkaklar", "мужчин", "for men", "men's"] } },
  { id: "aud-elderly", kind: "audience", label: "Keksalar uchun", ru: ["витамины для пожилых", "витамины после 60"], uz: ["keksalar uchun vitamin"] },
  { id: "aud-sport", kind: "audience", label: "Sportchilar uchun", ru: ["витамины для спортсменов"], uz: ["sportchilar uchun vitamin"] },

  /* ---------- symptoms ---------- */
  { id: "sym-hair-loss", kind: "symptom", label: "Soch toʻkilishi", ru: ["выпадение волос витамины", "от выпадения волос", "витамины от выпадения волос"], uz: ["soch to'kilishi", "soch to'kilishiga qarshi vitamin", "soch to'kilsa nima ichish kerak"], site: { topic: "hair-loss" } },
  { id: "sym-fatigue", kind: "symptom", label: "Charchoq, holsizlik", ru: ["усталость и слабость", "постоянная усталость", "слабость что пить"], uz: ["doimiy charchoq", "holsizlik", "charchoq nima ichish kerak"], site: { topic: "fatigue" } },
  { id: "sym-insomnia", kind: "symptom", label: "Uyqusizlik", ru: ["бессонница что пить", "бессонница"], uz: ["uyqusizlik", "uyqusizlikka qarshi"], site: { topic: "insomnia" } },
  { id: "sym-colds", kind: "symptom", label: "Tez-tez shamollash", ru: ["часто болею простудой", "ребенок часто болеет"], uz: ["tez-tez shamollash", "bola tez-tez kasal bo'ladi"], site: { topic: "frequent-colds" } },
  { id: "sym-stress", kind: "symptom", label: "Stress va xavotir", ru: ["стресс и тревога", "успокоительное без рецепта"], uz: ["stress", "asabiylashish"], site: { topic: "stress-anxiety" } },
  { id: "sym-bloat", kind: "symptom", label: "Qorin dam boʻlishi", ru: ["вздутие живота", "вздутие что делать"], uz: ["qorin dam bo'lishi", "meteorizm"], site: { topic: "digestive-bloat" } },
  { id: "sym-joint-pain", kind: "symptom", label: "Boʻgʻim ogʻrigʻi", ru: ["болят суставы", "хруст в суставах"], uz: ["bo'g'im og'rig'i", "tizza og'rig'i"], site: { topic: "joint-pain" } },
  { id: "sym-anemia", kind: "symptom", label: "Kamqonlik", ru: ["низкий гемоглобин", "анемия", "как поднять гемоглобин"], uz: ["kamqonlik", "gemoglobin past", "gemoglobinni oshirish"], site: { topic: "iron" } },
  { id: "sym-cramps", kind: "symptom", label: "Mushak tortishishi", ru: ["судороги в ногах", "сводит ноги"], uz: ["oyoq tortishishi", "mushak tortishishi"], site: { topic: "magnesium" } },
  { id: "sym-nails", kind: "symptom", label: "Moʻrt tirnoqlar", ru: ["ломкие ногти", "слоятся ногти"], uz: ["tirnoq sinishi", "mo'rt tirnoq"] },

  /* ---------- forms ---------- */
  { id: "form-effervescent", kind: "form", label: "Shipuchi tabletkalar", ru: ["шипучие витамины", "шипучие таблетки витамины"], uz: ["shipuchi vitamin", "eruvchan vitamin"], site: { terms: ["shipuchi", "шипуч", "effervescent", "eruvchan"], category: "shipuchi-tabletkalar" } },
  { id: "form-gummies", kind: "form", label: "Chaynaladigan / marmelad", ru: ["жевательные витамины", "мармеладные витамины", "витамины мишки"], uz: ["chaynaladigan vitamin", "marmelad vitamin"], site: { terms: ["chaynala", "жеват", "мармелад", "gummi"] } },
  { id: "form-drops", kind: "form", label: "Tomchi va sirop", ru: ["витамины в каплях", "витамины сироп"], uz: ["tomchi vitamin", "sirop vitamin"], site: { terms: ["tomchi", "капл", "sirop", "сироп"] } },

  /* ---------- market brands (shop brands are added from the catalogue) ---------- */
  { id: "brand-solgar", kind: "brand", label: "Solgar", ru: ["солгар", "solgar"], uz: ["solgar"] },
  { id: "brand-now", kind: "brand", label: "NOW Foods", ru: ["now foods", "нау фудс"], uz: ["now foods"] },
  { id: "brand-evalar", kind: "brand", label: "Evalar", ru: ["эвалар"], uz: ["evalar"] },
  { id: "brand-doppelherz", kind: "brand", label: "Doppelherz", ru: ["доппельгерц", "доппельгерц актив"], uz: ["doppelherz"] },
  { id: "brand-supradyn", kind: "brand", label: "Supradyn", ru: ["супрадин"], uz: ["supradin", "supradyn"] },
  { id: "brand-vitrum", kind: "brand", label: "Vitrum", ru: ["витрум"], uz: ["vitrum"] },
  { id: "brand-complivit", kind: "brand", label: "Complivit", ru: ["компливит"], uz: ["komplivit"] },
  { id: "brand-alphabet", kind: "brand", label: "Alfavit", ru: ["алфавит витамины"], uz: ["alfavit vitamin"] },
  { id: "brand-centrum", kind: "brand", label: "Centrum", ru: ["центрум"], uz: ["centrum"] },
  { id: "brand-pikovit", kind: "brand", label: "Pikovit", ru: ["пиковит"], uz: ["pikovit"] },
  { id: "brand-multitabs", kind: "brand", label: "Multi-tabs", ru: ["мульти табс"], uz: ["multi tabs"] },
  { id: "brand-elevit", kind: "brand", label: "Elevit", ru: ["элевит"], uz: ["elevit"] },
  { id: "brand-femibion", kind: "brand", label: "Femibion", ru: ["фемибион"], uz: ["femibion"] },
  { id: "brand-magneb6", kind: "brand", label: "Magne B6", ru: ["магне б6"], uz: ["magne b6"] },
  { id: "brand-aquadetrim", kind: "brand", label: "Akvadetrim", ru: ["аквадетрим"], uz: ["akvadetrim"] },
  { id: "brand-vigantol", kind: "brand", label: "Vigantol", ru: ["вигантол"], uz: ["vigantol"] },
  { id: "brand-calcemin", kind: "brand", label: "Kalsemin", ru: ["кальцемин"], uz: ["kalsemin"] },
  { id: "brand-nycomed", kind: "brand", label: "Kalsiy-D3 Nikomed", ru: ["кальций д3 никомед"], uz: ["kalsiy d3 nikomed"] },
  { id: "brand-cgn", kind: "brand", label: "California Gold Nutrition", ru: ["california gold nutrition"], uz: ["california gold nutrition"] },
  { id: "brand-natures-bounty", kind: "brand", label: "Nature's Bounty", ru: ["nature's bounty", "нейчерс баунти"], uz: ["natures bounty"] },
  { id: "brand-orthomol", kind: "brand", label: "Orthomol", ru: ["ортомол"], uz: ["orthomol"] },
  { id: "brand-kinder-biovital", kind: "brand", label: "Kinder Biovital", ru: ["киндер биовиталь"], uz: ["kinder biovital"] },
];
