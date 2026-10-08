from datetime import date, datetime
from unittest.mock import AsyncMock

import pytest

from bot import logic as L
from bot import workers as W
from bot.db import DB
from bot.seed import seed_demo


def test_payload():
    assert L.parse_payload("/start login") == ("login", "")
    assert L.parse_payload("/start o_GV-10248") == ("o", "GV-10248")
    assert L.parse_payload("/start sub_12") == ("sub", "12")
    assert L.parse_payload("/start bad$x") is None
    assert L.parse_payload("/start") is None


def test_contact_and_phone():
    assert not L.contact_is_own(1, 2) and not L.contact_is_own(None, 2) and L.contact_is_own(5, 5)
    assert L.canonical_phone("998 90 123-45-67") == "+998901234567"
    assert L.canonical_phone("901234567") == "+998901234567"
    assert L.som(267000) == "267 000 soʻm"


def test_course():
    assert L.course_days(60, 1, 1) == 60
    assert L.course_days(20, 2, 1) == 40
    assert L.course_days(None, 1, 1) is None
    assert L.sub_price(79000, 15) == 67150
    assert L.best_discount(10, 15, 5) == 15


def test_callbacks_short():
    assert L.cb_ok("sub:cxr:1234567890123456789012345:no_effect")


@pytest.fixture
async def db():
    d = await DB(":memory:").open()
    await seed_demo(d)
    await d.run("INSERT INTO customers(tg_id,name,phone,club_joined_at) VALUES(1,'Dilnoza','+998901234567','2026-09-01')")
    yield d
    await d.close()


async def test_conflict(db):
    await db.ensure_customer(2, "X")
    assert await db.link_phone(2, "+998901234567") == "conflict"
    assert (await db.customer(2))["phone"] is None
    assert await db.one("SELECT 1 FROM leads WHERE tag='club-conflict'")


async def test_stage_dedupe_and_course(db):
    bot = AsyncMock()
    assert await W.push_stage(bot, db, "GV-10248", "delivered")
    assert not await W.push_stage(bot, db, "GV-10248", "delivered")
    assert await db.one("SELECT 1 FROM courses WHERE product_id=1")


async def test_reminder_one_per_slot(db):
    bot = AsyncMock()
    await db.run("INSERT INTO reminders(tg_id,product_id,hhmm) VALUES(1,1,'09:00')")
    now = datetime(2026, 10, 10, 9, 0)
    assert await W.tick_reminders(bot, db, now) == 1
    assert await W.tick_reminders(bot, db, now) == 0


async def test_no_course_msg_if_subscribed(db):
    bot = AsyncMock()
    await db.run("INSERT INTO courses(tg_id,product_id,order_code,ends_on) VALUES(1,1,'GV-10248','2026-10-12')")
    await db.run("INSERT INTO subscriptions(tg_id,product_id,interval_days,next_date,next_pct) VALUES(1,1,30,'2026-11-01',15)")
    assert await W.tick_courses(bot, db, datetime(2026, 10, 10, 12)) == 0


async def test_due_subscription_does_not_lose_delivery(db):
    bot = AsyncMock()
    await db.run("INSERT INTO subscriptions(tg_id,product_id,interval_days,next_date,next_pct) VALUES(1,1,30,'2026-10-01',15)")
    await W.tick_subscriptions(bot, db, datetime(2026, 10, 10, 12))
    s = await db.one('SELECT * FROM subscriptions LIMIT 1')
    assert s['next_date'] == '2026-10-01'


def test_backend_refuses_insecure_url():
    from bot.backend import GoVitaBackend
    with pytest.raises(ValueError):
        GoVitaBackend('http://example.com/api/bot', 'test_key')
    with pytest.raises(ValueError):
        GoVitaBackend('https://user:pass@example.com/api/bot', 'test_key')
    with pytest.raises(ValueError):
        GoVitaBackend('https://example.com/api/bot', '')


@pytest.mark.parametrize('path', ['https://other.test', '//other.test', '/../orders', '/orders?token=x'])
async def test_backend_refuses_unsafe_endpoint(path):
    from bot.backend import GoVitaBackend
    api = GoVitaBackend('https://example.com/api/bot', 'govita_test_key')
    with pytest.raises(ValueError):
        await api.request('GET', path)


def test_backend_accepts_govita_service_key():
    from bot.backend import GoVitaBackend
    api = GoVitaBackend('https://example.com/api/bot/', 'govita_test_key')
    assert api.base == 'https://example.com/api/bot'
