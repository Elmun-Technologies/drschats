"""The shop inside the bot: catalogue, cart and step-by-step checkout.

Every product, price, stock count and promotion comes from the site API
(/api/bot/shop/*). This module only renders what the server returned and
collects what the customer typed. The cart itself lives in the site database,
so the bot can restart at any moment without losing it.
"""
from __future__ import annotations

import logging
import uuid
from html import escape
from typing import Any

from aiogram import F, Router
from aiogram.exceptions import TelegramBadRequest, TelegramForbiddenError, TelegramRetryAfter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message, ReplyKeyboardRemove

from .backend import BackendError
from .config import cfg
from .ui import DISCLAIMER, contact_kb, kb, b

router = Router()
log = logging.getLogger("govita.shop")

REGIONS = [
    ("Toshkent shahri", "Ташкент"),
    ("Toshkent viloyati", "Ташкентская область"),
    ("Andijon", "Андижан"),
    ("Buxoro", "Бухара"),
    ("Fargʻona", "Фергана"),
    ("Jizzax", "Джизак"),
    ("Xorazm", "Хорезм"),
    ("Namangan", "Наманган"),
    ("Navoiy", "Навои"),
    ("Qashqadaryo", "Кашкадарья"),
    ("Qoraqalpogʻiston", "Каракалпакстан"),
    ("Samarqand", "Самарканд"),
    ("Sirdaryo", "Сырдарья"),
    ("Surxondaryo", "Сурхандарья"),
]

T = {
    "shop": ("🛍 Doʻkon", "🛍 Магазин"),
    "catalog": ("📚 Katalog", "📚 Каталог"),
    "search": ("🔎 Qidiruv", "🔎 Поиск"),
    "cart": ("🛒 Savat", "🛒 Корзина"),
    "checkout": ("✅ Buyurtma berish", "✅ Оформить заказ"),
    "language": ("🌐 Til / Язык", "🌐 Язык / Til"),
    "orders": ("📦 Buyurtmalarim", "📦 Мои заказы"),
    "help": ("💬 Savol berish", "💬 Задать вопрос"),
    "menu": ("⬅️ Menyu", "⬅️ Меню"),
    "back": ("⬅️ Orqaga", "⬅️ Назад"),
    "next": ("➡️ Keyingi", "➡️ Далее"),
    "prev": ("⬅️ Oldingi", "⬅️ Предыдущие"),
    "choose_category": ("Kategoriyani tanlang:", "Выберите категорию:"),
    "choose_product": ("Mahsulotni tanlang:", "Выберите товар:"),
    "nothing_found": ("Hech narsa topilmadi.", "Ничего не найдено."),
    "catalog_empty": ("Katalogda mahsulot yoʻq.", "В каталоге пока нет товаров."),
    "add": ("➕ Savatga", "➕ В корзину"),
    "added": ("✅ Savatga qoʻshildi", "✅ Добавлено в корзину"),
    "not_available": ("Bu mahsulot hozir sotuvda yoʻq.", "Этот товар сейчас недоступен."),
    "out_of_stock": ("Sotuvda yoʻq", "Нет в наличии"),
    "only_left": ("Faqat {n} ta qoldi", "Осталось всего {n} шт."),
    "cart_empty": ("Savat boʻsh. Katalogdan mahsulot tanlang.", "Корзина пуста. Выберите товар в каталоге."),
    "cart_title": ("<b>🛒 Savat</b>", "<b>🛒 Корзина</b>"),
    "subtotal": ("Mahsulotlar", "Товары"),
    "discount": ("Chegirma", "Скидка"),
    "shipping": ("Yetkazish", "Доставка"),
    "free": ("Bepul", "Бесплатно"),
    "total": ("Jami", "Итого"),
    "to_free_shipping": ("Bepul yetkazishgacha {sum}", "До бесплатной доставки {sum}"),
    "promo": ("🏷 Promokod", "🏷 Промокод"),
    "promo_ask": ("Promokod kodini yozing yoki «Oʻtkazib yuborish»ni bosing.", "Введите промокод или нажмите «Пропустить»."),
    "promo_skip": ("Oʻtkazib yuborish", "Пропустить"),
    "promo_applied": ("Promokod qoʻllandi: −{sum}", "Промокод применён: −{sum}"),
    "promo_invalid": ("Promokod yaroqsiz.", "Промокод недействителен."),
    "clear_cart": ("🗑 Savatni tozalash", "🗑 Очистить корзину"),
    "removed": ("Olib tashlandi.", "Удалено."),
    "qty_limit": ("Bu mahsulotdan koʻproq qoʻshib boʻlmaydi.", "Больше этого товара добавить нельзя."),
    "name_ask": ("Ismingizni yozing.", "Напишите ваше имя."),
    "name_saved": ("Ism: {name}", "Имя: {name}"),
    "phone_step": ("Telefon raqami: <b>{phone}</b>\nRaqam Telegram kontaktidan olingan.", "Телефон: <b>{phone}</b>\nНомер взят из вашего Telegram-контакта."),
    "phone_change": ("📱 Raqamni oʻzgartirish", "📱 Изменить номер"),
    "phone_ok": ("✅ Toʻgʻri", "✅ Верно"),
    "method_ask": ("Yetkazish usulini tanlang:", "Выберите способ доставки:"),
    "courier": ("🚚 Kuryer", "🚚 Курьер"),
    "pickup": ("🏬 Oʻzim olib ketaman", "🏬 Самовывоз"),
    "region_ask": ("Viloyatni tanlang:", "Выберите область:"),
    "address_ask": ("Manzilni yozing: tuman, koʻcha, uy.", "Напишите адрес: район, улица, дом."),
    "address_location": ("📍 Lokatsiya yuborish", "📍 Отправить локацию"),
    "address_saved": ("Manzil: {address}", "Адрес: {address}"),
    "note_ask": ("Izoh qoʻshing (ixtiyoriy).", "Добавьте комментарий (необязательно)."),
    "note_skip": ("Oʻtkazib yuborish", "Пропустить"),
    "summary": ("<b>Buyurtmani tekshiring</b>", "<b>Проверьте заказ</b>"),
    "continue": ("➡️ Davom etish", "➡️ Продолжить"),
    "confirm": ("✅ Tasdiqlash", "✅ Подтвердить"),
    "order_placed": (
        "🎉 <b>Buyurtma №{code} qabul qilindi</b>\nJami: {sum}\n\nOperator tasdiqlash uchun qoʻngʻiroq qiladi. Holat shu chatga keladi.",
        "🎉 <b>Заказ №{code} принят</b>\nИтого: {sum}\n\nОператор позвонит для подтверждения. Статус придёт в этот чат.",
    ),
    "order_pending": ("Buyurtma allaqachon qabul qilinmoqda. Bir daqiqadan keyin tekshiring.", "Заказ уже обрабатывается. Проверьте через минуту."),
    "order_error": ("Buyurtma yuborilmadi. Birozdan keyin qayta urinib koʻring.", "Заказ не отправлен. Попробуйте ещё раз через минуту."),
    "not_linked": ("Buyurtma berish uchun telefoningizni ulashing.", "Чтобы оформить заказ, поделитесь номером телефона."),
    "search_ask": ("Mahsulot nomini yozing.", "Напишите название товара."),
    "search_results": ("🔎 «{q}» boʻyicha natijalar:", "🔎 Результаты по «{q}»:"),
    "search_empty": ("«{q}» boʻyicha mahsulot topilmadi.", "По запросу «{q}» ничего не найдено."),
    "ticket_ask": ("Savolingizni bitta xabarda yozing — operatorga yuboramiz.", "Напишите вопрос одним сообщением — отправим оператору."),
    "ticket_sent": ("✅ Savolingiz operatorga yuborildi.", "✅ Ваш вопрос отправлен оператору."),
    "operator": ("💬 Operatorga yozish", "💬 Написать оператору"),
    "new_order": ("🛍 Yana xarid", "🛍 Купить ещё"),
    "again": ("🔁 Qayta buyurtma", "🔁 Повторить заказ"),
    "cart_updated": ("Savat yangilandi.", "Корзина обновлена."),
    "cancelled": ("Bekor qilindi.", "Отменено."),
    "delivery_tashkent": ("Toshkent boʻylab 24 soat ichida.", "По Ташкенту в течение 24 часов."),
    "delivery_regions": ("Viloyatlarga 1–3 kun.", "В регионы 1–3 дня."),
    "cod": ("Toʻlov: yetkazishda naqd pul", "Оплата: наличными при получении"),
    "discount_first": ("Birinchi buyurtma −{pct}%", "Скидка на первый заказ −{pct}%"),
    "mini_app": ("🛍 Telegram doʻkoni", "🛍 Магазин в Telegram"),
    "phone_linked": (
        "✅ Raqamingiz ulandi: <b>{phone}</b>",
        "✅ Номер привязан: <b>{phone}</b>",
    ),
    "already_placed": (
        "Bu buyurtma allaqachon qabul qilingan: <b>№{code}</b>",
        "Этот заказ уже принят: <b>№{code}</b>",
    ),
    "contact_not_own": (
        "Faqat oʻz raqamingizni ulashishingiz mumkin.",
        "Можно отправить только свой номер.",
    ),
    "checkout_resume": (
        "Buyurtmani davom ettiramiz.",
        "Продолжим оформление заказа.",
    ),
    "stock_changed": (
        "⚠️ «{name}» hozir sotuvda yoʻq. Savatdan olib tashlang yoki keyinroq urinib koʻring.",
        "⚠️ «{name}» сейчас нет в наличии. Уберите его из корзины или попробуйте позже.",
    ),
    "price_changed": (
        "ℹ️ Narx yangilandi. Yakuniy summa: {sum}",
        "ℹ️ Цена обновилась. Итоговая сумма: {sum}",
    ),
    "promo_cleared": (
        "Promokod savatdan olib tashlandi.",
        "Промокод удалён из корзины.",
    ),
}

