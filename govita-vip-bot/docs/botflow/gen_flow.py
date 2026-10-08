"""Generate GoVita VIP club BotFlow definitions.

govita-botflow.json      — target flow using the new action types proposed in SPEC (my_orders, subscriptions,
                           reminders, club, share_contact, referral, profile).
govita-botflow-now.json  — same flow restricted to action types that exist in ShopFlow today, so it can be
                           loaded into the Bot konstruktor immediately.
"""
import json, copy, sys

SITE = "https://govita.uz"
L = lambda uz, ru: {"uz": uz, "ru": ru}
def btn(id, uz, ru, action, full=True):
    return {"id": id, "label": L(uz, ru), "action": action, "fullWidth": full}

FUTURE = {  # new action type -> fallback that works today
    "my_orders": {"type": "track_order"},
    "subscriptions": {"type": "url", "url": SITE + "/account/subscriptions"},
    "reminders": {"type": "url", "url": SITE + "/account/profile"},
    "club": {"type": "screen", "screenId": "club_info"},
    "share_contact": {"type": "screen", "screenId": "club_info"},
    "referral": {"type": "screen", "screenId": "club_info"},
    "profile": {"type": "url", "url": SITE + "/account/profile"},
}

screens = [
    {
        "id": "main", "name": "Bosh menyu", "imageUrl": None, "showBack": False,
        "text": L(
            "<b>GoVita VIP Salomatlik Klubi</b>\n\nBuyurtma holati, qabul eslatmalari, obunalar va klub takliflari — hammasi shu yerda.",
            "<b>Клуб здоровья GoVita VIP</b>\n\nСтатус заказа, напоминания о приёме, подписки и предложения клуба — всё здесь."),
        "buttons": [
            btn("shop", "🛍 Doʻkon", "🛍 Магазин", {"type": "webapp"}),
            btn("orders", "📦 Buyurtmalarim", "📦 Мои заказы", {"type": "my_orders"}, False),
            btn("subs", "🔁 Obunalarim", "🔁 Мои подписки", {"type": "subscriptions"}, False),
            btn("remind", "⏰ Eslatmalar", "⏰ Напоминания", {"type": "reminders"}, False),
            btn("club", "⭐ VIP klub", "⭐ VIP клуб", {"type": "club"}, False),
            btn("deals", "🎁 Aksiyalar", "🎁 Акции", {"type": "screen", "screenId": "deals"}, False),
            btn("quiz", "🧪 Vitamin testi", "🧪 Тест витаминов", {"type": "url", "url": SITE + "/quiz"}, False),
            btn("help", "💬 Savol berish", "💬 Задать вопрос", {"type": "screen", "screenId": "help"}, False),
            btn("info", "ℹ️ Maʼlumot", "ℹ️ Информация", {"type": "screen", "screenId": "info"}, False),
            btn("lang", "🌐 Til / Язык", "🌐 Язык / Til", {"type": "language"}),
        ],
    },
    {
        "id": "deals", "name": "Aksiyalar", "imageUrl": None, "showBack": True,
        "text": L(
            "<b>Amaldagi chegirmalar</b>\n\n• <b>−10%</b> birinchi buyurtmaga — savatchada avtomatik\n• <b>Obuna:</b> bugun −10%, keyingi har yetkazishda −15%\n• <b>2 oling — 3-si sovgʻa</b> tanlangan mahsulotlarga\n• <b>Bepul yetkazish</b> 300 000 soʻmdan\n\nChegirmalar qoʻshilmaydi — eng kattasi qoʻllanadi.",
            "<b>Действующие скидки</b>\n\n• <b>−10%</b> на первый заказ — автоматически в корзине\n• <b>Подписка:</b> сегодня −10%, далее −15% на каждую доставку\n• <b>2 + 1 в подарок</b> на выбранные товары\n• <b>Бесплатная доставка</b> от 300 000 сум\n\nСкидки не суммируются — применяется наибольшая."),
        "buttons": [
            btn("deals_shop", "🛍 Aksiyadagi mahsulotlar", "🛍 Товары по акции", {"type": "webapp"}),
            btn("deals_site", "🌐 Saytda koʻrish", "🌐 Смотреть на сайте", {"type": "url", "url": SITE + "/sale"}),
        ],
    },
    {
        "id": "club_info", "name": "VIP klub haqida", "imageUrl": None, "showBack": True,
        "text": L(
            "<b>VIP Salomatlik Klubi</b> — bepul.\n\n• Buyurtma holati va yetkazish xabarlari\n• Qabul eslatmalari va kurs tugashi haqida ogohlantirish\n• Obunani shu yerdan boshqarish\n• Klub takliflari va yangi mahsulotlar\n• 300 000 soʻmdan bepul yetkazish\n\nQoʻshimcha foiz chegirma vaʼda qilinmaydi.",
            "<b>Клуб здоровья VIP</b> — бесплатно.\n\n• Статус заказа и доставки\n• Напоминания о приёме и окончании курса\n• Управление подпиской прямо здесь\n• Предложения клуба и новинки\n• Бесплатная доставка от 300 000 сум\n\nДополнительная процентная скидка не обещается."),
        "buttons": [
            btn("club_join", "📱 Raqamni ulashib qoʻshilish", "📱 Вступить, поделившись номером", {"type": "share_contact"}),
            btn("club_ref", "🤝 Doʻstni taklif qilish", "🤝 Пригласить друга", {"type": "referral"}),
        ],
    },
    {
        "id": "help", "name": "Yordam", "imageUrl": None, "showBack": True,
        "text": L(
            "Qanday yordam kerak?\n\nOperator: <b>+998 71 200 70 80</b>\nDushanba–Shanba, 09:00–18:00",
            "Чем помочь?\n\nОператор: <b>+998 71 200 70 80</b>\nПонедельник–суббота, 09:00–18:00"),
        "buttons": [
            btn("help_op", "💬 Operatorga yozish", "💬 Написать оператору", {"type": "operator"}),
            btn("help_consult", "🧑‍⚕️ Mahsulot boʻyicha maslahat", "🧑‍⚕️ Консультация по товару", {"type": "form", "formId": "consult"}),
            btn("help_order", "📦 Buyurtma boʻyicha savol", "📦 Вопрос по заказу", {"type": "track_order"}),
            btn("help_return", "↩️ Qaytarish", "↩️ Возврат", {"type": "text", "text": L(
                "<b>14 kunlik qaytarish</b>\n\nOchilmagan qadoqdagi mahsulot 14 kun ichida qabul qilinadi.\n1. Operatorga yozing yoki qoʻngʻiroq qiling.\n2. Mahsulotni asl qadoqda kuryerga topshiring.\n3. Toʻlov 3–10 ish kunida qaytariladi.",
                "<b>Возврат в течение 14 дней</b>\n\nТовар в невскрытой упаковке принимается в течение 14 дней.\n1. Напишите или позвоните оператору.\n2. Передайте товар курьеру в оригинальной упаковке.\n3. Деньги вернутся за 3–10 рабочих дней.")}),
        ],
    },
    {
        "id": "info", "name": "Maʼlumot", "imageUrl": None, "showBack": True,
        "text": L("Nima haqida bilmoqchisiz?", "О чём хотите узнать?"),
        "buttons": [
            btn("info_deliv", "🚚 Yetkazib berish", "🚚 Доставка", {"type": "text", "text": L(
                "<b>Yetkazib berish</b>\n\n• Toshkent — Yandex Dostavka, 24 soat ichida\n• Viloyatlar — BTS, 1–3 kun\n• Oʻzi olib ketish — Toshkentdagi ombordan, bepul\n\n300 000 soʻmdan ortiq xaridga yetkazish bepul.",
                "<b>Доставка</b>\n\n• Ташкент — Яндекс Доставка, в течение 24 часов\n• Регионы — BTS, 1–3 дня\n• Самовывоз — со склада в Ташкенте, бесплатно\n\nПри заказе от 300 000 сум доставка бесплатная.")}, False),
            btn("info_pay", "💳 Toʻlov", "💳 Оплата", {"type": "text", "text": L(
                "<b>Toʻlov usullari</b>\n\nPayme, Click, Uzum — onlayn.\nNaqd yoki karta — yetkazishda kuryerga.",
                "<b>Способы оплаты</b>\n\nPayme, Click, Uzum — онлайн.\nНаличные или карта — курьеру при доставке.")}, False),
            btn("info_docs", "📄 Sertifikatlar", "📄 Сертификаты", {"type": "url", "url": SITE + "/licenses"}, False),
            btn("info_about", "🏢 Biz haqimizda", "🏢 О нас", {"type": "url", "url": SITE + "/about"}, False),
            btn("info_b2b", "🏥 Dorixonalar uchun", "🏥 Для аптек", {"type": "form", "formId": "b2b"}),
        ],
    },
]

