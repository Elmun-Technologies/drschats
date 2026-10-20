"""Production UI: every answer comes from the GoVita site API (/api/bot).

The bot keeps no customer data. The site owns members, phone links, orders,
tickets and the outbox; this module only renders them and delivers queued
messages. Endpoint contract: src/lib/bot/api.ts in the site repository.
"""
import asyncio
import logging
import re
import time
from html import escape
from urllib.parse import quote

from aiogram import F, Router
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, MenuButtonWebApp, WebAppInfo
from aiogram.exceptions import TelegramBadRequest, TelegramForbiddenError, TelegramRetryAfter

from .backend import BackendError
from .config import cfg
from .logic import som
from . import settings as settings_store
from . import shop as shop_ui
from .ui import b, kb, contact_kb, T

router = Router()
log = logging.getLogger("govita.remote")

#: Telegram's limit for one message. A longer text is split, never truncated.
MAX_MESSAGE_CHARS = 4096
#: Leave room for the closing tag of an HTML entity split at the boundary.
SPLIT_AT = 4000


def _safe_cut(window: str, cut: int) -> int:
    """Move a cut back so it lands between words, not inside a tag or entity.

    The site sends HTML (`<b>`, `<a href=…>`) and `&amp;`-style entities; a
    message split inside either one is invalid markup and Telegram rejects it
    as a whole, so the boundary is pulled back to the last safe point.
    """
    opens = window.rfind("<")
    closes = window.rfind(">")
    if opens > closes:
        cut = min(cut, opens)
    amp = window.rfind("&")
    if amp != -1 and ";" not in window[amp:cut]:
        cut = min(cut, amp)
    return max(1, cut)


TAG = re.compile(r"<(/?)([a-zA-Z]+)[^>]*>")


def _balance(chunk: str, carry: list[str]) -> tuple[str, list[str]]:
    """Close the tags a chunk leaves open and reopen them in the next one.

    A `<b>` opened in one message and closed in the next is broken markup:
    Telegram rejects the whole message. `carry` is the stack passed forward.
    """
    opened = list(carry)
    for closing, name in TAG.findall(chunk):
        if closing:
            if name in opened:
                while opened and opened.pop() != name:
                    pass
        elif name not in ("br",):
            opened.append(name)
    prefix = "".join(f"<{name}>" for name in carry)
    suffix = "".join(f"</{name}>" for name in reversed(opened))
    return prefix + chunk + suffix, opened


def split_text(text: str, limit: int = SPLIT_AT) -> list[str]:
    """Cut a long message where a customer can read it: after a paragraph,
    then a line, then a sentence, and only then mid-word.

    The outbox caps texts at 2000 characters, but an admin's broadcast, a flow
    template and appended promo lines all add up, and Telegram refuses anything
    over 4096 outright. Splitting keeps every word; truncating would quietly
    drop the end of a message.
    """
    parts: list[str] = []
    rest = text.strip()
    if not rest:
        return []
    while len(rest) > limit:
        window = rest[:limit]
        for sep in ("\n\n", "\n", ". ", " "):
            cut = window.rfind(sep)
            if cut >= limit // 2:
                cut = _safe_cut(window, cut + len(sep))
                parts.append(rest[:cut].rstrip())
                rest = rest[cut:].lstrip()
                break
        else:
            cut = _safe_cut(window, limit)
            parts.append(rest[:cut])
            rest = rest[cut:].lstrip()
    if rest:
        parts.append(rest)
    out: list[str] = []
    carry: list[str] = []
    for part in parts:
        balanced, carry = _balance(part, carry)
        out.append(balanced)
    return out

# One operator message per chat per window: a stuck key or a forwarded
# conversation must not flood the operator group.
TICKET_WINDOW_S = 30
_last_ticket: dict[int, float] = {}


async def greeting(api, locale="uz"):
    """The welcome an admin wrote in /admin/bot, in the customer's language.

    Plain text from the admin, so it is escaped before HTML parse mode sees it.
    A config fetch that fails must not block /start: the built-in text is used.
    """
    try:
        config = await api.request('GET', '/config')
    except Exception as e:  # noqa: BLE001 — the greeting is never worth a failed /start
        log.warning('config unavailable, using built-in greeting: %s', type(e).__name__)
        return T['welcome']
    # A /start is also a good moment to pick up the rest of the panel: the
    # address, the phone and the hours are shown in this same conversation.
    settings_store.apply(config or {})
    saved = ((config or {}).get('greeting') or {}).get('ru' if locale == 'ru' else 'uz') or ''
    return escape(saved.strip()) if saved.strip() else T['welcome']