PROMO_REASONS = {
    "invalid_format": ("Kod formati notoʻgʻri.", "Неверный формат кода."),
    "not_found": ("Bunday kod topilmadi.", "Код не найден."),
    "inactive": ("Kod faol emas.", "Код неактивен."),
    "expired": ("Kod muddati tugagan.", "Срок действия кода истёк."),
    "not_started": ("Kod hali boshlanmagan.", "Код ещё не активен."),
    "exhausted": ("Kod ishlatib boʻlingan.", "Код уже использован."),
    "already_used": ("Bu kodni allaqachon ishlatgansiz.", "Вы уже использовали этот код."),
    "min_subtotal": ("Savatcha summasi yetarli emas.", "Сумма корзины недостаточна."),
    "not_applicable": ("Kod bu savatga qoʻllanmaydi.", "Код не применяется к этой корзине."),
    "wrong_phone": ("Kod boshqa telefon raqamiga bogʻlangan.", "Код привязан к другому номеру."),
    "referral_self": ("Oʻz kodini ishlatib boʻlmaydi.", "Нельзя использовать свой код."),
    "referral_not_first": ("Doʻst kodi faqat birinchi buyurtmaga.", "Код друга — только для первого заказа."),
}


T_MENU_TEXT = (
    "<b>GoVita VIP Salomatlik Klubi</b>\n\nKatalog, savat, buyurtma holati va klub takliflari — hammasi shu yerda.",
    "<b>GoVita VIP Salomatlik Klubi</b>\n\nКаталог, корзина, статус заказа и предложения клуба — всё здесь.",
)


def t(locale: str, key: str, **kw: Any) -> str:
    text = T[key][0 if locale != "ru" else 1]
    return text.format(**kw) if kw else text


def som(n: int | float) -> str:
    return f"{int(round(n)):,}".replace(",", " ") + " soʻm"


def money(n: int, locale: str) -> str:
    return som(n) if locale != "ru" else f"{int(round(n)):,}".replace(",", " ") + " сум"


class ShopState(StatesGroup):
    search = State()
    name = State()
    address = State()
    note = State()
    promo = State()
    ticket = State()


