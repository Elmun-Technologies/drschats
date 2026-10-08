"""Standalone admin module mounted by FastAPI, not by the public storefront."""
from datetime import timedelta
from hashlib import sha256
from hmac import compare_digest
from html import escape
from pathlib import Path
import secrets

from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import FileResponse
import jwt
from sqlalchemy import func, select, update

from app.bot_auth import AdminCaller, COOKIE, credential_version
from app.bot_core import club_config, enqueue, order_out
from app.bot_models import BotAdminAttempt, BotConfig, BotJob, BotMember, BotOrderEvent, BotTicket
from app.bot_schemas import ClubConfig, LoginIn, ReplyIn, StageIn
from app.config import get_settings
from app.deps import SessionDep
from app.models import Order, Subscription, TelegramLink, User, utcnow

router = APIRouter(tags=['bot-admin'])
BASE = '/api/v1/admin/bot'


@router.get('/admin/bot', include_in_schema=False)
async def page():
    return FileResponse(Path(__file__).parent.parent / 'static' / 'bot-admin.html',
                        headers={'Cache-Control': 'no-store',
                                 'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'self'",
                                 'X-Content-Type-Options': 'nosniff'})


@router.post(BASE + '/login')
async def login(payload: LoginIn, request: Request, response: Response, session: SessionDep):
    settings = get_settings()
    if not settings.bot_admin_key or not settings.bot_admin_session_secret:
        raise HTTPException(503, 'bot_admin_not_configured')
    origin = request.headers.get('origin')
    from urllib.parse import urlsplit
    if origin and urlsplit(origin).netloc != request.headers.get('host'):
        raise HTTPException(403, 'origin_failed')
    # Ignore spoofable X-Forwarded-For. Reverse-proxy deployments may share a
    # limit; conservative lockout is preferable to trusting attacker headers.
    ip_hash = sha256((request.client.host if request.client else 'unknown').encode()).hexdigest()
    now = utcnow()
    since = now - timedelta(minutes=15)
    await session.execute(__import__('sqlalchemy').delete(BotAdminAttempt).where(BotAdminAttempt.created_at < since))
    attempts = await session.scalar(select(func.count()).select_from(BotAdminAttempt).where(
        BotAdminAttempt.ip_hash == ip_hash, BotAdminAttempt.created_at >= since))
    if attempts >= 5:
        raise HTTPException(429, 'login_rate_limited', headers={'Retry-After': '900'})
    session.add(BotAdminAttempt(ip_hash=ip_hash))
    await session.commit()
    if not compare_digest(payload.password, settings.bot_admin_key):
        raise HTTPException(401, 'invalid_credentials')
    csrf = secrets.token_hex(32)
    token = jwt.encode({'sub': 'bot-admin', 'aud': 'govita-bot-admin', 'iat': now,
                        'exp': now + timedelta(hours=8), 'csrf': csrf,
                        'version': credential_version()}, settings.bot_admin_session_secret, algorithm='HS256')
    response.set_cookie(COOKIE, token, httponly=True, secure=settings.is_production,
                        samesite='strict', max_age=8 * 3600, path='/api/v1/admin/bot')
    response.headers['Cache-Control'] = 'no-store'
    return {'csrf': csrf}


@router.get(BASE + '/session')
async def session_info(admin: AdminCaller):
    return {'csrf': admin['csrf']}


@router.post(BASE + '/logout', status_code=204)
async def logout(response: Response, admin: AdminCaller):
    response.delete_cookie(COOKIE, path='/api/v1/admin/bot')


@router.get(BASE + '/overview')
async def overview(session: SessionDep, admin: AdminCaller):
    async def count(model, *conditions):
        return await session.scalar(select(func.count()).select_from(model).where(*conditions))
    settings = get_settings()
    return {'linkedCustomers': await count(TelegramLink), 'openTickets': await count(BotTicket, BotTicket.status == 'open'),
            'pendingMessages': await count(BotJob, BotJob.status.in_(['pending', 'leased'])),
            'failedMessages': await count(BotJob, BotJob.status.in_(['failed', 'blocked'])),
            'activeSubscriptions': await count(Subscription, Subscription.status == 'active'),
            'mode': settings.telegram_mode, 'botUsername': settings.telegram_bot_username,
            'tokenConfigured': bool(settings.telegram_bot_token), 'serviceConfigured': bool(settings.bot_api_key)}


@router.get(BASE + '/settings')
async def settings_get(session: SessionDep, admin: AdminCaller):
    return await club_config(session)


@router.put(BASE + '/settings')
async def settings_put(payload: ClubConfig, session: SessionDep, admin: AdminCaller):
    row = await session.get(BotConfig, 1)
    if row is None:
        row = BotConfig(id=1)
        session.add(row)
    row.data = payload.model_dump(mode='json')
    await session.commit()
    return payload