forms = [
    {
        "id": "consult", "name": "Mahsulot boʻyicha maslahat",
        "intro": L("Savolingizni qoldiring — operator Telegram yoki telefon orqali javob beradi. Bu tibbiy maslahat emas.",
                   "Оставьте вопрос — оператор ответит в Telegram или по телефону. Это не медицинская консультация."),
        "fields": [
            {"id": "topic", "label": L("Qaysi yoʻnalish?", "Какое направление?"), "type": "choice", "required": True,
             "options": [L("Immunitet", "Иммунитет"), L("Energiya va charchoq", "Энергия и усталость"), L("Soch, teri, tirnoq", "Волосы, кожа, ногти"),
                         L("Bolalar uchun", "Для детей"), L("Homiladorlik", "Беременность"), L("Boshqa", "Другое")], "mapTo": None},
            {"id": "question", "label": L("Savolingizni yozing", "Напишите вопрос"), "type": "text", "required": True, "options": [], "mapTo": None},
            {"id": "phone", "label": L("Telefon raqamingiz", "Ваш номер телефона"), "type": "contact", "required": True, "options": [], "mapTo": "phone"},
        ],
        "successText": L("Rahmat! Soʻrov #{id} qabul qilindi. Operator tez orada javob beradi.",
                         "Спасибо! Запрос #{id} принят. Оператор скоро ответит."),
        "leadStatus": "NEW", "tags": ["maslahat", "bot"], "notifyAdmin": True,
    },
    {
        "id": "b2b", "name": "Dorixonalar va hamkorlar",
        "intro": L("Ulgurji narx, hudud va toʻlov muddati alohida shartnomada kelishiladi. Bir necha savol:",
                   "Оптовые цены, регион и отсрочка согласуются отдельным договором. Несколько вопросов:"),
        "fields": [
            {"id": "company", "label": L("Dorixona yoki kompaniya nomi", "Название аптеки или компании"), "type": "text", "required": True, "options": [], "mapTo": "company"},
            {"id": "direction", "label": L("Yoʻnalish", "Направление"), "type": "choice", "required": True,
             "options": [L("Dorixonalar uchun", "Для аптек"), L("Distributorlik", "Дистрибуция"), L("Korporativ buyurtma", "Корпоративный заказ")], "mapTo": None},
            {"id": "region", "label": L("Hudud", "Регион"), "type": "text", "required": True, "options": [], "mapTo": "location"},
            {"id": "name", "label": L("Kontakt shaxs", "Контактное лицо"), "type": "text", "required": True, "options": [], "mapTo": "name"},
            {"id": "phone", "label": L("Telefon raqami", "Номер телефона"), "type": "contact", "required": True, "options": [], "mapTo": "phone"},
        ],
        "successText": L("Rahmat! Ariza #{id} qabul qilindi. Menejer siz bilan bogʻlanadi.",
                         "Спасибо! Заявка #{id} принята. Менеджер свяжется с вами."),
        "leadStatus": "NEW", "tags": ["b2b", "bot"], "notifyAdmin": True,
    },
]

