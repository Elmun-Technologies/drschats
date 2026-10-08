"""Production UI uses GoVita API; no local customer/order database."""
import asyncio
from html import escape

from aiogram import F, Router
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.exceptions import TelegramForbiddenError, TelegramRetryAfter

from .backend import BackendError
from .ui import b, kb, contact_kb, main_menu, T
from .logic import som

router = Router()


@router.message(CommandStart())
async def start(m, api):
    if m.chat.id != m.from_user.id:
        return
    payload = (m.text.split(maxsplit=1) + [''])[1]
    await api.request('POST', f'/members/{m.from_user.id}/start', body={
        'locale': 'uz', **({'source': payload[2:]} if payload.startswith('s_') else {})})
    try:
        await api.request('GET', f'/customers/{m.from_user.id}')
    except BackendError as e:
        if e.status != 404:
            raise
        return await m.answer(T['askContact'], reply_markup=contact_kb())
    if payload == 'login' or '.' in payload:
        await api.request('POST', f'/customers/{m.from_user.id}/login-code', body={})
    elif payload.startswith('o_'):
        return await show_order(m, api, m.from_user.id, payload[2:])
    await m.answer(T['menu'], reply_markup=main_menu())


@router.message(F.contact)
async def contact(m, api):
    if m.contact.user_id != m.from_user.id or m.chat.id != m.from_user.id:
        return await m.answer(T['contactNotOwn'])
    try:
        await api.request('POST', '/contacts', body={'telegramUserId': m.from_user.id,
            'contactUserId': m.contact.user_id, 'chatId': m.chat.id,
            'phone': m.contact.phone_number, 'name': m.from_user.full_name})
    except BackendError as e:
        if e.status == 409:
            return await m.answer(T['conflict'])
        raise
    await m.answer('✅ Raqamingiz GoVita hisobiga bogʻlandi.', reply_markup=main_menu())


async def show_order(m, api, chat, code):
    from urllib.parse import quote
    o = await api.request('GET', f'/customers/{chat}/orders/{quote(code, safe="")}')
    lines = [f"📦 <b>№{escape(o['code'])}</b> · {escape(o['stage'])}"]
    lines += [f"{escape(i['name'])} × {i['qty']} — {som(i['unitPrice'] * i['qty'])}" for i in o['items']]
    lines += [f"<b>Jami: {som(o['total'])}</b>", escape(o['delivery']['address'])]
    await m.answer('\n'.join(lines), reply_markup=kb([b('💬 Operator', 'm:op')], [b('⬅️ Menyu', 'm:menu')]))


@router.callback_query()
async def callback(q, api):
    await q.answer()
    chat = q.from_user.id
    if q.message.chat.id != chat:
        return
    data = q.data or ''
    if data == 'm:orders':
        d = await api.request('GET', f'/customers/{chat}/orders')
        rows = [[b(f"№{o['code']} · {som(o['total'])}", f"ord:{o['code']}")] for o in d['items']]
        await q.message.answer('📦 Buyurtmalarim' if rows else 'Buyurtma topilmadi.', reply_markup=kb(*rows, [b('⬅️ Menyu', 'm:menu')]))
    elif data.startswith('ord:'):
        await show_order(q.message, api, chat, data[4:])
    elif data == 'm:subs':
        subs = await api.request('GET', f'/customers/{chat}/subscriptions')
        for s in subs:
            await q.message.answer(f"🔁 #{s['id']} · {s['status']} · Har {s['intervalDays']} kun\n{som(s['total'])}",
                reply_markup=kb([b('⏭ Oʻtkazish', f"remote:skip:{s['id']}"), b('⏸ Pauza', f"remote:pause:{s['id']}")],
                                [b('▶️ Davom', f"remote:resume:{s['id']}"), b('✖️ Bekor', f"remote:cancel:{s['id']}")]))
        if not subs:
            await q.message.answer('Obuna topilmadi.')
    elif data.startswith('remote:'):
        _, act, sid = data.split(':')
        bodies = {'skip': {'skipNext': True}, 'pause': {'status': 'paused'}, 'resume': {'status': 'active'}, 'cancel': {'status': 'cancelled'}}
        if act in bodies and sid.isdigit():
            await api.request('PATCH', f'/customers/{chat}/subscriptions/{sid}', body=bodies[act])
            await q.message.answer('✅ Obuna yangilandi.')
    elif data in ('m:op', 'm:help', 'm:consult'):
        await q.message.answer('Savolingizni xabarda yozing — GoVita admin panelidagi operatorga yuboramiz.')
    elif data == 'm:club':
        c = await api.request('GET', f'/customers/{chat}')
        await q.message.answer(f"⭐ VIP klub\n{escape(c['name'])}", reply_markup=main_menu())
    elif data == 'm:menu':
        await q.message.answer(T['menu'], reply_markup=main_menu())
    else:
        await q.message.answer('Bu imkoniyat hali admin backendga ulanmagan.', reply_markup=main_menu())


@router.message()
async def text(m, api):
    if m.chat.id != m.from_user.id:
        return
    if not m.text or m.text.startswith('/'):
        return await m.answer(T['menu'], reply_markup=main_menu())
    await api.request('POST', f'/customers/{m.from_user.id}/tickets', body={'category': 'operator', 'text': m.text[:3000]})
    await m.answer('✅ Xabaringiz GoVita operatoriga yuborildi.')


@router.errors()
async def errors(event):
    if isinstance(event.exception, BackendError):
        message = event.update.message or (event.update.callback_query.message if event.update.callback_query else None)
        if message:
            await message.answer('Soʻrov bajarilmadi. Avval /start bilan raqamingizni ulang yoki keyinroq qayta urinib koʻring.')
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
                except Exception:
                    receipt.update(result='retry', retryAfter=60)
                await api.request('POST', f"/outbox/{job['id']}/receipt", body=receipt)
                await asyncio.sleep(1)
        except Exception:
            # Never log request URLs (Telegram URLs contain the bot token).
            pass
        await asyncio.sleep(5)
