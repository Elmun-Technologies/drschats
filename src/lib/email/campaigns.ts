import type { Locale } from "@/lib/i18n/routing";
import type { EmailBlocks, EmailProduct } from "./render";

/*
  Every message the shop is allowed to send, and the words it sends.

  Copy lives here rather than in src/messages because these are not interface
  strings: they are longer, they have a different voice, and they must render
  from a cron job that has no request and therefore no next-intl context. One
  file also makes the whole marketing programme readable in a single sitting —
  which is the only way to notice that it has started saying too much.

  What is *not* here: a claim that a supplement treats anything. Uzbek
  advertising law puts specific limits on marketing dietary supplements, and an
  email is advertising. The messages below talk about courses, deliveries and
  dates, never about outcomes.
*/

export type Campaign =
  /** Double opt-in. The only message that may go to an unconfirmed address. */
  | { type: "opt-in"; confirmUrl: string; name?: string }
  | { type: "welcome"; name?: string; quizUrl: string }
  /** Transactional: sent on the strength of the order, not of a consent. */
  | {
      type: "order";
      orderId: string;
      customerName: string;
      items: EmailProduct[];
      total: string;
      orderUrl: string;
    }
  | { type: "abandoned-cart"; name?: string; items: EmailProduct[]; cartUrl: string }
  | { type: "birthday"; name?: string; memberName?: string; shopUrl: string; promoCode?: string }
  | { type: "child-season"; childName?: string; shopUrl: string }
  | { type: "reorder"; productName?: string; productUrl: string; daysLeft: number }
  | {
      type: "subscription-upcoming";
      items: EmailProduct[];
      deliveryDate: string;
      daysUntil: number;
      manageUrl: string;
    }
  | { type: "account-verify"; verifyUrl: string; name?: string };

export type CampaignType = Campaign["type"];

/** Campaigns that may be sent without marketing consent. */
const TRANSACTIONAL: CampaignType[] = ["opt-in", "order", "account-verify"];

export function isTransactional(type: CampaignType): boolean {
  return TRANSACTIONAL.includes(type);
}

export interface BuiltCampaign {
  subject: string;
  blocks: EmailBlocks;
}

const greeting = (locale: Locale, name?: string) =>
  name ? (locale === "uz" ? `Assalomu alaykum, ${name}!` : `Здравствуйте, ${name}!`) : locale === "uz" ? "Assalomu alaykum!" : "Здравствуйте!";