settings = {
    "startScreenId": "main",
    "welcome": L("Assalomu alaykum! <b>GoVita</b> VIP Salomatlik Klubiga xush kelibsiz 👋",
                 "Здравствуйте! Добро пожаловать в VIP клуб здоровья <b>GoVita</b> 👋"),
    "defaultLang": "uz", "languages": ["uz", "ru"], "askLanguageOnStart": False,
    "showStoreButton": True, "storeButtonLabel": L("🛍 Doʻkon", "🛍 Магазин"),
    "fallback": "operator",
    "fallbackText": L("Xabaringiz operatorga yuborildi. Ish vaqtida (09:00–18:00) tez javob beramiz.",
                      "Сообщение передано оператору. В рабочее время (09:00–18:00) ответим быстро."),
    "commands": [
        {"command": "start", "description": L("Bosh menyu", "Главное меню"), "screenId": None},
        {"command": "aksiyalar", "description": L("Amaldagi chegirmalar", "Действующие скидки"), "screenId": "deals"},
        {"command": "klub", "description": L("VIP klub", "VIP клуб"), "screenId": "club_info"},
        {"command": "yordam", "description": L("Savol berish", "Задать вопрос"), "screenId": "help"},
    ],
}

target = {"version": 1, "settings": settings, "screens": screens, "forms": forms}
now = copy.deepcopy(target)
for s in now["screens"]:
    for b in s["buttons"]:
        if b["action"]["type"] in FUTURE:
            b["action"] = FUTURE[b["action"]["type"]]
# today: the club_info screen links to itself for share/referral -> replace with site links
for s in now["screens"]:
    if s["id"] == "club_info":
        s["buttons"] = [btn("club_site", "🌐 Kabinetga kirish", "🌐 Войти в кабинет", {"type": "url", "url": SITE + "/account"})]

out = sys.argv[1]
json.dump(target, open(out + "/govita-botflow.json", "w"), ensure_ascii=False, indent=2)
json.dump(now, open(out + "/govita-botflow-now.json", "w"), ensure_ascii=False, indent=2)
print("ok")
