"""Production UI: every answer comes from the GoVita site API (/api/bot).

The bot keeps no customer data. The site owns members, phone links, orders,
tickets and the outbox; this module only renders them and delivers queued
messages. Endpoint contract: src/lib/bot/api.ts in the site repository.
"""
import asyncio
import logging
import time
from html import escape
from urllib.parse import quote

from aiogram import F, Router
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.exceptions import TelegramForbiddenError, TelegramRetryAfter

from .backend import BackendError
from .config import cfg
from .logic import som
from .ui import b, kb, contact_kb, T

router = Router()
log = logging.getLogger("govita.remote")

# One operator message per chat per window: a stuck key or a forwarded
# conversation must not flood the operator group.
TICKET_WINDOW_S = 30
_last_ticket: dict[int, float] = {}


def shop(path=""):
    """The shop inside Telegram (Mini App), opened in the club's language."""
    return f"{cfg.shop_url}/uz{path}"


def menu():
    return kb(
        [b("🛍 Doʻkon", webapp=shop())],
        [b("📦 Buyurtmalarim", "m:orders"), b("⭐ VIP klub", "m:club")],
        [b("🧪 Vitamin testi", webapp=shop("/quiz"))],
        [b("💬 Savol berish", "m:help")],
    )


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
        await m.answer(T['welcome'], reply_markup=menu())
        return await m.answer(T['askContact'], reply_markup=contact_kb())
    if payload.startswith('o_'):
        return await show_order(m, api, m.from_user.id, payload[2:])
    await m.answer(T['menu'], reply_markup=menu())


@router.message(F.contact)
async def contact(m, api):
    if m.contact.user_id != m.from_user.id or m.chat.id != m.from_user.id:
        return await m.answer(T['contactNotOwn'])
    try:
        await api.request('POST', '/contacts', body={'telegramUserId': m.from_user.id,
            'contactUserId': m.contact.user_id, 'chatId': m.chat.id,
            'phone': m.contact.phone_number, 'name': m.from_user.full_name,
            'username': m.from_user.username})
    except BackendError as e:
        if e.status == 409:
            return await m.answer(T['conflict'])
        raise
    from aiogram.types import ReplyKeyboardRemove
    await m.answer('✅ Raqamingiz GoVita klubiga bogʻlandi. Buyurtma holati shu yerga keladi.',
                   reply_markup=ReplyKeyboardRemove())
    await m.answer(T['menu'], reply_markup=menu())


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
    await m.answer('\n'.join(lines), reply_markup=kb([b('💬 Savol berish', 'm:help')], [b('⬅️ Menyu', 'm:menu')]))


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
            return await q.message.answer('Buyurtma topilmadi. Doʻkondan buyurtma bering — holati shu yerga keladi.',
                                          reply_markup=menu())
        await q.message.answer('📦 Buyurtmalarim', reply_markup=kb(*rows, [b('⬅️ Menyu', 'm:menu')]))
    elif data.startswith('ord:'):
        await show_order(q.message, api, chat, data[4:])
    elif data == 'm:help':
        c = await api.request('GET', '/config')
        phone = f"\nOperator: <b>{escape(c['supportPhone'])}</b>" if c.get('supportPhone') else ''
        await q.message.answer(f"Savolingizni bitta xabarda yozing — operatorga yuboramiz.{phone}\n{escape(c.get('supportHours', ''))}")
    elif data == 'm:club':
        try:
            c = await api.request('GET', f'/customers/{chat}')
        except BackendError as e:
            if e.status != 404:
                raise
            return await q.message.answer(T['askContact'], reply_markup=contact_kb())
        await q.message.answer(f"⭐ <b>{escape(cfg.club_name)}</b>\n{escape(c['name'] or '')} · +{escape(c['phone'])}\n\n"
                               "Buyurtma holati, klub takliflari va operator javoblari shu yerga keladi.",
                               reply_markup=menu())
    else:
        await q.message.answer(T['menu'], reply_markup=menu())


@router.message()
async def text(m, api):
    if m.chat.id != m.from_user.id:
        return
    if not m.text or m.text.startswith('/'):
        return await m.answer(T['menu'], reply_markup=menu())
    now = time.monotonic()
    if now - _last_ticket.get(m.chat.id, 0) < TICKET_WINDOW_S:
        return await m.answer('Xabaringiz operatorda. Javobni shu yerga yozamiz.')
    await api.request('POST', f'/customers/{m.from_user.id}/tickets', body={'category': 'operator', 'text': m.text[:3000]})
    _last_ticket[m.chat.id] = now
    await m.answer('✅ Xabaringiz GoVita operatoriga yuborildi. Javob shu yerga keladi.')


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


async def outbox_loop(bot, api):
    while True:
        try:
            batch = await api.request('POST', '/outbox/claim', body={'limit': 10})
            for job in batch['items']:
                receipt = {'leaseToken': job['leaseToken'], 'result': 'sent'}
                try:
                    p = job['payload']
                    markup = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(**button) for button in row] for row in p['buttons']]) if p.get('buttons') else None
                    await bot.send_message(job['chatId'], p['text'], reply_markup=markup)
                except TelegramForbiddenError:
                    receipt['result'] = 'blocked'
                except TelegramRetryAfter as e:
                    receipt.update(result='retry', retryAfter=min(e.retry_after, 86400))
                except Exception as e:
                    # The type only: Telegram errors can echo the request URL, which holds the token.
                    log.warning("job %s not sent: %s", job['id'], type(e).__name__)
                    receipt.update(result='retry', retryAfter=60)
                await api.request('POST', f"/outbox/{job['id']}/receipt", body=receipt)
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            raise
        except Exception as e:
            log.warning("outbox loop: %s", type(e).__name__)
        await asyncio.sleep(5)