export function buildCampaign(campaign: Campaign, locale: Locale): BuiltCampaign {
  const uz = locale === "uz";

  switch (campaign.type) {
    case "opt-in":
      return {
        subject: uz ? "Manzilingizni tasdiqlang" : "Подтвердите ваш адрес",
        blocks: {
          preheader: uz
            ? "Bitta bosish — va obuna faollashadi."
            : "Один клик — и подписка активна.",
          heading: uz ? "Obunani tasdiqlang" : "Подтвердите подписку",
          paragraphs: [
            greeting(locale, campaign.name),
            uz
              ? "Go Vita yangiliklariga obuna bo'lish uchun quyidagi tugmani bosing. Tasdiqlamaguningizcha biz sizga hech narsa yubormaymiz."
              : "Нажмите кнопку ниже, чтобы подписаться на рассылку Go Vita. Пока вы не подтвердите, мы вам ничего не отправим.",
          ],
          cta: { label: uz ? "Obunani tasdiqlash" : "Подтвердить подписку", url: campaign.confirmUrl },
          note: uz
            ? "Agar bu siz bo'lmasangiz, shunchaki e'tiborsiz qoldiring — havola 7 kundan keyin ishlamay qoladi."
            : "Если это были не вы, просто проигнорируйте письмо — ссылка перестанет работать через 7 дней.",
        },
      };

    case "welcome":
      return {
        subject: uz ? "Xush kelibsiz — nimadan boshlaymiz?" : "Добро пожаловать — с чего начнём?",
        blocks: {
          preheader: uz
            ? "5 daqiqalik test — sizga mos vitaminlar ro'yxati."
            : "Тест на 5 минут — список витаминов под вас.",
          heading: uz ? "Xush kelibsiz!" : "Добро пожаловать!",
          paragraphs: [
            greeting(locale, campaign.name),
            uz
              ? "Obunangiz faollashdi. Biz oyiga 2–3 marta yozamiz: yangi mahsulotlar, aksiyalar va farmatsevtlarimiz tayyorlagan qisqa maslahatlar."
              : "Подписка активна. Мы пишем 2–3 раза в месяц: новинки, акции и короткие материалы от наших фармацевтов.",
            uz
              ? "Boshlash uchun eng qulay yo'l — sog'liq testi. U turmush tarzingiz haqida bir necha savol beradi va shu asosda ro'yxat tuzadi."
              : "Самый простой старт — тест здоровья. Несколько вопросов об образе жизни, и вы получите подобранный список.",
          ],
          cta: { label: uz ? "Testni boshlash" : "Пройти тест", url: campaign.quizUrl },
        },
      };

    case "order":
      return {
        subject: uz
          ? `Buyurtmangiz qabul qilindi — №${campaign.orderId}`
          : `Заказ принят — №${campaign.orderId}`,
        blocks: {
          preheader: uz
            ? "Operatorimiz tez orada bog'lanadi."
            : "Наш оператор скоро свяжется с вами.",
          heading: uz ? `Buyurtma №${campaign.orderId} qabul qilindi` : `Заказ №${campaign.orderId} принят`,
          paragraphs: [
            greeting(locale, campaign.customerName),
            uz
              ? "Rahmat! Buyurtmangiz qabul qilindi. Operatorimiz manzilni va yetkazib berish vaqtini tasdiqlash uchun tez orada qo'ng'iroq qiladi."
              : "Спасибо! Заказ принят. Оператор позвонит вам, чтобы подтвердить адрес и время доставки.",
          ],
          products: campaign.items,
          bullets: [uz ? `Jami: ${campaign.total}` : `Итого: ${campaign.total}`],
          cta: { label: uz ? "Buyurtmani ko'rish" : "Посмотреть заказ", url: campaign.orderUrl },
        },
      };

    case "abandoned-cart":
      return {
        subject: uz ? "Savatchangiz saqlanib turibdi" : "Ваша корзина сохранена",
        blocks: {
          preheader: uz
            ? "Tanlaganlaringiz joyida — davom etamizmi?"
            : "Выбранное на месте — продолжим?",
          heading: uz ? "Savatchangiz sizni kutmoqda" : "Корзина ждёт вас",
          paragraphs: [
            greeting(locale, campaign.name),
            uz
              ? "Siz tanlagan mahsulotlar savatchada turibdi. Agar biror savol qolgan bo'lsa — shu xatga javob yozing, farmatsevtimiz javob beradi."
              : "Выбранные товары остались в корзине. Если остался вопрос — ответьте на это письмо, наш фармацевт ответит.",
          ],
          products: campaign.items,
          cta: { label: uz ? "Savatchaga qaytish" : "Вернуться в корзину", url: campaign.cartUrl },
        },
      };

    case "birthday": {
      const who = campaign.memberName;
      return {
        subject: who
          ? uz
            ? `${who}ning tug'ilgan kuni yaqinlashmoqda`
            : `Скоро день рождения — ${who}`
          : uz
            ? "Tug'ilgan kuningiz bilan!"
            : "С днём рождения!",
        blocks: {
          preheader: uz ? "Kichik sovg'amiz bor." : "У нас есть небольшой подарок.",
          heading: who
            ? uz
              ? `${who}ning tug'ilgan kuni yaqin`
              : `Скоро день рождения — ${who}`
            : uz
              ? "Tug'ilgan kuningiz bilan!"
              : "С днём рождения!",
          paragraphs: [
            greeting(locale, campaign.name),
            who
              ? uz
                ? `Siz profilingizda ${who}ning tug'ilgan kunini belgilagansiz — u yaqinlashib qoldi. Eslatib qo'yamiz, shoshilmasdan tayyorlanishingiz uchun.`
                : `Вы отметили в профиле день рождения — ${who}. Он уже близко, напоминаем заранее, чтобы вы успели спокойно подготовиться.`
              : uz
                ? "Sizni tug'ilgan kuningiz bilan tabriklaymiz. Yil davomida bizni tanlaganingiz uchun rahmat."
                : "Поздравляем вас с днём рождения и благодарим за то, что выбираете нас.",
          ],
          bullets: campaign.promoCode
            ? [
                uz
                  ? `Promokod: ${campaign.promoCode} — keyingi buyurtmangizda amal qiladi`
                  : `Промокод: ${campaign.promoCode} — действует на следующий заказ`,
              ]
            : undefined,
          cta: { label: uz ? "Katalogga o'tish" : "Перейти в каталог", url: campaign.shopUrl },
        },
      };
    }

    case "child-season":
      return {
        subject: uz ? "O'quv yili oldidan" : "Перед началом учебного года",
        blocks: {
          preheader: uz
            ? "Bolalar uchun mavsumiy tanlov."
            : "Сезонная подборка для детей.",
          heading: campaign.childName
            ? uz
              ? `${campaign.childName} uchun o'quv yiliga tayyorgarlik`
              : `Готовимся к учебному году — ${campaign.childName}`
            : uz
              ? "O'quv yiliga tayyorgarlik"
              : "Готовимся к учебному году",
          paragraphs: [
            uz
              ? "Sentyabr yaqinlashmoqda: bolalar yana bir jamoaga qaytadi, kun tartibi o'zgaradi."
              : "Сентябрь близко: дети возвращаются в коллектив, режим дня меняется.",
            uz
              ? "Bolalar uchun mo'ljallangan mahsulotlarni alohida bo'limga yig'dik. Dozani yoshga qarab tanlash kerak — farmatsevtimiz bilan maslahatlashishingiz mumkin."
              : "Мы собрали товары для детей в отдельный раздел. Дозировка подбирается по возрасту — вы можете посоветоваться с нашим фармацевтом.",
          ],
          cta: { label: uz ? "Bolalar bo'limi" : "Раздел для детей", url: campaign.shopUrl },
          note: uz
            ? "Bolaga har qanday qo'shimcha berishdan oldin shifokor bilan maslahatlashing."
            : "Перед приёмом любых добавок ребёнком проконсультируйтесь с врачом.",
        },
      };

    case "reorder":
      return {
        subject: uz ? "Kursingiz tugayapti" : "Ваш курс заканчивается",
        blocks: {
          preheader: uz
            ? "Uzilish bo'lmasligi uchun oldindan eslatamiz."
            : "Напоминаем заранее, чтобы не было перерыва.",
          heading: uz ? "Kurs tugashiga oz qoldi" : "Курс скоро закончится",
          paragraphs: [
            campaign.productName
              ? uz
                ? `Taxminan ${campaign.daysLeft} kundan keyin "${campaign.productName}" tugaydi.`
                : `Примерно через ${campaign.daysLeft} дн. закончится «${campaign.productName}».`
              : uz
                ? `Oxirgi buyurtmangizdagi kurs taxminan ${campaign.daysLeft} kundan keyin tugaydi.`
                : `Курс из вашего последнего заказа закончится примерно через ${campaign.daysLeft} дн.`,
            uz
              ? "Ko'p mahsulotlarda samara muntazamlikka bog'liq, shuning uchun oldindan eslatamiz."
              : "Для многих продуктов важна регулярность приёма, поэтому напоминаем заранее.",
          ],
          cta: { label: uz ? "Takroriy buyurtma" : "Повторить заказ", url: campaign.productUrl },
        },
      };

    case "subscription-upcoming":
      return {
        subject: uz
          ? `Keyingi yetkazib berish — ${campaign.deliveryDate}`
          : `Следующая доставка — ${campaign.deliveryDate}`,
        blocks: {
          preheader: uz
            ? "O'zgartirish, o'tkazib yuborish yoki bekor qilish — bir bosishda."
            : "Изменить, пропустить или отменить — в один клик.",
          heading: uz ? "Obuna bo'yicha keyingi yetkazib berish" : "Ближайшая доставка по подписке",
          paragraphs: [
            uz
              ? `${campaign.daysUntil} kundan keyin (${campaign.deliveryDate}) obunangiz bo'yicha navbatdagi buyurtma tayyorlanadi.`
              : `Через ${campaign.daysUntil} дн. (${campaign.deliveryDate}) мы соберём очередной заказ по вашей подписке.`,
            uz
              ? "Agar hozircha kerak bo'lmasa — bu yetkazib berishni o'tkazib yuborishingiz yoki oraliqni o'zgartirishingiz mumkin."
              : "Если сейчас не нужно — пропустите доставку или измените интервал.",
          ],
          products: campaign.items,
          cta: { label: uz ? "Obunani boshqarish" : "Управлять подпиской", url: campaign.manageUrl },
        },
      };

    case "account-verify":
      return {
        subject: uz ? "Hisobingizni tasdiqlang" : "Подтвердите ваш аккаунт",
        blocks: {
          preheader: uz
            ? "Bu manzil sizniki ekanini tasdiqlang."
            : "Подтвердите, что этот адрес принадлежит вам.",
          heading: uz ? "Ro'yxatdan o'tganingiz bilan" : "Регистрация почти завершена",
          paragraphs: [
            greeting(locale, campaign.name),
            uz
              ? "Go Vita'da hisob yaratildi. Elektron pochtangizni tasdiqlasangiz, buyurtma holati va eslatmalar shu manzilga keladi."
              : "Аккаунт в Go Vita создан. Подтвердите почту, и статусы заказов и напоминания будут приходить на этот адрес.",
          ],
          cta: { label: uz ? "Pochtani tasdiqlash" : "Подтвердить почту", url: campaign.verifyUrl },
          note: uz
            ? "Havola 7 kun davomida amal qiladi."
            : "Ссылка действительна 7 дней.",
        },
      };
  }
}