def menu(locale="uz", customer=None):
    """The club's main menu: the Mini App and the native shop side by side."""
    return shop_ui.main_menu(locale, customer)


@router.message(CommandStart())
async def start(m, api):
    if m.chat.id != m.from_user.id:
        return
    payload = (m.text.split(maxsplit=1) + [''])[1]
    # The site drops a malformed source rather than failing; send it as is.
    await api.request('POST', f'/members/{m.from_user.id}/start', body={
        'locale': 'uz', **({'source': payload[2:]} if payload.startswith('s_') else {})})
    try:
        await api.request('GET', f'/customers/{m.from_user.id}')
    except BackendError as e:
        if e.status != 404:
            raise
        await m.answer(await greeting(api), reply_markup=menu())
        return await m.answer(T['askContact'], reply_markup=contact_kb())
    if payload.startswith('o_'):
        return await show_order(m, api, m.from_user.id, payload[2:])
    customer = await shop_ui.customer_of(api, m.from_user.id)
    locale = (customer or {}).get('locale') or 'uz'
    await m.answer(T['menu'], reply_markup=menu(locale, customer))


async def show_order(m, api, chat, code):
    try:
        o = await api.request('GET', f'/customers/{chat}/orders/{quote(code, safe="")}')
    except BackendError as e:
        if e.status == 404:
            return await m.answer('Buyurtma topilmadi.', reply_markup=menu())
        raise
    lines = [f"📦 <b>№{escape(o['code'])}</b> · {escape(o['stage'])}"]
    lines += [f"{escape(i['name'])} × {i['qty']} — {som(i['unitPrice'] * i['qty'])}" for i in o['items']]
    lines += [f"<b>Jami: {som(o['total'])}</b>"]
    address = (o.get('delivery') or {}).get('address')
    if address:
        lines.append(escape(address))
    if o.get('timeline'):
        lines.append('')
        lines += [f"• {escape(t['stage'])}" for t in o['timeline']]
    locale = await shop_ui.locale_of(api, chat)
    again = "🔁 Qayta buyurtma" if locale != "ru" else "🔁 Повторить заказ"
    await m.answer('\n'.join(lines), reply_markup=kb([b(again, f"reorder:{o['code']}")], [b('💬 Savol berish', 'm:help')], [b('⬅️ Menyu', 'm:menu')]))


@router.callback_query()
async def callback(q, api):
    await q.answer()
    chat = q.from_user.id
    if q.message.chat.id != chat:
        return
    data = q.data or ''
    if data == 'm:orders':
        d = await api.request('GET', f'/customers/{chat}/orders', params={'limit': 10})
        rows = [[b(f"№{o['code']} · {o['stage']} · {som(o['total'])}", f"ord:{o['code']}")] for o in d['items']]
        if not rows:
            locale = await shop_ui.locale_of(api, chat)
            return await q.message.answer('Buyurtma topilmadi. Katalogdan buyurtma bering — holati shu yerga keladi.',
                                          reply_markup=menu(locale))
        await q.message.answer('📦 Buyurtmalarim', reply_markup=kb(*rows, [b('⬅️ Menyu', 'm:menu')]))
    elif data.startswith('ord:'):
        await show_order(q.message, api, chat, data[4:])
    elif data.startswith('reorder:'):
        code = data[8:]
        try:
            await api.request('POST', '/shop/reorder', body={'chatId': chat, 'orderNumber': code})
            locale = await shop_ui.locale_of(api, chat)
            await shop_ui.send_cart(q.message, api, chat, locale, edit=False)
        except BackendError as e:
            if e.status == 404:
                await q.message.answer('Buyurtma topilmadi.')
            elif e.status == 409:
                await q.message.answer('Bu buyurtmadagi mahsulotlar hozir sotuvda yoʻq.')
            else:
                await q.message.answer('Qayta buyurtma hozir imkonsiz. Birozdan keyin urinib koʻring.')
    else:
        locale = await shop_ui.locale_of(api, chat)
        customer = await shop_ui.customer_of(api, chat)
        await q.message.answer(T['menu'], reply_markup=menu(locale, customer))


