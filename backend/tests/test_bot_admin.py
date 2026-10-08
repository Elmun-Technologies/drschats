import pytest
from sqlalchemy import select

from app.config import get_settings
from app.bot_models import BotJob

pytestmark = pytest.mark.asyncio
BASE='/api/v1/admin/bot'
BOT='/api/v1/bot'


@pytest.fixture(autouse=True)
def configured(monkeypatch):
    s=get_settings()
    monkeypatch.setattr(s,'bot_admin_key','test-admin-password')
    monkeypatch.setattr(s,'bot_admin_session_secret','test-session-secret')
    monkeypatch.setattr(s,'bot_api_key','test-bot-service')


@pytest.fixture
def bot_headers():
    return {'Authorization':'Bearer test-bot-service'}


async def login(client):
    r=await client.post(BASE+'/login',json={'password':'test-admin-password'})
    assert r.status_code==200,r.text
    assert 'HttpOnly' in r.headers['set-cookie']
    return {'X-CSRF-Token':r.json()['csrf']}


async def test_admin_lock_and_csrf(client):
    assert (await client.get(BASE+'/customers')).status_code==401
    h=await login(client)
    assert (await client.put(BASE+'/settings',json={'clubName':'X'})).status_code==403
    assert (await client.put(BASE+'/settings',headers=h,json={'clubName':'X','timezone':'bad'})).status_code==422
    assert (await client.put(BASE+'/settings',headers=h,json={'clubName':'X'})).status_code==200
    assert (await client.get(BASE+'/settings')).json()['clubName']=='X'
    # bot key cannot access admin, cookies cannot substitute bot key
    assert (await client.get(BOT+'/config')).status_code==401


async def contact(client,h,chat=111,phone='998901234567'):
    return await client.post(BOT+'/contacts',headers=h,json={'telegramUserId':chat,'contactUserId':chat,'chatId':chat,'phone':phone,'name':'Aziz'})


async def test_contact_and_order_ownership(client,bot_headers,order_payload):
    assert (await contact(client,bot_headers)).status_code==200
    assert (await contact(client,bot_headers,222)).status_code==409
    assert (await contact(client,bot_headers,222,'998911234567')).status_code==200
    res=await client.post('/api/v1/orders',json=order_payload)
    code=res.json()['orderId']
    assert (await client.get(BOT+f'/customers/111/orders/{code}',headers=bot_headers)).status_code==200
    assert (await client.get(BOT+f'/customers/222/orders/{code}',headers=bot_headers)).status_code==404


async def test_stage_queue_dedupe_and_receipt(client,bot_headers,order_payload,db):
    await contact(client,bot_headers)
    code=(await client.post('/api/v1/orders',json=order_payload)).json()['orderId']
    h=await login(client)
    url=BASE+f'/orders/{code}/stage'
    assert (await client.patch(url,headers=h,json={'stage':'confirmed'})).json()['changed']
    assert not (await client.patch(url,headers=h,json={'stage':'confirmed'})).json()['changed']
    assert (await client.patch(url,headers=h,json={'stage':'received'})).status_code==409
    batch=(await client.post(BOT+'/outbox/claim',headers=bot_headers,json={})).json()['items']
    assert len(batch)==1
    assert not (await client.post(BOT+'/outbox/claim',headers=bot_headers,json={})).json()['items']
    job=batch[0]
    path=BOT+f"/outbox/{job['id']}/receipt"
    assert (await client.post(path,headers=bot_headers,json={'leaseToken':'x'*32,'result':'sent'})).status_code==409
    assert (await client.post(path,headers=bot_headers,json={'leaseToken':job['leaseToken'],'result':'sent'})).status_code==200
    assert (await db.get(BotJob,job['id'])).status=='sent'


async def test_ticket_reply_idempotent_escaped(client,bot_headers):
    await client.post(BOT+'/members/111/start',headers=bot_headers,json={})
    t=(await client.post(BOT+'/customers/111/tickets',headers=bot_headers,json={'text':'Help'})).json()
    h=await login(client)
    p=BASE+f"/tickets/{t['id']}/reply"
    payload={'text':'<script>bad</script>','requestId':'unique-request-123'}
    a=await client.post(p,headers=h,json=payload)
    b=await client.post(p,headers=h,json=payload)
    assert a.json()['jobId']==b.json()['jobId']
    job=(await client.post(BOT+'/outbox/claim',headers=bot_headers,json={})).json()['items'][0]
    assert '&lt;script&gt;' in job['payload']['text']


async def test_login_rate_limit(client):
    for i in range(5):
        assert (await client.post(BASE+'/login',json={'password':'wrong'})).status_code==401
    assert (await client.post(BASE+'/login',json={'password':'wrong'})).status_code==429
