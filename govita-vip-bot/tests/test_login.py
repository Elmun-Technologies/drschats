"""Website sign-in through the bot, the persistent keyboard and the club card."""
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from bot import login, reply_menu, shop
from bot.backend import BackendError

CHAT = 7
TOKEN = "a" * 32


class Api:
    def __init__(self, routes):
        self.routes = routes
        self.calls = []

    async def request(self, method, path, *, body=None, params=None):
        self.calls.append((method, path, body))
        result = self.routes.get(path)
        if result is None:
            raise AssertionError(f"unexpected {method} {path}")
        result = result(body) if callable(result) else result
        if isinstance(result, Exception):
            raise result
        return result


class State:
    def __init__(self, data=None):
        self.data = dict(data or {})

    async def get_data(self):
        return dict(self.data)

    async def update_data(self, **kw):
        self.data.update(kw)

    async def set_data(self, data):
        self.data = dict(data)

    async def clear(self):
        self.data = {}

    async def set_state(self, state):
        pass


def message(text):
    return SimpleNamespace(
        chat=SimpleNamespace(id=CHAT),
        from_user=SimpleNamespace(id=CHAT, full_name="Ali Valiyev", username="ali"),
        text=text,
        answer=AsyncMock(),
    )


def callback(data):
    msg = SimpleNamespace(answer=AsyncMock(), edit_text=AsyncMock(), chat=SimpleNamespace(id=CHAT))
    return SimpleNamespace(data=data, from_user=SimpleNamespace(id=CHAT), message=msg, answer=AsyncMock())


def buttons(markup):
    return [btn for row in markup.inline_keyboard for btn in row]


@pytest.mark.asyncio
async def test_login_link_asks_to_confirm_with_the_masked_phone():
    api = Api({
        f"/members/{CHAT}/start": {"ok": True},
        "/login/open": {"state": "confirm", "phone": "+998 90 *** ** 67", "device": "Chrome, Windows", "locale": "uz"},
    })
    m = message(f"/start login_{TOKEN}")
    await login.start_login(m, api, State())
    text = m.answer.await_args.args[0]
    assert "+998 90 *** ** 67" in text and "Chrome, Windows" in text
    datas = [btn.callback_data for btn in buttons(m.answer.await_args.kwargs["reply_markup"])]
    assert datas == [f"lg:ok:{TOKEN}", f"lg:no:{TOKEN}"]
    assert all(len(d.encode()) <= 64 for d in datas)
    assert api.calls[1] == ("POST", "/login/open", {"chatId": CHAT, "token": TOKEN})


@pytest.mark.asyncio
async def test_unlinked_chat_shares_its_contact_then_confirms():
    api = Api({
        f"/members/{CHAT}/start": {"ok": True},
        "/login/open": {"state": "need_contact", "locale": "uz"},
    })
    st = State()
    m = message(f"/start login_{TOKEN}")
    await login.start_login(m, api, st)
    assert st.data["login_token"] == TOKEN
    assert m.answer.await_args.kwargs["reply_markup"].keyboard[0][0].request_contact

    # The contact arrives: the number is linked and the waiting sign-in resumes.
    api.routes.update({
        "/shop/locale": {"locale": "uz"},
        "/contacts": {"phone": "998901234567", "name": "Ali", "locale": "uz"},
        "/login/open": {"state": "confirm", "phone": "+998 90 *** ** 67", "device": "", "locale": "uz"},
    })
    contact = SimpleNamespace(user_id=CHAT, phone_number="+998901234567")
    cm = SimpleNamespace(**{**vars(message(None)), "contact": contact})
    await shop.on_contact(cm, api, st)
    texts = [c.args[0] for c in cm.answer.await_args_list]
    assert "Raqamingiz ulandi" in texts[0]
    assert "Tasdiqlash" in texts[-1]
    assert not st.data.get("login_token")


@pytest.mark.asyncio
async def test_confirm_shows_a_notice_and_a_way_back():
    api = Api({"/shop/locale": {"locale": "uz"}, "/login/confirm": {"ok": True, "returnUrl": "https://govita.uz/uz/account"}})
    q = callback(f"lg:ok:{TOKEN}")
    await login.on_answer(q, api)
    assert "Tasdiqlandi" in q.answer.await_args.args[0]
    text = q.message.edit_text.await_args.args[0]
    assert "Kirish tasdiqlandi" in text
    assert buttons(q.message.edit_text.await_args.kwargs["reply_markup"])[0].url == "https://govita.uz/uz/account"


@pytest.mark.asyncio
async def test_deny_and_expired():
    api = Api({"/shop/locale": {"locale": "ru"}, "/login/deny": {"ok": True}})
    q = callback(f"lg:no:{TOKEN}")
    await login.on_answer(q, api)
    assert "Вход отклонён" in q.message.edit_text.await_args.args[0]

    api = Api({"/shop/locale": {"locale": "uz"}, "/login/confirm": BackendError(410, "expired")})
    q = callback(f"lg:ok:{TOKEN}")
    await login.on_answer(q, api)
    assert "eskirgan" in q.message.edit_text.await_args.args[0]

    m = message("/start login_bad!")
    api = Api({f"/members/{CHAT}/start": {"ok": True}})
    await login.start_login(m, api, State())
    # A malformed link is answered before the member's language is known: Russian, the default.
    assert "устарела" in m.answer.await_args.args[0]


@pytest.mark.asyncio
async def test_keyboard_press_leaves_a_checkout_step():
    api = Api({"/shop/locale": {"locale": "uz"}, "/shop/categories": {"categories": [{"slug": "vitamins", "name": "Vitaminlar", "count": 3}]}})
    st = State({"name": "half-typed", "order_key": "k"})
    m = message("🛍 Katalog")
    await reply_menu.on_menu(m, api, st)
    assert st.data == {}
    assert "Kategoriyani tanlang" in m.answer.await_args.args[0]
    kb = reply_menu.reply_kb("uz")
    assert kb.is_persistent and len([b for row in kb.keyboard for b in row]) == 6


@pytest.mark.asyncio
async def test_club_card_shows_points_and_referral_code():
    api = Api({
        f"/customers/{CHAT}": {"id": CHAT, "name": "Ali", "phone": "998901234567", "locale": "uz"},
        f"/customers/{CHAT}/club": {
            "points": {"balance": 12300, "earnPercent": 3, "maxSharePercent": 30},
            "referral": {"code": "GVABC123", "friendPercent": 10, "reward": "points", "rewardPoints": 20000, "rewardPercent": 10},
            "cabinetUrl": "https://govita.uz/uz/account",
        },
    })
    m = message(None)
    await reply_menu.send_club(m, api, CHAT, "uz")
    text = m.answer.await_args.args[0]
    assert "12 300" in text and "GVABC123" in text and "20 000 ball" in text
    urls = [btn.url for btn in buttons(m.answer.await_args.kwargs["reply_markup"]) if btn.url]
    assert any(u.startswith("https://t.me/share/url") for u in urls)
    assert "https://govita.uz/uz/account" in urls


@pytest.mark.asyncio
async def test_club_card_without_programmes_claims_nothing_extra():
    api = Api({
        f"/customers/{CHAT}": {"id": CHAT, "name": "Ali", "phone": "998901234567", "locale": "ru"},
        f"/customers/{CHAT}/club": {"points": None, "referral": None, "cabinetUrl": "https://govita.uz/ru/account"},
    })
    m = message(None)
    await reply_menu.send_club(m, api, CHAT, "ru")
    text = m.answer.await_args.args[0]
    assert "балл" not in text.split("Что даёт клуб")[0]
    assert "Статус заказа" in text