async def locale_of(api, chat: int) -> str:
    """The customer's language, also for a chat that has not linked a phone yet."""
    try:
        data = await api.request("GET", "/shop/locale", params={"chatId": chat})
        if data.get("locale") in ("uz", "ru"):
            return data["locale"]
    except BackendError:
        pass
    try:
        c = await api.request("GET", f"/customers/{chat}")
        return c.get("locale") or "uz"
    except BackendError:
        return "uz"


def cbd(data: str) -> str | None:
    """Telegram rejects callback_data over 64 bytes; never send such a button."""
    return data if len(data.encode("utf-8")) <= 64 else None


#: label key, callback data — in the order the menu has always used.
MENU_LAYOUT = (
    ("catalog", "cat"),
    ("search", "search"),
    ("cart", "cart"),
    ("orders", "m:orders"),
    ("promo", "promo"),
    ("help", "ticket"),
)


def menu_switch(key: str) -> bool:
    """Whether /admin/bot left this button on. A missing map means all on."""
    switches = getattr(cfg, "menu", None)
    return True if not isinstance(switches, dict) else bool(switches.get(key, True))


def main_menu(locale: str, customer: dict | None = None):
    rows = []
    if menu_switch("miniApp") and cfg.shop_url.startswith("https://"):
        rows.append([b(t(locale, "mini_app"), webapp=f"{cfg.shop_url}/uz")])
    # Two per row, skipping what the panel switched off. An empty list would
    # leave the customer with no way back, so all-off falls back to the full menu.
    buttons = [(key, data) for key, data in MENU_LAYOUT if menu_switch(key)]
    if not buttons:
        buttons = list(MENU_LAYOUT)
    for i in range(0, len(buttons), 2):
        rows.append([b(t(locale, key), data) for key, data in buttons[i:i + 2]])
    rows.append([b("🌐 " + ("Русский" if locale != "ru" else "Oʻzbekcha"), "lang:" + ("ru" if locale != "ru" else "uz"))])
    if customer:
        rows.insert(0, [b(f"👤 {escape(customer.get('name') or '')}", "club")])
    return kb(*rows)


def categories_kb(locale: str, categories: list[dict]):
    rows, row = [], []
    for c in categories:
        if not c.get("count"):
            continue
        row.append(b(f"{c['name']} ({c['count']})", "cat:" + c["slug"]))
        if len(row) == 2:
            rows.append(row)
            row = []
    if row:
        rows.append(row)
    rows.append([b(t(locale, "search"), "search"), b(t(locale, "cart"), "cart")])
    rows.append([b(t(locale, "menu"), "menu")])
    return kb(*rows)


def product_rows(locale: str, items: list[dict]):
    rows = []
    for p in items:
        data = cbd("pr:" + p["slug"])
        if not data:
            log.warning("shop: slug too long for callback_data: %s", p["slug"])
            continue
        mark = "" if p.get("inStock") else " · ⛔"
        rows.append([b(f"{p['name']} — {money(p['price'], locale)}{mark}", data)])
    return rows


def list_kb(locale: str, data: dict, back_data: str = "cat"):
    rows = product_rows(locale, data.get("items", []))
    nav = []
    page = int(data.get("page") or 1)
    pages = int(data.get("pages") or 1)
    cat = data.get("category") or "-"
    q = (data.get("q") or "-")[:24]
    if page > 1:
        data_prev = cbd(f"pg:{cat}:{page - 1}:{q}")
        if data_prev:
            nav.append(b(t(locale, "prev"), data_prev))
    if page < pages:
        data_next = cbd(f"pg:{cat}:{page + 1}:{q}")
        if data_next:
            nav.append(b(t(locale, "next"), data_next))
    if nav:
        rows.append(nav)
    rows.append([b(t(locale, "cart"), "cart"), b(t(locale, "back"), back_data)])
    return kb(*rows)


def product_kb(locale: str, product: dict, back_data: str = "cat"):
    rows = []
    add = cbd("add:" + product["slug"])
    if product.get("inStock") and add:
        rows.append([b(t(locale, "add"), add)])
    rows.append([b(t(locale, "cart"), "cart")])
    rows.append([b(t(locale, "back"), back_data), b(t(locale, "menu"), "menu")])
    return kb(*rows)


def product_caption(locale: str, p: dict) -> str:
    head = [f"<b>{escape(p['name'])}</b>"]
    if p.get("tagline"):
        head.append(escape(p["tagline"]))
    price = f"<b>{money(p['price'], locale)}</b>"
    if p.get("oldPrice"):
        price = f"<s>{money(p['oldPrice'], locale)}</s>  {price}"
    head += ["", price]
    if p.get("stockLeft"):
        head.append(t(locale, "only_left", n=p["stockLeft"]))
    if not p.get("inStock"):
        head.append(f"⛔ {t(locale, 'out_of_stock')}")
    if p.get("unit"):
        head.append(escape(str(p["unit"])))
    tail = ["", DISCLAIMER]
    desc = escape(p.get("description") or "")
    # Telegram caps a photo caption at 1024 characters. Drop description
    # characters, never the price, the stock line or the BAD warning.
    room = 1024 - len("\n".join(head + tail)) - 2
    if desc and room > 20:
        head += ["", desc[:room] + ("…" if len(desc) > room else "")]
    return "\n".join(head + tail)


