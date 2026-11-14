"""The keyboard that stays under the message field.

Inline buttons scroll away with the conversation; a customer who scrolled
back up a long catalogue had no way to reach the cart or the orders without
typing /start. This keyboard is always there: Katalog, Savat, Buyurtmalarim,
Klub, Yordam and the language. Its presses are handled before any checkout
step, so «🛒 Savat» pressed while the bot waits for a name is a way out, not
a name.
"""
from __future__ import annotations

from html import escape
from urllib.parse import quote

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import KeyboardButton as KB, Message, ReplyKeyboardMarkup as RM

from .backend import BackendError
from .config import cfg
from .ui import b, kb

router = Router()

LABELS = {
    "catalog": ("🛍 Katalog", "🛍 Каталог"),
    "cart": ("🛒 Savat", "🛒 Корзина"),
    "orders": ("📦 Buyurtmalarim", "📦 Мои заказы"),
    "club": ("⭐ Klub", "⭐ Клуб"),
    "help": ("💬 Yordam", "💬 Помощь"),
    "lang": ("🌐 Русский", "🌐 Oʻzbekcha"),
    "share": ("📱 Raqamni ulashish", "📱 Поделиться номером"),
}

#: Every label in both languages → its key; a keyboard from before a language
#: switch still works. «share» is a request_contact button, not a menu
#: action, and is matched by `F.contact` instead — it must stay out of here.
BY_TEXT = {text: key for key, pair in LABELS.items() for text in pair if key != "share"}


def label(locale: str, key: str) -> str:
    return LABELS[key][1 if locale == "ru" else 0]


def reply_kb(locale: str = "ru", *, linked: bool = True) -> RM:
    """The keyboard under the message field — always a full, shop-looking
    bottom bar, never a single stray button.

    A chat that has not shared its phone yet cannot check out or see its own
    orders/club card, so those two keys give way to the one action that
    unlocks them (`request_contact`); catalog, cart, help and the language
    stay exactly where they are. The moment the phone is linked (`on_contact`),
    the caller switches to `linked=True` and the full menu takes over.
    """
    if linked:
        rows = [
            [KB(text=label(locale, "catalog")), KB(text=label(locale, "cart"))],
            [KB(text=label(locale, "orders")), KB(text=label(locale, "club"))],
            [KB(text=label(locale, "help")), KB(text=label(locale, "lang"))],
        ]
    else:
        rows = [
            [KB(text=label(locale, "catalog")), KB(text=label(locale, "cart"))],
            [KB(text=label(locale, "share"), request_contact=True), KB(text=label(locale, "help"))],
            [KB(text=label(locale, "lang"))],
        ]
    return RM(
        keyboard=rows,
        resize_keyboard=True,
        is_persistent=True,
        input_field_placeholder="Mahsulot nomini yozing…" if locale != "ru" else "Напишите название товара…",
    )


def fmt(n) -> str:
    return f"{int(n or 0):,}".replace(",", " ")


def club_text(locale: str, customer: dict, card: dict) -> str:
    ru = locale == "ru"
    phone = str(customer.get("phone") or "")
    masked = f"+{phone[:3]} {phone[3:5]} *** ** {phone[-2:]}" if len(phone) >= 12 else ""
    lines = [f"⭐ <b>{escape(cfg.club_name)}</b>", f"{escape(customer.get('name') or '')} · {masked}".strip(" ·"), ""]
    points = card.get("points")
    if points:
        lines.append(
            (f"💰 Ваши баллы: <b>{fmt(points['balance'])}</b>\nС каждой покупки возвращается {points['earnPercent']}%. "
             f"1 балл = 1 сум, можно оплатить до {points['maxSharePercent']}% заказа.")
            if ru else
            (f"💰 Ballaringiz: <b>{fmt(points['balance'])}</b>\nHar xariddan {points['earnPercent']}% qaytadi. "
             f"1 ball = 1 soʻm, buyurtmaning {points['maxSharePercent']}% gacha toʻlash mumkin.")
        )
        lines.append("")
    ref = card.get("referral")
    if ref:
        if ref.get("code"):
            reward = (
                (f"{fmt(ref['rewardPoints'])} баллов" if ru else f"{fmt(ref['rewardPoints'])} ball")
                if ref.get("reward") == "points"
                else (f"код −{ref['rewardPercent']}%" if ru else f"−{ref['rewardPercent']}% kod")
            )
            lines.append(
                (f"🎁 Код для друга: <code>{escape(ref['code'])}</code>\nДруг получит −{ref['friendPercent']}% на первый заказ, "
                 f"вы — {reward}, когда заказ доставят.")
                if ru else
                (f"🎁 Doʻstingiz uchun kod: <code>{escape(ref['code'])}</code>\nDoʻstingiz birinchi buyurtmasida −{ref['friendPercent']}% oladi, "
                 f"siz — buyurtma yetkazilganda {reward}.")
            )
        else:
            lines.append(
                "🎁 Код для друга появится после доставки вашего первого заказа."
                if ru else "🎁 Doʻstingiz uchun kod birinchi buyurtmangiz yetkazilgandan keyin paydo boʻladi."
            )
        lines.append("")
    lines.append("<b>Что даёт клуб</b>" if ru else "<b>Klub aʼzoligi</b>")
    lines += (
        ["• Статус заказа приходит в этот чат", "• Повтор заказа в одно касание", "• Предложения и акции для участников клуба",
         "• Вход на сайт через Telegram, без пароля"]
        if ru else
        ["• Buyurtma holati shu chatga keladi", "• Bir bosishda qayta buyurtma", "• Klub aʼzolari uchun takliflar va aksiyalar",
         "• Saytga Telegram orqali kirish, parolsiz"]
    )
    return "\n".join(lines)


