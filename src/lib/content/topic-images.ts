import type { Locale } from "@/lib/i18n/routing";
import type { HealthTopicKind } from "./health-topics";

/**
 * Hero photo for each goal, symptom and vitamin page — licensed Adobe Stock
 * shots from the image bank (`public/images/bank/`, `docs/IMAGE-BANK.md`).
 * Real photography only: no packshots, no text baked into the frame, no
 * other brand. A topic without an entry simply renders without a photo.
 */
export interface TopicImage {
  file: string;
  alt: Record<Locale, string>;
  /** CSS object-position when the subject is off-centre. */
  position?: string;
}

const TOPIC_IMAGES: Record<`${HealthTopicKind}/${string}`, TopicImage> = {
  "goal/kids": { file: "kids-playing", alt: { uz: "Bolalar maysazorda yugurib oʻynamoqda", ru: "Дети бегают и играют на лужайке" } },
  "goal/pregnancy": { file: "pregnant-salad", alt: { uz: "Homilador ayol oshxonada sabzavotli salat tayyorlamoqda", ru: "Беременная женщина готовит овощной салат на кухне" } },
  "goal/men": { file: "man-middle-age", alt: { uz: "Tabassum qilayotgan oʻrta yoshli erkak", ru: "Улыбающийся мужчина средних лет" }, position: "50% 30%" },
  "goal/women": { file: "woman-window-sill", alt: { uz: "Yosh ayol yorugʻ xonada deraza yonida", ru: "Молодая женщина у окна в светлой комнате" } },
  "goal/eyes": { file: "eye-exam", alt: { uz: "Ayol koʻz shifokorida koʻrishni tekshirtirmoqda", ru: "Женщина проверяет зрение у офтальмолога" } },
  "goal/teens": { file: "student-library", alt: { uz: "Oʻsmir kutubxonada dars tayyorlamoqda", ru: "Подросток готовится к занятиям в библиотеке" } },
  "goal/seniors": { file: "seniors-jogging", alt: { uz: "Keksa juftlik bogʻda yugurmoqda", ru: "Пожилая пара на пробежке в парке" } },
  "goal/sport": { file: "woman-running", alt: { uz: "Ayol daryo boʻyida yugurmoqda", ru: "Женщина на пробежке вдоль реки" } },
  "goal/immunity": { file: "season-winter-family", alt: { uz: "Ota oʻgʻli bilan qishda qorli koʻchada oʻynamoqda", ru: "Отец с сыном играют на улице зимой" } },
  "goal/sleep": { file: "morning-wake-up", alt: { uz: "Ayol ertalab yaxshi uxlab turib kerishmoqda", ru: "Женщина выспалась и потягивается утром" } },
  "goal/energy": { file: "energetic-woman-run", alt: { uz: "Ayol quyoshli xiyobonda qoʻllarini yoyib yugurmoqda", ru: "Женщина бежит по солнечной аллее, раскинув руки" } },
  "goal/beauty": { file: "skin-lift-woman", alt: { uz: "Ayol yuz terisiga qoʻlini tekkizib tabassum qilmoqda", ru: "Улыбающаяся женщина касается кожи лица" }, position: "50% 25%" },
  "goal/stress": { file: "meditation-home", alt: { uz: "Ayol uyda divanda meditatsiya qilmoqda", ru: "Женщина медитирует дома на диване" } },
  "goal/digestion": { file: "food-dried-fruits", alt: { uz: "Kosada quruq oʻrik, mayiz va boshqa quruq mevalar", ru: "Курага, изюм и другие сухофрукты в миске" } },
  "goal/heart": { file: "seniors-cooking", alt: { uz: "Keksa juftlik oshxonada sogʻlom tushlik tayyorlamoqda", ru: "Пожилая пара готовит полезный обед на кухне" } },
  "goal/joints": { file: "senior-woman-stretching", alt: { uz: "Keksa ayol uyda gilamchada mashq qilmoqda", ru: "Пожилая женщина делает растяжку на коврике дома" } },
  "goal/brain": { file: "food-walnuts", alt: { uz: "Yogʻoch kosada yongʻoq magʻizlari", ru: "Ядра грецких орехов в деревянной миске" } },
  "goal/weight": { file: "breakfast-power-plate", alt: { uz: "Tovuq, avokado, sabzavot va yormali likopcha", ru: "Тарелка с курицей, авокадо, овощами и крупой" } },
  "symptom/dry-skin": { file: "hand-cream-winter", alt: { uz: "Ayol qishda qoʻliga krem surtmoqda", ru: "Женщина наносит крем на руки зимой" } },
  "symptom/eye-strain": { file: "eye-strain-night", alt: { uz: "Ayol kompyuter oldida charchagan koʻzini ishqalamoqda", ru: "Женщина у компьютера трёт уставшие глаза" } },
  "symptom/fever": { file: "baby-thermometer", alt: { uz: "Ona chaqalogʻining haroratini termometr bilan oʻlchamoqda", ru: "Мама измеряет ребёнку температуру термометром" } },
  "goal/blood-pressure": { file: "blood-pressure-home", alt: { uz: "Uyda qon bosimini tonometr bilan oʻlchash", ru: "Измерение давления тонометром дома" } },
  "goal/menopause": { file: "woman-middle-age", alt: { uz: "Uyda tabassum qilayotgan oʻrta yoshli ayol", ru: "Улыбающаяся женщина средних лет дома" } },
  "symptom/numbness": { file: "hand-tingling", alt: { uz: "Ayol uvishgan qoʻlini ushlab turibdi", ru: "Женщина держит онемевшую руку" } },
  "symptom/bleeding-gums": { file: "gums-brushing", alt: { uz: "Tish yuvganda milkdan qon chiqmoqda", ru: "Кровь из дёсен при чистке зубов" } },
  "symptom/period-pain": { file: "woman-hot-water-bottle", alt: { uz: "Ayol qorniga isitgich qoʻyib divanda yotibdi", ru: "Женщина лежит на диване с грелкой на животе" } },
  "symptom/cracked-lips": { file: "lips-balm", alt: { uz: "Ayol lablariga balzam surtmoqda", ru: "Женщина наносит бальзам на губы" } },
  "goal/vegetarian": { file: "vegetarian-bowl", alt: { uz: "Noʻxat, kinoa va sabzavotli vegetarian kosa", ru: "Вегетарианская миска с нутом, киноа и овощами" } },
  "symptom/brittle-nails": { file: "nails-manicure", alt: { uz: "Ayolning parvarishlangan tirnoqlari", ru: "Ухоженные ногти на женской руке" } },
  "symptom/muscle-cramps": { file: "calf-cramp", alt: { uz: "Ayol boldir mushagini ushlab turibdi", ru: "Женщина держится за икроножную мышцу" } },
  "symptom/fatigue": { file: "fatigue-desk-woman", alt: { uz: "Charchagan ayol ish stolida noutbuk yonida uxlab qolgan", ru: "Уставшая женщина уснула за рабочим столом у ноутбука" } },
  "symptom/hair-loss": { file: "hair-loss-brush", alt: { uz: "Ayol taroqda qolgan sochlarga qaramoqda", ru: "Женщина смотрит на выпавшие волосы на расчёске" } },
  "symptom/insomnia": { file: "insomnia-woman-bed", alt: { uz: "Ayol tunda uxlay olmay toʻshakda yotibdi", ru: "Женщина не может уснуть ночью" } },
  "symptom/frequent-colds": { file: "child-sneezing", alt: { uz: "Qizcha salfetkaga aksirmoqda", ru: "Девочка чихает в салфетку" } },
  "symptom/stress-anxiety": { file: "stress-man-laptop", alt: { uz: "Erkak noutbuk oldida boshini ushlab oʻtiribdi", ru: "Мужчина у ноутбука держится за голову" } },
  "symptom/digestive-bloat": { file: "stomach-ache-sofa", alt: { uz: "Ayol divanda qornini ushlab oʻtiribdi", ru: "Женщина на диване держится за живот" } },
  "symptom/joint-pain": { file: "knee-pain-senior", alt: { uz: "Keksa erkak tizzasini ushlab oʻtiribdi", ru: "Пожилой мужчина держится за колено" } },
  "vitamin/folic-acid": { file: "pregnant-pills-water", alt: { uz: "Homilador ayol qoʻlida kapsula va bir stakan suv", ru: "Беременная женщина с капсулой и стаканом воды" } },
  "vitamin/vitamin-a": { file: "food-carrots", alt: { uz: "Bir bogʻ yangi sabzi", ru: "Пучок свежей моркови" } },
  "vitamin/vitamin-e": { file: "food-avocado", alt: { uz: "Ikki boʻlakka kesilgan avokado", ru: "Авокадо, разрезанное пополам" } },
  "vitamin/vitamin-a-e": { file: "vegetables-assorted", alt: { uz: "Sabzi, qalampir, karam va koʻkatlar", ru: "Морковь, перец, капуста и зелень" } },
  "vitamin/biotin": { file: "food-egg-avocado", alt: { uz: "Tuxum va avokadoli boʻtqa", ru: "Каша с яйцом и авокадо" } },
  "vitamin/selenium": { file: "food-brazil-nuts", alt: { uz: "Yogʻoch kosada braziliya yongʻogʻi", ru: "Бразильские орехи в деревянной миске" } },
  "vitamin/vitamin-k2": { file: "food-egg-yolk", alt: { uz: "Tuxum sarigʻi yaqindan", ru: "Яичные желтки крупным планом" } },
  "vitamin/multivitamins": { file: "supplements-white", alt: { uz: "Oq fonda turli kapsula va tabletkalar", ru: "Разные капсулы и таблетки на белом фоне" } },
  "vitamin/vitamin-b-complex": { file: "food-whole-grains", alt: { uz: "Butun donli non va yormalar", ru: "Цельнозерновой хлеб и крупы" } },
  "vitamin/vitamin-b6": { file: "food-bananas", alt: { uz: "Bir bogʻ banan", ru: "Связка бананов" } },
  "vitamin/vitamin-b1": { file: "oatmeal-berries", alt: { uz: "Rezavor mevali suli boʻtqasi", ru: "Овсяная каша с ягодами" } },
  "vitamin/lutein": { file: "food-spinach", alt: { uz: "Kosada yangi ismaloq barglari", ru: "Свежие листья шпината в миске" } },
  "vitamin/vitamin-d3": { file: "capsules-vitamin-d", alt: { uz: "Quyosh nurida qoʻldagi sariq kapsula", ru: "Жёлтая капсула в руке на солнце" } },
  "vitamin/vitamin-c": { file: "food-citrus", alt: { uz: "Apelsin, limon, greypfrut va laym boʻlaklari", ru: "Дольки апельсина, лимона, грейпфрута и лайма" } },
  "vitamin/magnesium": { file: "food-magnesium", alt: { uz: "Magniyga boy mahsulotlar: yongʻoq, avokado, urugʻlar, ismaloq", ru: "Продукты с магнием: орехи, авокадо, семена, шпинат" } },
  "vitamin/zinc": { file: "food-legumes", alt: { uz: "Noʻxat, yasmiq, mosh va loviya", ru: "Нут, чечевица, маш и фасоль" } },
  "vitamin/omega-3": { file: "food-salmon", alt: { uz: "Rozmarinli qizil baliq boʻlaklari", ru: "Филе лосося с розмарином" } },
  "vitamin/collagen": { file: "collagen-drink", alt: { uz: "Kukunni bir stakan suvga solish", ru: "Порошок насыпают в стакан воды" } },
  "vitamin/vitamin-b12": { file: "food-beef-liver", alt: { uz: "Xom mol jigari", ru: "Сырая говяжья печень" } },
  "vitamin/iron": { file: "food-iron-rich", alt: { uz: "Temirga boy mahsulotlar: baliq, jigar, dukkaklilar, koʻkatlar", ru: "Продукты с железом: рыба, печень, бобовые, зелень" } },
  "vitamin/calcium": { file: "food-dairy-calcium", alt: { uz: "Sut, tvorog, pishloq va boshqa sut mahsulotlari", ru: "Молоко, творог, сыр и другие молочные продукты" } },
  "vitamin/probiotics": { file: "ayran-drink", alt: { uz: "Yalpizli ayron solingan ikki stakan", ru: "Два стакана айрана с мятой" } },
};

export function topicImage(kind: HealthTopicKind, slug: string): TopicImage | null {
  return TOPIC_IMAGES[`${kind}/${slug}`] ?? null;
}

export function topicImageSrc(image: TopicImage): string {
  return `/images/bank/${image.file}.webp`;
}

export const TOPIC_IMAGE_KEYS = Object.keys(TOPIC_IMAGES);