def cart_text(locale: str, quote: dict) -> str:
    lines = [t(locale, "cart_title"), ""]
    for line in quote.get("lines", []):
        name = escape(line["name"])
        lines.append(f"{name} × {line['qty']} — {money(line['lineTotal'], locale)}")
    totals = quote["totals"]
    lines.append("")
    lines.append(f"{t(locale, 'subtotal')}: {money(totals['subtotal'], locale)}")
    if totals.get("discount"):
        lines.append(f"{t(locale, 'discount')}: −{money(totals['discount'], locale)}")
    lines.append(f"{t(locale, 'shipping')}: {money(totals['shipping'], locale) if totals.get('shipping') else t(locale, 'free')}")
    lines.append(f"<b>{t(locale, 'total')}: {money(totals['total'], locale)}</b>")
    if totals.get("freeShippingRemaining"):
        lines.append(t(locale, "to_free_shipping", sum=money(totals["freeShippingRemaining"], locale)))
    if quote.get("promo", {}).get("code"):
        promo = quote["promo"]
        if promo.get("ok"):
            lines.append(f"🏷 {promo['code']}: −{money(promo.get('discount', 0), locale)}")
        else:
            reason = PROMO_REASONS.get(promo.get("reason") or "", PROMO_REASONS["not_found"])
            lines.append(f"⚠️ {promo['code']}: {reason[0 if locale != 'ru' else 1]}")
    for issue in quote.get("issues", []):
        what = "sotuvda yoʻq" if issue["reason"] == "out_of_stock" else "topilmadi"
        lines.append(f"⚠️ {escape(issue['name'])} — {what}")
    return "\n".join(lines)


def cart_kb(locale: str, quote: dict):
    rows = []
    for line in quote.get("lines", []):
        slug = line["slug"]
        minus, plus, remove = cbd(f"q:{slug}:-1"), cbd(f"q:{slug}:1"), cbd("rm:" + slug)
        if not (minus and plus and remove):
            log.warning("shop: slug too long for callback_data: %s", slug)
            continue
        rows.append(
            [
                b("➖", minus),
                b(f"{line['name'][:26]} × {line['qty']}", "cart"),
                b("➕", plus),
            ]
        )
        rows.append([b("🗑 " + line["name"][:30], remove)])
    if quote.get("lines"):
        rows.append([b(t(locale, "promo"), "promo")])
        rows.append([b(t(locale, "checkout"), "co")])
        rows.append([b(t(locale, "clear_cart"), "clr")])
    rows.append([b(t(locale, "catalog"), "cat"), b(t(locale, "menu"), "menu")])
    return kb(*rows)


def summary_text(locale: str, quote: dict, draft: dict) -> str:
    lines = [t(locale, "summary"), ""]
    lines.append(f"👤 {escape(draft.get('name') or '')} · +{escape(draft.get('phone') or '')}")
    method = draft.get("method")
    if method == "pickup":
        lines.append(t(locale, "pickup"))
        if draft.get("address"):
            lines.append(f"📍 {escape(draft['address'])}")
    else:
        lines.append(f"{t(locale, 'courier')}: {escape(draft.get('region') or '')}, {escape(draft.get('address') or '')}")
        lines.append(t(locale, "delivery_tashkent") if draft.get("region") == REGIONS[0][0] else t(locale, "delivery_regions"))
    if draft.get("note"):
        lines.append(f"📝 {escape(draft['note'])}")
    lines.append("")
    lines.append(cart_text(locale, quote).replace(t(locale, "cart_title") + "\n\n", ""))
    lines.append("")
    lines.append(f"💳 {t(locale, 'cod')}")
    return "\n".join(lines)


async def safe_edit(target, text: str, markup=None):
    try:
        await target.edit_text(text, reply_markup=markup, disable_web_page_preview=True)
    except TelegramBadRequest:
        await target.answer(text, reply_markup=markup, disable_web_page_preview=True)


async def send_catalog(m, api, locale: str, edit=False):
    data = await api.request("GET", "/shop/categories", params={"locale": locale})
    cats = data["categories"]
    text = t(locale, "choose_category")
    markup = categories_kb(locale, cats)
    if edit:
        await safe_edit(m, text, markup)
    else:
        await m.answer(text, reply_markup=markup)


async def send_list(m, api, locale: str, category: str | None, page: int, q: str | None = None, edit=True):
    params = {"locale": locale, "page": page}
    if category and category != "-":
        params["category"] = category
    if q and q != "-":
        params["q"] = q
    data = await api.request("GET", "/shop/catalog", params=params)
    data["category"] = category
    data["q"] = q
    if not data.get("items"):
        text = t(locale, "search_empty", q=escape(q)) if q else t(locale, "catalog_empty")
        markup = kb([b(t(locale, "back"), "cat"), b(t(locale, "menu"), "menu")])
    else:
        head = t(locale, "search_results", q=escape(q)) if q else t(locale, "choose_product")
        text = f"{head}\n{data.get('page')}/{data.get('pages')}"
        markup = list_kb(locale, data)
    if edit:
        await safe_edit(m, text, markup)
    else:
        await m.answer(text, reply_markup=markup)


async def send_product(m, api, locale: str, slug: str, back_data: str = "cat"):
    data = await api.request("GET", "/shop/product/" + slug, params={"locale": locale})
    p = data["product"]
    markup = product_kb(locale, p, back_data)
    caption = product_caption(locale, p)
    # Telegram only fetches https URLs; anything else would be a rejected
    # request on every card, so fall back to text before trying. (A local
    # site serves http://localhost images, which only the bot's text path
    # can show — the same is true of any misconfigured production host.)
    image = p.get("image")
    if isinstance(image, str) and image.startswith("https://"):
        try:
            await m.answer_photo(photo=image, caption=caption[:1024], reply_markup=markup)
            return
        except (TelegramBadRequest, TelegramForbiddenError, TelegramRetryAfter):
            pass
    await m.answer(caption, reply_markup=markup, disable_web_page_preview=True)


async def send_cart(target, api, chat: int, locale: str, edit=True):
    quote = await api.request("GET", "/shop/cart", params={"chatId": chat, "locale": locale})
    if not quote.get("lines") and not quote.get("issues"):
        text = t(locale, "cart_empty")
        markup = kb([b(t(locale, "catalog"), "cat"), b(t(locale, "menu"), "menu")])
    else:
        text = cart_text(locale, quote)
        markup = cart_kb(locale, quote)
    if edit:
        await safe_edit(target, text, markup)
    else:
        await target.answer(text, reply_markup=markup, disable_web_page_preview=True)
    return quote


async def customer_of(api, chat: int) -> dict | None:
    try:
        return await api.request("GET", f"/customers/{chat}")
    except BackendError as e:
        if e.status == 404:
            return None
        raise