def club_kb(locale: str, card: dict):
    ru = locale == "ru"
    rows = []
    code = (card.get("referral") or {}).get("code")
    if code:
        share_text = (f"govita: −{card['referral']['friendPercent']}% на первый заказ по моему коду {code}"
                      if ru else f"govita: mening kodim {code} bilan birinchi buyurtmaga −{card['referral']['friendPercent']}%")
        rows.append([b("📤 Поделиться кодом" if ru else "📤 Kodni ulashish",
                       url=f"https://t.me/share/url?url={quote(cfg.shop_url)}&text={quote(share_text)}")])
    cabinet = str(card.get("cabinetUrl") or "")
    if cabinet.startswith("https://"):
        rows.append([b("👤 Кабинет на сайте" if ru else "👤 Saytdagi kabinet", url=cabinet)])
    rows.append([b("📦 Мои заказы" if ru else "📦 Buyurtmalarim", "m:orders")])
    return kb(*rows)


async def send_club(m: Message, api, chat: int, locale: str):
    from .shop import customer_of, t as shop_t

    customer = await customer_of(api, chat)
    if not customer:
        return await m.answer(shop_t(locale, "not_linked"), reply_markup=reply_kb(locale, linked=False))
    try:
        card = await api.request("GET", f"/customers/{chat}/club")
    except BackendError:
        card = {}
    await m.answer(club_text(locale, customer, card), reply_markup=club_kb(locale, card), disable_web_page_preview=True)


def help_text(locale: str) -> str:
    if locale == "ru":
        return (f"💬 <b>Помощь</b>\n\nОператор: <b>{escape(cfg.operator_phone)}</b>\n{escape(cfg.support_hours)}\n\n"
                "Напишите вопрос кнопкой ниже — ответ придёт в этот чат.")
    return (f"💬 <b>Yordam</b>\n\nOperator: <b>{escape(cfg.operator_phone)}</b>\n{escape(cfg.support_hours)}\n\n"
            "Savolingizni pastdagi tugma orqali yozing — javob shu chatga keladi.")


#: Commands in the bot's menu (set_my_commands) answer like the keyboard.
COMMANDS = {"katalog": "catalog", "savat": "cart", "klub": "club", "buyurtmalar": "orders", "yordam": "help"}


@router.message(Command(*COMMANDS))
async def on_command(m: Message, api, state: FSMContext):
    name = (m.text or "").split()[0].lstrip("/").split("@")[0].lower()
    await dispatch(m, api, state, COMMANDS.get(name, "catalog"))


@router.message(F.text.in_(BY_TEXT.keys()))
async def on_menu(m: Message, api, state: FSMContext):
    await dispatch(m, api, state, BY_TEXT[m.text])


async def dispatch(m: Message, api, state: FSMContext, key: str):
    if m.chat.id != m.from_user.id:
        return
    from . import shop
    from .remote import send_orders

    chat = m.from_user.id
    data = await state.get_data()
    await state.clear()
    # A sign-in waiting for the phone survives a menu press.
    if data.get("login_token"):
        await state.update_data(login_token=data["login_token"])
    locale = await shop.locale_of(api, chat)
    if key == "catalog":
        return await shop.send_catalog(m, api, locale)
    if key == "cart":
        return await shop.send_cart(m, api, chat, locale, edit=False)
    if key == "orders":
        return await send_orders(m, api, chat, locale)
    if key == "club":
        return await send_club(m, api, chat, locale)
    if key == "help":
        return await m.answer(help_text(locale), reply_markup=kb([b(shop.t(locale, "operator"), "ticket")]))
    new = "uz" if locale == "ru" else "ru"
    await api.request("POST", "/shop/locale", body={"chatId": chat, "locale": new})
    text = "Язык: русский." if new == "ru" else "Til: oʻzbekcha."
    await m.answer(text, reply_markup=reply_kb(new))