@router.get(BASE + '/customers')
async def customers(session: SessionDep, admin: AdminCaller):
    rows = (await session.execute(select(TelegramLink, User).outerjoin(User, User.phone == TelegramLink.phone)
                                  .order_by(TelegramLink.id.desc()).limit(100))).all()
    return {'items': [{'chatId': l.chat_id, 'phone': l.phone, 'name': u.name if u else '',
                       'locale': u.locale if u else 'uz', 'linkedAt': l.linked_at,
                       'marketingTelegram': u.marketing_telegram if u else False} for l, u in rows]}


@router.get(BASE + '/orders')
async def orders(session: SessionDep, admin: AdminCaller):
    rows = await session.scalars(select(Order).order_by(Order.created_at.desc()).limit(100))
    return {'items': [order_out(o) for o in rows]}


@router.patch(BASE + '/orders/{code}/stage')
async def stage(code: str, payload: StageIn, session: SessionDep, admin: AdminCaller):
    row = await session.scalar(select(Order).where(Order.public_id == code).with_for_update())
    if row is None:
        raise HTTPException(404, 'order_not_found')
    old = order_out(row)['stage']
    if old == payload.stage:
        return {'ok': True, 'changed': False}
    transitions = {
        'received': {'confirmed', 'cancelled'},
        'confirmed': {'onway', 'cancelled'},
        'onway': {'delivered', 'failed', 'cancelled'},
        'failed': {'onway', 'cancelled'},
        'delivered': {'returned'},
        'cancelled': set(), 'returned': set(),
    }
    if payload.stage not in transitions.get(old, set()):
        raise HTTPException(409, 'invalid_stage_transition')
    before = row.status
    result = await session.execute(update(Order).where(Order.id == row.id, Order.status == before)
                                   .values(status=payload.stage).execution_options(synchronize_session=False))
    if not result.rowcount:
        raise HTTPException(409, 'order_changed_retry')
    event = BotOrderEvent(order_id=row.id, stage=payload.stage)
    session.add(event)
    await session.flush()
    link = await session.scalar(select(TelegramLink).where(TelegramLink.phone == row.customer_phone))
    if link and (await club_config(session)).enabled:
        texts = {'received': 'qabul qilindi', 'confirmed': 'tasdiqlandi va yigʻilmoqda',
                 'onway': 'yoʻlda', 'delivered': 'yetkazildi. Xaridingiz uchun rahmat!',
                 'failed': 'yetkazib boʻlmadi. Operatorga murojaat qiling',
                 'cancelled': 'bekor qilindi', 'returned': 'qaytarildi'}
        await enqueue(session, link.chat_id, f"📦 Buyurtma <b>№{escape(code)}</b> {texts[payload.stage]}.",
                      kind='order_stage', dedupe_key=f'order-event:{event.id}',
                      buttons=[[{'text': '📦 Batafsil', 'callback_data': f'ord:{code}'}]])
    await session.commit()
    return {'ok': True, 'changed': True}


@router.get(BASE + '/tickets')
async def tickets(session: SessionDep, admin: AdminCaller):
    rows = await session.scalars(select(BotTicket).order_by(BotTicket.id.desc()).limit(100))
    return {'items': [{'id': t.id, 'chatId': t.chat_id, 'category': t.category, 'text': t.text,
                       'status': t.status, 'createdAt': t.created_at} for t in rows]}


@router.post(BASE + '/tickets/{ticket_id}/reply')
async def reply(ticket_id: int, payload: ReplyIn, session: SessionDep, admin: AdminCaller):
    row = await session.get(BotTicket, ticket_id)
    if row is None:
        raise HTTPException(404, 'ticket_not_found')
    # requestId gives safe retries from a browser on a lost response.
    job = await enqueue(session, row.chat_id, f'💬 <b>GoVita operatori</b>\n{escape(payload.text)}',
                        dedupe_key=f'ticket-reply:{ticket_id}:{payload.requestId}')
    row.status = 'answered'
    await session.commit()
    return {'ok': True, 'jobId': job.id}


@router.get(BASE + '/outbox')
async def outbox(session: SessionDep, admin: AdminCaller):
    rows = await session.scalars(select(BotJob).order_by(BotJob.id.desc()).limit(100))
    return {'items': [{'id': j.id, 'chatId': j.chat_id, 'kind': j.kind, 'status': j.status,
                       'attempts': j.attempts, 'createdAt': j.created_at, 'sentAt': j.sent_at} for j in rows]}


@router.post(BASE + '/outbox/{job_id}/retry')
async def retry(job_id: int, session: SessionDep, admin: AdminCaller):
    row = await session.get(BotJob, job_id)
    if not row or row.status not in ('failed', 'blocked'):
        raise HTTPException(409, 'not_retryable')
    member = await session.get(BotMember, row.chat_id)
    if member and member.blocked_at:
        raise HTTPException(409, 'customer_blocked_bot')
    row.status = 'pending'
    row.attempts = 0
    row.due_at = utcnow()
    row.lease_token = None
    row.leased_until = None
    await session.commit()
    return {'ok': True}