async def reply_error(target, locale: str, e: BackendError, fallback: str = "order_error"):
    if e.status == 429:
        text = "⏳ Juda koʻp urinish. Bir daqiqadan keyin qayta urinib koʻring." if locale != "ru" else "⏳ Слишком много попыток. Повторите через минуту."
    else:
        text = t(locale, fallback)
    await target.answer(text)


# ── Account and checkout start ────────────────────────────────────────────


@router.message(F.contact)
async def on_contact(m: Message, api, state: FSMContext):
    """Phone sharing is the only proof of the number; the checkout resumes after it."""
    locale = await locale_of(api, m.from_user.id)
    if m.contact.user_id != m.from_user.id or m.chat.id != m.from_user.id:
        return await m.answer(t(locale, "contact_not_own"), reply_markup=contact_kb())
    try:
        res = await api.request(
            "POST",
            "/contacts",
            body={
                "telegramUserId": m.from_user.id,
                "contactUserId": m.contact.user_id,
                "chatId": m.chat.id,
                "phone": m.contact.phone_number,
                "name": m.from_user.full_name,
                "username": m.from_user.username,
            },
        )
    except BackendError as e:
        if e.status == 409:
            return await m.answer(
                "Bu raqam boshqa Telegram hisobiga bogʻlangan. Operator tekshirib, siz bilan bogʻlanadi."
                if locale != "ru"
                else "Этот номер привязан к другому аккаунту. Оператор проверит и свяжется с вами.",
                reply_markup=main_menu(locale),
            )
        return await reply_error(m, locale, e)
    phone = str(res.get("phone") or "")
    await m.answer(t(locale, "phone_linked", phone="+" + phone), reply_markup=ReplyKeyboardRemove())
    data = await state.get_data()
    if data.get("name") or data.get("method"):
        # The customer pressed “change number” mid-checkout.
        await state.update_data(phone=phone)
        return await ask_phone(m, api, locale, state)

    try:
        quote = await api.request("GET", "/shop/cart", params={"chatId": m.from_user.id, "locale": locale})
    except BackendError:
        quote = {}
    if quote.get("lines"):
        # The checkout was blocked on the phone step: continue where it stopped.
        customer = await customer_of(api, m.from_user.id)
        await state.set_data({
            "name": (customer or {}).get("name") or "",
            "phone": phone,
            "promo": (quote.get("promo") or {}).get("code") or "",
        })
        await state.set_state(ShopState.name)
        await m.answer(t(locale, "checkout_resume"))
        return await ask_name(m, api, locale, state)
    customer = await customer_of(api, m.from_user.id)
    await m.answer(T_MENU_TEXT[0 if locale != "ru" else 1], reply_markup=main_menu(locale, customer))


async def ask_name(m, api, locale: str, state: FSMContext):
    data = await state.get_data()
    await state.set_state(ShopState.name)
    rows = []
    if data.get("name"):
        rows.append([b(f"✅ {escape(str(data['name']))}", "co:name_keep")])
    rows.append([b(t(locale, "back"), "cart")])
    await m.answer(t(locale, "name_ask"), reply_markup=kb(*rows))


async def begin_checkout(m, api, chat: int, locale: str, state: FSMContext):
    customer = await customer_of(api, chat)
    if not customer or not customer.get("phone"):
        await state.clear()
        await m.answer(t(locale, "not_linked"), reply_markup=contact_kb())
        return
    try:
        quote = await api.request("GET", "/shop/cart", params={"chatId": chat, "locale": locale})
    except BackendError as e:
        return await reply_error(m, locale, e)
    if not quote.get("lines"):
        text = cart_text(locale, quote) if quote.get("issues") else t(locale, "cart_empty")
        return await m.answer(text, reply_markup=kb([b(t(locale, "catalog"), "cat")]))
    await state.set_data({
        "name": customer.get("name") or "",
        "phone": customer["phone"],
        "promo": (quote.get("promo") or {}).get("code") or "",
    })
    await ask_name(m, api, locale, state)


# ── Catalogue ─────────────────────────────────────────────────────────────


