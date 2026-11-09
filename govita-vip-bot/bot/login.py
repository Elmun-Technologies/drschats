"""Signing in to the website through the bot («Telegram orqali kirish»).

The site opens t.me/<bot>?start=login_<token>. The bot asks the customer to
confirm — the message itself is the notice Telegram pops up at the top of
the phone — and reports the answer to the site, which then signs the
waiting browser in. The phone is the one this chat proved by sharing its own
contact; a chat without one is asked for it first and the request resumes.
"""
from __future__ import annotations

import logging
import re
from html import escape

from aiogram import F, Router
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from .backend import BackendError
from .ui import b, kb, contact_kb

router = Router()
log = logging.getLogger("govita.login")

TOKEN = re.compile(r"^[A-Za-z0-9_-]{24,48}$")

T = {
    "confirm": (
        "🔐 <b>govita saytiga kirish</b>\n\n"
        "Saytda Telegram orqali kirish soʻraldi:\n"
        "📱 {phone}\n{device}"
        "\nBu siz boʻlsangiz, «✅ Tasdiqlash» ni bosing.\n"
        "<i>Siz hozir saytda kirishni bosmagan boʻlsangiz — «❌ Bu men emas».</i>",
        "🔐 <b>Вход на сайт govita</b>\n\n"
        "На сайте запрошен вход через Telegram:\n"
        "📱 {phone}\n{device}"
        "\nЕсли это вы, нажмите «✅ Подтвердить».\n"
        "<i>Если вы сейчас не нажимали вход на сайте — «❌ Это не я».</i>",
    ),
    "device": ("💻 {device}\n", "💻 {device}\n"),
    "ok": ("✅ Tasdiqlash", "✅ Подтвердить"),
    "no": ("❌ Bu men emas", "❌ Это не я"),
    "need_contact": (
        "Saytga kirish uchun avval raqamingizni ulashing — pastdagi «📱 Raqamni ulashish» tugmasi. Soʻng tasdiqlash soʻraladi.",
        "Чтобы войти на сайт, сначала поделитесь номером — кнопка «📱 Поделиться номером» внизу. Затем бот попросит подтвердить вход.",
    ),
    "done": (
        "✅ <b>Kirish tasdiqlandi</b>\n\nBrauzerga qayting — sayt oʻzi ochiladi.",
        "✅ <b>Вход подтверждён</b>\n\nВернитесь в браузер — сайт откроется сам.",
    ),
    "toast": ("✅ Tasdiqlandi. Saytga qayting.", "✅ Подтверждено. Вернитесь на сайт."),
    "back": ("🌐 Saytga qaytish", "🌐 Вернуться на сайт"),
    "denied": (
        "Kirish rad etildi. Hisobingiz xavfsiz — hech kim kirmadi.",
        "Вход отклонён. Аккаунт в безопасности — никто не вошёл.",
    ),
    "expired": (
        "Bu kirish havolasi eskirgan. Saytda «Telegram orqali kirish» ni qayta bosing.",
        "Ссылка для входа устарела. Нажмите «Войти через Telegram» на сайте ещё раз.",
    ),
    "already": (
        "Bu kirish allaqachon tasdiqlangan. Brauzerga qayting.",
        "Этот вход уже подтверждён. Вернитесь в браузер.",
    ),
}


def t(locale: str, key: str, **kw) -> str:
    text = T[key][1 if locale == "ru" else 0]
    return text.format(**kw) if kw else text


async def _open(m: Message, api, chat: int, token: str, state: FSMContext | None):
    try:
        r = await api.request("POST", "/login/open", body={"chatId": chat, "token": token})
    except BackendError as e:
        if e.status == 429:
            return await m.answer("⏳ Juda koʻp urinish. Bir daqiqadan keyin qayta urinib koʻring.")
        raise
    locale = r.get("locale") or "uz"
    s = r.get("state")
    if s == "confirm":
        device = t(locale, "device", device=escape(r["device"])) if r.get("device") else ""
        return await m.answer(
            t(locale, "confirm", phone=escape(r.get("phone") or ""), device=device),
            reply_markup=kb([b(t(locale, "ok"), f"lg:ok:{token}")], [b(t(locale, "no"), f"lg:no:{token}")]),
        )
    if s == "need_contact":
        if state is not None:
            await state.update_data(login_token=token)
        return await m.answer(t(locale, "need_contact"), reply_markup=contact_kb())
    if s == "done":
        return await m.answer(t(locale, "already"))
    return await m.answer(t(locale, "expired"))


@router.message(CommandStart(deep_link=True), F.text.regexp(r"^/start login_"))
async def start_login(m: Message, api, state: FSMContext):
    if m.chat.id != m.from_user.id:
        return
    token = m.text.split(maxsplit=1)[1][len("login_"):]
    # The member record is the same one a plain /start writes.
    await api.request("POST", f"/members/{m.from_user.id}/start", body={"locale": "uz", "source": "site-login"})
    if not TOKEN.match(token):
        return await m.answer(t("uz", "expired"))
    await _open(m, api, m.from_user.id, token, state)


async def resume(m: Message, api, token: str):
    """After the contact was shared: show the confirmation that was waiting for it."""
    if TOKEN.match(token or ""):
        await _open(m, api, m.from_user.id, token, None)


@router.callback_query(F.data.startswith("lg:"))
async def on_answer(q: CallbackQuery, api):
    _, verdict, token = (q.data.split(":", 2) + ["", ""])[:3]
    chat = q.from_user.id
    if q.message.chat.id != chat or not TOKEN.match(token):
        return await q.answer()
    from .shop import locale_of  # the shop imports this module

    locale = await locale_of(api, chat)
    if verdict == "no":
        await api.request("POST", "/login/deny", body={"chatId": chat, "token": token})
        await q.answer()
        return await _replace(q, t(locale, "denied"))
    try:
        r = await api.request("POST", "/login/confirm", body={"chatId": chat, "token": token})
    except BackendError as e:
        await q.answer()
        if e.status == 409:
            return await q.message.answer(t(locale, "need_contact"), reply_markup=contact_kb())
        if e.status == 410:
            return await _replace(q, t(locale, "expired"))
        raise
    url = str(r.get("returnUrl") or "")
    # The short notice Telegram shows at the top of the chat.
    await q.answer(t(locale, "toast"))
    markup = kb([b(t(locale, "back"), url=url)]) if url.startswith("https://") else None
    await _replace(q, t(locale, "done"), markup)


async def _replace(q: CallbackQuery, text: str, markup=None):
    """The confirmation message becomes the result, so its buttons cannot be pressed twice."""
    try:
        await q.message.edit_text(text, reply_markup=markup)
    except Exception:  # noqa: BLE001 — an old or already edited message: say it anew
        await q.message.answer(text, reply_markup=markup)
