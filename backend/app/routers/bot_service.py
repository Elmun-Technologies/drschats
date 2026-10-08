"""Private bot-service API. Every customer resource is resolved from verified chat identity."""
from datetime import timedelta
import secrets

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import and_, or_, select, update

from app.bot_auth import BotCaller
from app.bot_core import club_config, linked_user, link_contact, login_code, order_out
from app.bot_models import BotJob, BotMember, BotTicket
from app.bot_schemas import ClaimIn, ContactIn, MemberIn, ReceiptIn, TicketIn
from app.deps import SessionDep
from app.models import Order, Subscription, utcnow
from app.otp import as_utc
from app.routers.subscriptions import my_subscriptions, update_subscription
from app.schemas import SubscriptionUpdate

router = APIRouter(prefix='/api/v1/bot', tags=['bot-service'], dependencies=[])


@router.get('/config')
async def config(session: SessionDep, _: BotCaller):
    return await club_config(session)


@router.post('/contacts')
async def contact(payload: ContactIn, session: SessionDep, _: BotCaller):
    user = await link_contact(session, payload)
    return {'id': user.id, 'phone': user.phone, 'name': user.name, 'locale': user.locale}


@router.post('/members/{chat_id}/start')
async def start(chat_id: int, payload: MemberIn, session: SessionDep, _: BotCaller):
    if chat_id <= 0:
        raise HTTPException(422, 'private_chat_required')
    member = await session.get(BotMember, chat_id)
    if member is None:
        member = BotMember(chat_id=chat_id, locale=payload.locale, source=payload.source)
        session.add(member)
    else:
        member.blocked_at = None
        member.locale = payload.locale
        if not member.source:
            member.source = payload.source
    await session.commit()
    return {'ok': True}


@router.get('/customers/{chat_id}')
async def customer(chat_id: int, session: SessionDep, _: BotCaller):
    user = await linked_user(session, chat_id)
    member = await session.get(BotMember, chat_id)
    return {'id': user.id, 'name': user.name, 'phone': user.phone, 'locale': member.locale if member else user.locale,
            'marketingTelegram': user.marketing_telegram}


@router.post('/customers/{chat_id}/login-code')
async def code(chat_id: int, session: SessionDep, _: BotCaller):
    return await login_code(session, chat_id)


@router.get('/customers/{chat_id}/orders')
async def orders(chat_id: int, session: SessionDep, _: BotCaller,
                 limit: int = Query(5, ge=1, le=50)):
    user = await linked_user(session, chat_id)
    rows = await session.scalars(select(Order).where(
        Order.customer_phone == user.phone).order_by(Order.created_at.desc()).limit(limit))
    return {'items': [order_out(o) for o in rows]}


@router.get('/customers/{chat_id}/orders/{code}')
async def order(chat_id: int, code: str, session: SessionDep, _: BotCaller):
    user = await linked_user(session, chat_id)
    o = await session.scalar(select(Order).where(Order.public_id == code, Order.customer_phone == user.phone))
    if o is None:
        raise HTTPException(404, 'order_not_found')
    from app.bot_models import BotOrderEvent
    events = await session.scalars(select(BotOrderEvent).where(BotOrderEvent.order_id == o.id)
                                   .order_by(BotOrderEvent.created_at))
    return {**order_out(o), 'timeline': [{'stage': e.stage, 'at': e.created_at} for e in events]}


@router.get('/customers/{chat_id}/subscriptions')
async def subscriptions(chat_id: int, session: SessionDep, _: BotCaller):
    return await my_subscriptions(session, await linked_user(session, chat_id))


@router.patch('/customers/{chat_id}/subscriptions/{subscription_id}')
async def subscription(chat_id: int, subscription_id: int, payload: SubscriptionUpdate,
                       session: SessionDep, _: BotCaller):
    return await update_subscription(subscription_id, payload, session, await linked_user(session, chat_id))


@router.post('/customers/{chat_id}/tickets', status_code=201)
async def ticket(chat_id: int, payload: TicketIn, session: SessionDep, _: BotCaller):
    if await session.get(BotMember, chat_id) is None:
        raise HTTPException(404, 'member_not_found')
    row = BotTicket(chat_id=chat_id, category=payload.category, text=payload.text)
    session.add(row)
    await session.commit()
    return {'id': row.id, 'status': row.status}


@router.post('/outbox/claim')
async def claim(payload: ClaimIn, session: SessionDep, _: BotCaller):
    now = utcnow()
    # Conditional UPDATE is the claim arbiter even when two SQLite readers
    # select the same row. PostgreSQL also locks candidate rows SKIP LOCKED.
    await session.execute(update(BotJob).where(
        BotJob.status == 'leased', BotJob.leased_until <= now, BotJob.attempts >= 8).values(
        status='failed', lease_token=None, leased_until=None))
    eligible = and_(BotJob.due_at <= now, BotJob.attempts < 8,
                    or_(BotJob.status == 'pending', and_(BotJob.status == 'leased', BotJob.leased_until <= now)))
    rows = list(await session.scalars(select(BotJob).where(eligible).order_by(BotJob.id)
                                     .limit(payload.limit).with_for_update(skip_locked=True)))
    jobs = []
    for row in rows:
        member = await session.get(BotMember, row.chat_id)
        if member and member.blocked_at:
            await session.execute(update(BotJob).where(BotJob.id == row.id, eligible).values(status='blocked'))
            continue
        token = secrets.token_hex(32)
        result = await session.execute(update(BotJob).where(BotJob.id == row.id, eligible).values(
            status='leased', lease_token=token, leased_until=now + timedelta(minutes=3),
            attempts=BotJob.attempts + 1).execution_options(synchronize_session=False))
        if result.rowcount:
            jobs.append({'id': row.id, 'chatId': row.chat_id, 'kind': row.kind,
                         'payload': row.payload, 'leaseToken': token})
    await session.commit()
    return {'items': jobs}


@router.post('/outbox/{job_id}/receipt')
async def receipt(job_id: int, payload: ReceiptIn, session: SessionDep, _: BotCaller):
    row = await session.get(BotJob, job_id)
    if not row or row.status != 'leased' or not row.lease_token or not secrets.compare_digest(row.lease_token, payload.leaseToken):
        raise HTTPException(409, 'invalid_lease')
    if row.leased_until is None or as_utc(row.leased_until) <= utcnow():
        raise HTTPException(409, 'expired_lease')
    now = utcnow()
    values = {'status': {'sent': 'sent', 'retry': 'pending', 'blocked': 'blocked'}[payload.result],
              'lease_token': None, 'leased_until': None}
    if payload.result == 'sent':
        values['sent_at'] = now
    elif payload.result == 'retry':
        values['due_at'] = now + timedelta(seconds=payload.retryAfter)
        if row.attempts >= 8:
            values['status'] = 'failed'
    result = await session.execute(update(BotJob).where(
        BotJob.id == job_id, BotJob.status == 'leased', BotJob.lease_token == payload.leaseToken,
        BotJob.leased_until > now).values(**values).execution_options(synchronize_session=False))
    if not result.rowcount:
        raise HTTPException(409, 'invalid_lease')
    if payload.result == 'blocked':
        member = await session.get(BotMember, row.chat_id)
        if member is None:
            member = BotMember(chat_id=row.chat_id)
            session.add(member)
        member.blocked_at = now
    await session.commit()
    return {'ok': True}