@router.callback_query(F.data == "cat")
async def cb_catalog(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await state.clear()
    await send_catalog(q.message, api, locale)


@router.callback_query(F.data.startswith("cat:"))
async def cb_category(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    slug = q.data.split(":", 1)[1]
    await state.clear()
    await send_list(q.message, api, locale, slug, 1, None, edit=True)


@router.callback_query(F.data.startswith("pg:"))
async def cb_page(q: CallbackQuery, api):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    parts = q.data.split(":", 3)
    if len(parts) < 3:
        return await send_catalog(q.message, api, locale)
    _, cat, page = parts[:3]
    query = parts[3] if len(parts) > 3 else None
    try:
        await send_list(q.message, api, locale, None if cat == "-" else cat, int(page), None if query in (None, "-") else query)
    except ValueError:
        await send_catalog(q.message, api, locale)


@router.callback_query(F.data.startswith("pr:"))
async def cb_product(q: CallbackQuery, api):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    slug = q.data[3:]
    try:
        await send_product(q.message, api, locale, slug, back_data="cat")
    except BackendError as e:
        await reply_error(q.message, locale, e)


@router.callback_query(F.data.startswith("add:"))
async def cb_add(q: CallbackQuery, api, state: FSMContext):
    locale = await locale_of(api, q.from_user.id)
    slug = q.data[4:]
    try:
        await api.request("POST", "/shop/cart/add", body={"chatId": q.from_user.id, "slug": slug, "qty": 1})
    except BackendError as e:
        await q.answer()
        if e.status == 409:
            return await q.message.answer(t(locale, "not_available"))
        if e.status == 429:
            return await q.message.answer("⏳")
        raise
    await q.answer(t(locale, "added"))
    quote = await api.request("GET", "/shop/cart", params={"chatId": q.from_user.id, "locale": locale})
    markup = kb(
        [b(t(locale, "cart") + f" ({quote['totals']['itemCount']})", "cart")],
        [b(t(locale, "catalog"), "cat"), b(t(locale, "menu"), "menu")],
    )
    await q.message.answer(t(locale, "added"), reply_markup=markup)


# ── Search ────────────────────────────────────────────────────────────────


@router.callback_query(F.data == "search")
async def cb_search(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await state.set_state(ShopState.search)
    await q.message.answer(t(locale, "search_ask"), reply_markup=kb([b(t(locale, "back"), "cat")]))


@router.message(ShopState.search)
async def on_search(m: Message, api, state: FSMContext):
    locale = await locale_of(api, m.from_user.id)
    query = (m.text or "").strip()[:60]
    await state.clear()
    if not query:
        return await send_catalog(m, api, locale, edit=False)
    try:
        await send_list(m, api, locale, None, 1, query, edit=False)
    except BackendError as e:
        await reply_error(m, locale, e)


# ── Cart ──────────────────────────────────────────────────────────────────


@router.callback_query(F.data == "cart")
async def cb_cart(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await state.clear()
    await send_cart(q.message, api, q.from_user.id, locale)


@router.callback_query(F.data.startswith("q:"))
async def cb_qty(q: CallbackQuery, api):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    try:
        _, slug, delta = q.data.split(":", 2)
        quote = await api.request("GET", "/shop/cart", params={"chatId": q.from_user.id, "locale": locale})
        current = next((l["qty"] for l in quote.get("lines", []) if l["slug"] == slug), 0)
        target = current + int(delta)
        try:
            quote = await api.request("POST", "/shop/cart/set", body={"chatId": q.from_user.id, "slug": slug, "qty": target, "locale": locale})
        except BackendError as e:
            if e.status == 429:
                return await q.message.answer("⏳")
            raise
        actual = next((l["qty"] for l in quote.get("lines", []) if l["slug"] == slug), 0)
        if target > 0 and actual < target:
            await q.message.answer(t(locale, "qty_limit"))
    except BackendError as e:
        return await reply_error(q.message, locale, e)
    except ValueError:
        return
    await send_cart(q.message, api, q.from_user.id, locale)


@router.callback_query(F.data.startswith("rm:"))
async def cb_remove(q: CallbackQuery, api):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    slug = q.data[3:]
    await api.request("POST", "/shop/cart/set", body={"chatId": q.from_user.id, "slug": slug, "qty": 0, "locale": locale})
    await send_cart(q.message, api, q.from_user.id, locale)


@router.callback_query(F.data == "clr")
async def cb_clear(q: CallbackQuery, api):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await api.request("POST", "/shop/cart/clear", body={"chatId": q.from_user.id})
    await q.message.answer(t(locale, "removed"), reply_markup=kb([b(t(locale, "catalog"), "cat"), b(t(locale, "menu"), "menu")]))


@router.callback_query(F.data == "promo")
async def cb_promo(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await state.set_state(ShopState.promo)
    await state.update_data(promo_after="cart")
    await q.message.answer(
        t(locale, "promo_ask"),
        reply_markup=kb([b(t(locale, "promo_skip"), "promo:skip")], [b(t(locale, "back"), "cart")]),
    )


@router.callback_query(F.data == "promo:skip")
async def cb_promo_skip(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    data = await state.get_data()
    after = data.get("promo_after") or "cart"
    await state.set_state(None)
    if after == "summary":
        await show_summary(q.message, api, q.from_user.id, locale, data, state)
    else:
        await state.clear()
        await send_cart(q.message, api, q.from_user.id, locale)


@router.message(ShopState.promo)
async def on_promo(m: Message, api, state: FSMContext):
    locale = await locale_of(api, m.from_user.id)
    data = await state.get_data()
    after = data.get("promo_after") or "cart"
    code = (m.text or "").strip()[:40]
    try:
        quote = await api.request("POST", "/shop/promo", body={"chatId": m.from_user.id, "code": code, "locale": locale})
    except BackendError as e:
        # Keep the promo state: the customer can retype the code.
        return await reply_error(m, locale, e)
    promo = quote.get("promo", {})
    if code and not promo.get("ok"):
        # Do not leave a dead code in the cart: the next order would fail on it.
        try:
            await api.request("POST", "/shop/promo", body={"chatId": m.from_user.id, "code": "", "locale": locale})
        except BackendError:
            pass
        reason = PROMO_REASONS.get(promo.get("reason") or "", PROMO_REASONS["not_found"])
        await m.answer(f"⚠️ {t(locale, 'promo_invalid')}\n{reason[0 if locale != 'ru' else 1]}")
        code = ""
    await state.set_state(None)
    if after == "summary":
        await state.update_data(promo=code)
        await show_summary(m, api, m.from_user.id, locale, {**data, "promo": code}, state)
    else:
        await state.clear()
        await send_cart(m, api, m.from_user.id, locale, edit=False)


# ── Checkout ──────────────────────────────────────────────────────────────


@router.callback_query(F.data == "co")
async def cb_checkout(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await begin_checkout(q.message, api, q.from_user.id, locale, state)


@router.callback_query(F.data == "co:name_keep")
async def cb_name_keep(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await state.set_state(None)
    await ask_phone(q.message, api, locale, state)


async def ask_phone(m, api, locale: str, state: FSMContext):
    data = await state.get_data()
    await state.set_state(None)
    if not data.get("phone"):
        return await m.answer(t(locale, "not_linked"), reply_markup=contact_kb())
    await m.answer(
        t(locale, "phone_step", phone="+" + str(data.get("phone", "")).lstrip("+")),
        reply_markup=kb(
            [b(t(locale, "phone_ok"), "co:method")],
            [b(t(locale, "phone_change"), "co:phone_change")],
            [b(t(locale, "back"), "cart")],
        ),
    )


@router.callback_query(F.data == "co:phone_change")
async def cb_phone_change(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await q.message.answer(t(locale, "not_linked"), reply_markup=contact_kb())


@router.message(ShopState.name)
async def on_name(m: Message, api, state: FSMContext):
    locale = await locale_of(api, m.from_user.id)
    name = (m.text or "").strip()
    if len(name) < 2:
        return await m.answer(t(locale, "name_ask"))
    await state.update_data(name=name[:120])
    await ask_phone(m, api, locale, state)


@router.callback_query(F.data == "co:method")
async def cb_method(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    d = await state.get_data()
    if not d.get("name"):
        await state.set_state(ShopState.name)
        return await q.message.answer(t(locale, "name_ask"))
    await state.set_state(None)
    await q.message.answer(
        t(locale, "method_ask"),
        reply_markup=kb(
            [b(t(locale, "courier"), "co:courier")],
            [b(t(locale, "pickup"), "co:pickup")],
            [b(t(locale, "back"), "cart")],
        ),
    )


@router.callback_query(F.data == "co:courier")
async def cb_courier(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await state.update_data(method="courier")
    await state.set_state(None)
    rows = []
    for i, (uz, ru) in enumerate(REGIONS):
        rows.append([b(uz if locale != "ru" else ru, f"co:region:{i}")])
    rows.append([b(t(locale, "back"), "co:method")])
    await q.message.answer(t(locale, "region_ask"), reply_markup=kb(*rows))


@router.callback_query(F.data.startswith("co:region:"))
async def cb_region(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    try:
        i = int(q.data.rsplit(":", 1)[1])
        region = REGIONS[i][0 if locale != "ru" else 1]
    except (ValueError, IndexError):
        return
    await state.update_data(method="courier", region=region)
    await state.set_state(ShopState.address)
    await q.message.answer(
        t(locale, "address_ask"),
        reply_markup=kb([b(t(locale, "back"), "co:courier")]),
    )


@router.callback_query(F.data == "co:pickup")
async def cb_pickup(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await state.update_data(method="pickup", region="Toshkent")
    await state.set_state(ShopState.address)
    await q.message.answer(
        "🏬 Oʻzingiz olib ketish: manzilni yozing yoki lokatsiya yuboring." if locale != "ru" else "🏬 Самовывоз: введите адрес или отправьте локацию.",
        reply_markup=kb([b(t(locale, "address_location"), "co:location")], [b(t(locale, "back"), "co:method")]),
    )


@router.callback_query(F.data == "co:location")
async def cb_location(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await state.set_state(ShopState.address)
    text = "Lokatsiyani yuboring (skrepka → Lokatsiya)." if locale != "ru" else "Отправьте локацию (скрепка → Локация)."
    await q.message.answer(text, reply_markup=kb([b(t(locale, "back"), "co:method")]))


@router.message(ShopState.address, F.location)
async def on_address_location(m: Message, api, state: FSMContext):
    locale = await locale_of(api, m.from_user.id)
    address = f"Lokatsiya: {m.location.latitude:.6f}, {m.location.longitude:.6f}"
    await state.update_data(address=address)
    await ask_note(m, locale, state)


@router.message(ShopState.address)
async def on_address(m: Message, api, state: FSMContext):
    locale = await locale_of(api, m.from_user.id)
    address = (m.text or "").strip()
    if len(address) < 3:
        return await m.answer(t(locale, "address_ask"))
    await state.update_data(address=address[:300])
    await ask_note(m, locale, state)


async def ask_note(m, locale: str, state: FSMContext):
    await state.set_state(ShopState.note)
    await m.answer(
        t(locale, "note_ask"),
        reply_markup=kb([b(t(locale, "note_skip"), "co:note_skip")], [b(t(locale, "back"), "cart")]),
    )


@router.callback_query(F.data == "co:note_skip")
async def cb_note_skip(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await state.update_data(note="")
    await state.set_state(ShopState.promo)
    await state.update_data(promo_after="summary")
    await q.message.answer(
        t(locale, "promo_ask"),
        reply_markup=kb([b(t(locale, "promo_skip"), "promo:skip")], [b(t(locale, "back"), "cart")]),
    )


@router.message(ShopState.note)
async def on_note(m: Message, api, state: FSMContext):
    locale = await locale_of(api, m.from_user.id)
    note = (m.text or "").strip()[:1000]
    await state.update_data(note=note)
    await state.set_state(ShopState.promo)
    await state.update_data(promo_after="summary")
    await m.answer(
        t(locale, "promo_ask"),
        reply_markup=kb([b(t(locale, "promo_skip"), "promo:skip")], [b(t(locale, "continue"), "co:summary")]),
    )


@router.callback_query(F.data == "co:summary")
async def cb_summary(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    d = await state.get_data()
    if not d.get("method"):
        await state.set_state(None)
        return await q.message.answer(t(locale, "method_ask"), reply_markup=kb([b(t(locale, "courier"), "co:courier"), b(t(locale, "pickup"), "co:pickup")]))
    await state.set_state(None)
    await show_summary(q.message, api, q.from_user.id, locale, d, state)


async def show_summary(m, api, chat: int, locale: str, d: dict, state: FSMContext):
    try:
        quote = await api.request(
            "POST",
            "/shop/quote",
            body={
                "chatId": chat,
                "locale": locale,
                "method": d.get("method") or "courier",
                "promoCode": d.get("promo") or None,
            },
        )
    except BackendError as e:
        return await reply_error(m, locale, e)
    if not quote.get("lines"):
        text = cart_text(locale, quote) if quote.get("issues") else t(locale, "cart_empty")
        return await m.answer(text, reply_markup=kb([b(t(locale, "catalog"), "cat")]))
    key = d.get("order_key") or uuid.uuid4().hex
    d["order_key"] = key
    await state.update_data(order_key=key, promo=d.get("promo") or "", summary_total=quote["totals"]["total"])
    text = summary_text(locale, quote, d)
    markup = kb(
        [b(t(locale, "confirm"), "co:confirm")],
        [b(t(locale, "promo"), "co:promo")],
        [b(t(locale, "back"), "cart")],
    )
    await m.answer(text, reply_markup=markup, disable_web_page_preview=True)


@router.callback_query(F.data == "co:promo")
async def cb_promo_checkout(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await state.update_data(promo_after="summary")
    await state.set_state(ShopState.promo)
    await q.message.answer(
        t(locale, "promo_ask"),
        reply_markup=kb([b(t(locale, "promo_skip"), "promo:skip")], [b(t(locale, "back"), "cart")]),
    )


@router.callback_query(F.data == "co:confirm")
async def cb_confirm(q: CallbackQuery, api, state: FSMContext):
    locale = await locale_of(api, q.from_user.id)
    d = await state.get_data()
    if d.get("placed"):
        await q.answer()
        return await q.message.answer(
            t(locale, "already_placed", code=escape(str(d["placed"]))),
            reply_markup=kb([b(t(locale, "orders"), "m:orders")], [b(t(locale, "menu"), "menu")]),
        )
    if not d.get("name") or not d.get("method") or not d.get("phone"):
        await q.answer()
        return await q.message.answer(t(locale, "order_error"))
    key = d.get("order_key") or uuid.uuid4().hex
    await state.update_data(order_key=key)
    await q.answer("⏳")
    body = {
        "chatId": q.from_user.id,
        "locale": locale,
        "name": d.get("name"),
        "phone": d.get("phone"),
        "method": d.get("method"),
        "region": d.get("region") or "",
        "address": d.get("address") or "",
        "note": d.get("note") or "",
        "promoCode": d.get("promo") or None,
        "idempotencyKey": key,
    }
    try:
        res = await api.request("POST", "/shop/order", body=body)
    except BackendError as e:
        if e.status == 409 and e.code == "out_of_stock":
            product_name = e.data.get("name") or e.data.get("slug") or "—"
            return await q.message.answer(
                t(locale, "stock_changed", name=escape(str(product_name))),
                reply_markup=kb([b(t(locale, "cart"), "cart")]),
            )
        if e.status == 422 and e.code == "promo_invalid":
            await state.update_data(promo="")
            try:
                await api.request("POST", "/shop/promo", body={"chatId": q.from_user.id, "code": "", "locale": locale})
            except BackendError:
                pass
            reason = PROMO_REASONS.get(e.data.get("reason") or "", PROMO_REASONS["not_found"])
            return await q.message.answer(
                f"⚠️ {t(locale, 'promo_invalid')}\n{reason[0 if locale != 'ru' else 1]}\n{t(locale, 'promo_cleared')}",
                reply_markup=kb([b(t(locale, "summary"), "co:summary")], [b(t(locale, "cart"), "cart")]),
            )
        if e.status == 409 and e.code == "not_linked":
            await state.clear()
            return await q.message.answer(t(locale, "not_linked"), reply_markup=contact_kb())
        if e.status == 425 or e.status == 429:
            return await q.message.answer(t(locale, "order_pending"))
        if e.status == 400 or e.status == 422:
            return await q.message.answer(t(locale, "order_error"))
        return await reply_error(q.message, locale, e)
    await state.set_state(None)
    await state.set_data({"placed": res["orderId"]})
    if res.get("alreadyCreated"):
        text = t(locale, "already_placed", code=escape(res["orderId"]))
    else:
        text = t(locale, "order_placed", code=escape(res["orderId"]), sum=money(res.get("total") or 0, locale))
        quoted = d.get("summary_total")
        if quoted is not None and res.get("total") is not None and int(res["total"]) != int(quoted):
            text += "\n" + t(locale, "price_changed", sum=money(res["total"], locale))
    await q.message.answer(
        text,
        reply_markup=kb([b(t(locale, "orders"), "m:orders")], [b(t(locale, "new_order"), "cat")], [b(t(locale, "menu"), "menu")]),
    )


# ── Language ──────────────────────────────────────────────────────────────


@router.callback_query(F.data.startswith("lang:"))
async def cb_lang(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = "ru" if q.data.endswith("ru") else "uz"
    await api.request("POST", "/shop/locale", body={"chatId": q.from_user.id, "locale": locale})
    await state.clear()
    customer = await customer_of(api, q.from_user.id)
    text = "Язык: русский. Каталог, корзина и заказ — на русском." if locale == "ru" else "Til: oʻzbekcha. Katalog, savat va buyurtma oʻzbek tilida."
    await q.message.answer(text, reply_markup=main_menu(locale, customer))


@router.callback_query(F.data.in_({"menu", "m:menu"}))
async def cb_menu(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await state.clear()
    customer = await customer_of(api, q.from_user.id)
    await q.message.answer("🏠", reply_markup=main_menu(locale, customer))


@router.callback_query(F.data == "club")
async def cb_club(q: CallbackQuery, api):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    customer = await customer_of(api, q.from_user.id)
    if not customer:
        return await q.message.answer(t(locale, "not_linked"), reply_markup=contact_kb())
    await q.message.answer(
        f"⭐ <b>{escape(cfg.club_name)}</b>\n{escape(customer.get('name') or '')} · +{escape(customer.get('phone') or '')}",
        reply_markup=main_menu(locale, customer),
    )


@router.callback_query(F.data == "ticket")
async def cb_ticket(q: CallbackQuery, api, state: FSMContext):
    await q.answer()
    locale = await locale_of(api, q.from_user.id)
    await state.set_state(ShopState.ticket)
    await q.message.answer(t(locale, "ticket_ask"), reply_markup=kb([b(t(locale, "back"), "menu")]))


@router.message(ShopState.ticket)
async def on_ticket(m: Message, api, state: FSMContext):
    locale = await locale_of(api, m.from_user.id)
    text = (m.text or "").strip()
    if not text:
        return await m.answer(t(locale, "ticket_ask"))
    try:
        await api.request("POST", f"/customers/{m.from_user.id}/tickets", body={"category": "operator", "text": text[:3000]})
    except BackendError as e:
        return await reply_error(m, locale, e)
    await state.clear()
    await m.answer(t(locale, "ticket_sent"), reply_markup=main_menu(locale))


@router.message(F.location)
async def on_unexpected_location(m: Message, api):
    locale = await locale_of(api, m.from_user.id)
    await m.answer(
        "Lokatsiya faqat manzil bosqichida qabul qilinadi."
        if locale != "ru"
        else "Локация принимается только на шаге адреса."
    )


def shop_router() -> Router:
    return router