@router.message()
async def text(m, api):
    if m.chat.id != m.from_user.id:
        return
    locale = await shop_ui.locale_of(api, m.from_user.id)
    customer = await shop_ui.customer_of(api, m.from_user.id)
    if not m.text or m.text.startswith('/'):
        return await m.answer(T['menu'], reply_markup=menu(locale, customer))
    if m.text in {'☰ Menyu', 'Menyu'}:
        return await m.answer(T['menu'], reply_markup=menu(locale, customer))
    # A typed product name is a search, not a support ticket: the shop must
    # answer the obvious question first and offer the operator only when the
    # catalogue has nothing.
    try:
        data = await api.request('GET', '/shop/catalog', params={'locale': locale, 'q': m.text.strip()[:60], 'page': 1})
    except BackendError:
        data = {'items': []}
    if data.get('items'):
        return await shop_ui.send_list(m, api, locale, None, 1, m.text.strip()[:60], edit=False)
    now = time.monotonic()
    if now - _last_ticket.get(m.chat.id, 0) < TICKET_WINDOW_S:
        return await m.answer('Xabaringiz operatorda. Javobni shu yerga yozamiz.')
    await api.request('POST', f'/customers/{m.from_user.id}/tickets', body={'category': 'operator', 'text': m.text[:3000]})
    _last_ticket[m.chat.id] = now
    await m.answer('Hech narsa topilmadi. Savolingiz operatorga yuborildi — javob shu yerga keladi.',
                   reply_markup=menu(locale, customer))


@router.errors()
async def errors(event):
    if isinstance(event.exception, BackendError):
        update = event.update
        message = update.message or (update.callback_query.message if update.callback_query else None)
        if message:
            await message.answer('Soʻrov bajarilmadi. Birozdan keyin qayta urinib koʻring.')
        return True
    log.exception("handler failed", exc_info=event.exception)
    return True


async def deliver_job(bot, job: dict) -> dict:
    """Send one queued job and describe the outcome for the site's receipt.

    A long text is split (Telegram refuses over 4096 characters) and the
    buttons stay on the last part. Outcomes: `sent`, `blocked` (the customer
    stopped the bot), `retry` (Telegram's own rate limit, or a transient
    error), and `failed` — a payload Telegram will never accept, recorded with
    its reason instead of being retried eight times.
    """
    receipt = {'leaseToken': job['leaseToken'], 'result': 'sent'}
    try:
        p = job['payload']
        markup = (
            InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(**button) for button in row] for row in p['buttons']])
            if p.get('buttons') else None
        )
        # Buttons belong on the last part, so they follow the end of the text.
        chunks = split_text(p['text']) or ['']
        for i, chunk in enumerate(chunks):
            await bot.send_message(job['chatId'], chunk, reply_markup=markup if i == len(chunks) - 1 else None)
    except TelegramForbiddenError:
        receipt['result'] = 'blocked'
    except TelegramRetryAfter as e:
        receipt.update(result='retry', retryAfter=min(e.retry_after, 86400))
    except TelegramBadRequest as e:
        # Too long, broken markup, chat gone: the same payload can never
        # succeed, so it is recorded now, with the reason.
        log.warning("job %s refused by Telegram: %s", job['id'], str(e.message)[:120])
        receipt.update(result='failed', error='telegram_refused')
    except Exception as e:  # noqa: BLE001 — the type only; Telegram errors can carry the token URL
        log.warning("job %s not sent: %s", job['id'], type(e).__name__)
        receipt.update(result='retry', retryAfter=60)
    return receipt


async def outbox_loop(bot, api):
    while True:
        try:
            # Pick up an admin's change to the shop address, the club name or
            # the support phone within a few minutes, without a restart. The
            # menu button beside the message field lives on Telegram's side,
            # so it is re-set only when the address really changed.
            changed = await settings_store.refresh(api)
            if "shop_url" in changed:
                try:
                    await bot.set_chat_menu_button(menu_button=MenuButtonWebApp(
                        text="Doʻkon", web_app=WebAppInfo(url=f"{cfg.shop_url}/uz")))
                except Exception as e:  # noqa: BLE001 — a stale button is not worth the loop
                    log.warning("menu button not updated: %s", type(e).__name__)
            batch = await api.request('POST', '/outbox/claim', body={'limit': 10})
            for job in batch['items']:
                receipt = await deliver_job(bot, job)
                await api.request('POST', f"/outbox/{job['id']}/receipt", body=receipt)
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            raise
        except Exception as e:
            log.warning("outbox loop: %s", type(e).__name__)
        await asyncio.sleep(5)
