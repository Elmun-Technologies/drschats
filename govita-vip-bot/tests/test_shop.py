"""The native shop inside the bot: catalogue, cart and step-by-step checkout.

The API is faked at the transport boundary, so these tests describe exactly
what the site is asked for and what the customer sees when it answers.
"""
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from bot import shop
from bot.backend import BackendError

CHAT = 7

PRODUCT = {
    "id": "p-delical-vanil",
    "slug": "delical-vanil-200ml",
    "name": "Delical vanil 200 ml",
    "tagline": "Ichimlik koʻrinishidagi toʻyimli ovqat",
    "price": 118000,
    "oldPrice": 129000,
    "inStock": True,
    "stockLeft": 3,
    "image": "https://govita.uz/p/delical.png",
    "unit": "1 kapsula",
}

CART = {
    "locale": "uz",
    "lines": [{**PRODUCT, "qty": 2, "lineTotal": 236000, "qtyCap": 5}],
    "issues": [],
    "totals": {
        "subtotal": 236000,
        "discount": 0,
        "shipping": 0,
        "total": 236000,
        "itemCount": 2,
        "freeShippingRemaining": 64000,
        "freeShippingThreshold": 300000,
    },
    "promo": {"code": None, "ok": False},
    "firstOrder": {"state": "off", "percent": 0, "amount": 0},
    "adjustment": None,
}


class Api:
    def __init__(self, handler):
        self.handler = handler
        self.calls = []

    async def request(self, method, path, *, body=None, params=None):
        self.calls.append((method, path, body, params))
        result = self.handler(method, path, body, params)
        if callable(result):
            result = result()
        if isinstance(result, Exception):
            raise result
        return result

    def paths(self):
        return [(m, p) for m, p, _, _ in self.calls]


class State:
    def __init__(self, data=None):
        self.data = dict(data or {})
        self.current = None

    async def get_data(self):
        return dict(self.data)

    async def update_data(self, **kw):
        self.data.update(kw)

    async def set_data(self, data):
        self.data = dict(data)

    async def clear(self):
        self.data = {}
        self.current = None

    async def set_state(self, state):
        self.current = state


def message(text=None, contact=None, location=None):
    return SimpleNamespace(
        chat=SimpleNamespace(id=CHAT),
        from_user=SimpleNamespace(id=CHAT, full_name="Ali Valiyev", username="ali"),
        text=text,
        contact=contact,
        location=location,
        answer=AsyncMock(),
        answer_photo=AsyncMock(),
    )


def callback(data):
    msg = SimpleNamespace(answer=AsyncMock(), edit_text=AsyncMock(), chat=SimpleNamespace(id=CHAT))
    return SimpleNamespace(data=data, from_user=SimpleNamespace(id=CHAT), message=msg, answer=AsyncMock())


def all_buttons(markup):
    if markup is None:
        return []
    return [button for row in markup.inline_keyboard for button in row]


def assert_callbacks_fit(*markups):
    for markup in markups:
        for button in all_buttons(markup):
            if button.callback_data:
                assert len(button.callback_data.encode()) <= 64, button.callback_data


def customer(method, path, body=None, params=None):
    assert path == f"/customers/{CHAT}"
    return {"id": CHAT, "name": "Ali Valiyev", "phone": "998901234567", "locale": "uz"}


def linked_api(extra=None):
    extra = extra or {}

    def handler(method, path, body, params):
        if path in extra:
            return extra[path](method, path, body, params) if callable(extra[path]) else extra[path]
        if path == "/shop/locale":
            return {"locale": "uz"}
        if path == f"/customers/{CHAT}":
            return customer(method, path, body, params)
        if path == "/shop/cart":
            return CART
        raise AssertionError(f"unexpected {method} {path} {body}")

    return Api(handler)


@pytest.mark.asyncio
async def test_catalogue_lists_real_products_and_fits_telegram_limits():
    api = Api(lambda m, p, b, q: {
        "/shop/categories": {"categories": [
            {"slug": "vitamins", "name": "Vitaminlar", "count": 4},
            {"slug": "clinical-nutrition", "name": "Klinik ovqatlanish", "count": 2},
        ]},
        "/shop/catalog": {"locale": "uz", "categories": [], "items": [PRODUCT], "total": 1, "page": 1, "pages": 1},
    }[p])
    st = State()
    m = message()
    await shop.send_catalog(m, api, "uz")
    assert "Kategoriyani tanlang" in m.answer.await_args.args[0]
    assert_callbacks_fit(m.answer.await_args.kwargs["reply_markup"])

    await shop.send_list(m, api, "uz", "vitamins", 1, edit=False)
    buttons = all_buttons(m.answer.await_args.kwargs["reply_markup"])
    assert any("118 000 soʻm" in btn.text for btn in buttons)
    assert_callbacks_fit(m.answer.await_args.kwargs["reply_markup"])
    assert api.calls[-1][3]["category"] == "vitamins"


@pytest.mark.asyncio
async def test_product_card_shows_the_real_old_price_stock_and_bad_warning():
    api = Api(lambda m, p, b, q: {"product": PRODUCT})
    m = message()
    await shop.send_product(m, api, "uz", PRODUCT["slug"])
    caption = m.answer_photo.await_args.kwargs["caption"]
    assert "<s>129 000 soʻm</s>" in caption
    assert "Faqat 3 ta qoldi" in caption
    assert "Biologik faol qoʻshimcha. Dori vositasi emas" in caption
    assert_callbacks_fit(m.answer_photo.await_args.kwargs["reply_markup"])


@pytest.mark.asyncio
async def test_out_of_stock_product_has_no_add_button():
    api = Api(lambda m, p, b, q: {"product": {**PRODUCT, "inStock": False, "stockLeft": 0}})
    m = message()
    await shop.send_product(m, api, "uz", PRODUCT["slug"])
    markup = m.answer_photo.await_args.kwargs["reply_markup"]
    assert not any(btn.callback_data and btn.callback_data.startswith("add:") for btn in all_buttons(markup))
    assert "Sotuvda yoʻq" in m.answer_photo.await_args.kwargs["caption"]


@pytest.mark.asyncio
async def test_add_to_cart_reports_the_new_item_count():
    def handler(method, path, body, params):
        if path == "/shop/cart/add":
            assert body == {"chatId": CHAT, "slug": PRODUCT["slug"], "qty": 1}
            return CART
        if path == "/shop/locale":
            return {"locale": "uz"}
        if path == "/shop/cart":
            return CART
        raise AssertionError(path)

    api = Api(handler)
    q = callback("add:" + PRODUCT["slug"])
    await shop.cb_add(q, api, State())
    assert "Savatga qoʻshildi" in q.answer.await_args.args[0]
    assert any("Savat" in btn.text for btn in all_buttons(q.message.answer.await_args.kwargs["reply_markup"]))


@pytest.mark.asyncio
async def test_cart_buttons_and_totals_come_from_the_server_quote():
    api = linked_api()
    m = message()
    await shop.send_cart(m, api, CHAT, "uz", edit=False)
    text = m.answer.await_args.args[0]
    assert "236 000 soʻm" in text
    assert "Bepul yetkazishgacha 64 000 soʻm" in text
    assert_callbacks_fit(m.answer.await_args.kwargs["reply_markup"])


@pytest.mark.asyncio
async def test_invalid_promo_is_explained_and_removed_from_the_cart():
    def handler(method, path, body, params):
        if path == "/shop/locale":
            return {"locale": "uz"}
        if path == "/shop/promo" and body and body.get("code"):
            return {**CART, "promo": {"code": "OLD", "ok": False, "reason": "expired"}}
        if path == "/shop/promo":
            return CART
        if path == "/shop/cart":
            return CART
        raise AssertionError(path)

    api = Api(handler)
    m = message(text="OLD")
    st = State({"name": "Ali", "phone": "998901234567", "promo_after": "cart"})
    await shop.on_promo(m, api, st)
    texts = [c.args[0] for c in m.answer.await_args_list]
    assert any("Promokod yaroqsiz" in t for t in texts)
    assert any("Kod muddati tugagan" in t for t in texts)
    clears = [c for c in api.calls if c[0] == "POST" and c[1] == "/shop/promo" and c[2]["code"] == ""]
    assert len(clears) == 1


@pytest.mark.asyncio
async def test_checkout_is_stepwise_and_confirm_is_idempotent():
    state = State()

    def handler(method, path, body, params):
        if path == "/shop/locale":
            return {"locale": "uz"}
        if path == f"/customers/{CHAT}":
            return customer(method, path, body, params)
        if path == "/shop/cart":
            return CART
        if path == "/shop/quote":
            return CART
        if path == "/shop/order":
            return {"ok": True, "orderId": "GV-000123", "total": 236000, "alreadyCreated": False}
        raise AssertionError(f"{method} {path}")

    api = Api(handler)

    await shop.begin_checkout(message(), api, CHAT, "uz", state)
    assert state.current is shop.ShopState.name

    m = message(text="Ali Valiyev")
    await shop.on_name(m, api, state)
    assert "998901234567" in m.answer.await_args.args[0]

    q = callback("co:method")
    await shop.cb_method(q, api, state)
    assert "Yetkazish usulini tanlang" in q.message.answer.await_args.args[0]

    q = callback("co:courier")
    await shop.cb_courier(q, api, state)
    assert all(len(btn.callback_data.encode()) <= 64 for btn in all_buttons(q.message.answer.await_args.kwargs["reply_markup"]))

    q = callback("co:region:0")
    await shop.cb_region(q, api, state)
    assert state.current is shop.ShopState.address

    m = message(text="Yunusobod, Amir Temur 12")
    await shop.on_address(m, api, state)
    assert state.current is shop.ShopState.note

    m = message(text="Domofon 12")
    await shop.on_note(m, api, state)
    assert state.current is shop.ShopState.promo

    q = callback("promo:skip")
    await shop.cb_promo_skip(q, api, state)
    summary = q.message.answer.await_args.args[0]
    assert "Buyurtmani tekshiring" in summary and "236 000 soʻm" in summary
    key = state.data["order_key"]
    assert key

    q = callback("co:confirm")
    await shop.cb_confirm(q, api, state)
    order_calls = [c for c in api.calls if c[1] == "/shop/order"]
    assert len(order_calls) == 1
    assert order_calls[0][2]["idempotencyKey"] == key
    assert order_calls[0][2]["name"] == "Ali Valiyev"
    assert "GV-000123" in q.message.answer.await_args.args[0]

    # A second tap, or a retry after a timeout, must not create another order.
    q2 = callback("co:confirm")
    await shop.cb_confirm(q2, api, state)
    assert len([c for c in api.calls if c[1] == "/shop/order"]) == 1
    assert "allaqachon" in q2.message.answer.await_args.args[0]


@pytest.mark.asyncio
async def test_checkout_reports_out_of_stock_without_losing_the_cart():
    state = State({
        "name": "Ali", "phone": "998901234567", "method": "courier",
        "region": "Toshkent shahri", "address": "Amir Temur 12", "order_key": "k" * 16,
    })

    def handler(method, path, body, params):
        if path == "/shop/locale":
            return {"locale": "uz"}
        if path == "/shop/order":
            raise BackendError(409, "out_of_stock", {"slug": "delical-vanil-200ml"})
        raise AssertionError(path)

    api = Api(handler)
    q = callback("co:confirm")
    await shop.cb_confirm(q, api, state)
    text = q.message.answer.await_args.args[0]
    assert "sotuvda yoʻq" in text
    assert any(btn.callback_data == "cart" for btn in all_buttons(q.message.answer.await_args.kwargs["reply_markup"]))


@pytest.mark.asyncio
async def test_checkout_pending_is_not_reported_as_success():
    state = State({
        "name": "Ali", "phone": "998901234567", "method": "courier",
        "region": "Toshkent shahri", "address": "Amir Temur 12", "order_key": "k" * 16,
    })

    def handler(method, path, body, params):
        if path == "/shop/locale":
            return {"locale": "uz"}
        if path == "/shop/order":
            raise BackendError(425, "pending")
        raise AssertionError(path)

    api = Api(handler)
    q = callback("co:confirm")
    await shop.cb_confirm(q, api, state)
    assert "qabul qilinmoqda" in q.message.answer.await_args.args[0]


@pytest.mark.asyncio
async def test_phone_sharing_resumes_the_checkout():
    def handler(method, path, body, params):
        if path == "/shop/locale":
            return {"locale": "uz"}
        if path == "/contacts":
            assert body["chatId"] == CHAT and body["phone"] == "+998901234567"
            return {"phone": "998901234567", "name": "Ali", "locale": "uz"}
        if path == "/shop/cart":
            return CART
        if path == f"/customers/{CHAT}":
            return customer(method, path, body, params)
        raise AssertionError(path)

    api = Api(handler)
    st = State({"name": "Ali", "promo": ""})
    m = message(contact=SimpleNamespace(user_id=CHAT, phone_number="+998901234567"))
    await shop.on_contact(m, api, st)
    texts = [c.args[0] for c in m.answer.await_args_list]
    assert any("Raqamingiz ulandi" in t for t in texts)
    assert any("998901234567" in t for t in texts)


@pytest.mark.asyncio
async def test_language_is_saved_and_the_menu_is_rebuilt():
    api = Api(lambda m, p, b, q: {"ok": True} if p == "/shop/locale" else {"locale": "ru"})
    q = callback("lang:ru")
    await shop.cb_lang(q, api, State())
    assert ("POST", "/shop/locale") in api.paths()
    assert "Язык: русский" in q.message.answer.await_args.args[0]
    assert_callbacks_fit(q.message.answer.await_args.kwargs["reply_markup"])


@pytest.mark.asyncio
async def test_long_slugs_never_produce_invalid_callback_data():
    long_product = {**PRODUCT, "slug": "x" * 70}
    api = Api(lambda m, p, b, q: {"locale": "uz", "categories": [], "items": [long_product], "total": 1, "page": 1, "pages": 1})
    m = message()
    await shop.send_list(m, api, "uz", None, 1, edit=False)
    markup = m.answer.await_args.kwargs["reply_markup"]
    callbacks = [btn.callback_data for btn in all_buttons(markup) if btn.callback_data]
    assert all(len(c.encode()) <= 64 for c in callbacks)
    assert not any("x" * 10 in c for c in callbacks)


QUOTE = {
    **CART,
    "promo": {"code": None, "ok": False, "reason": None},
}


@pytest.mark.asyncio
async def test_summary_does_not_repeat_a_label_that_already_has_its_icon():
    for locale, region in (("uz", "Toshkent shahri"), ("ru", "город Ташкент")):
        text = shop.summary_text(
            locale, QUOTE, {"name": "Ali", "phone": "998901234567", "method": "courier", "region": region, "address": "Chilonzor 9"}
        )
        assert text.count("🚚") == 1, text
        pickup = shop.summary_text(
            locale, QUOTE, {"name": "Ali", "phone": "998901234567", "method": "pickup", "region": "Toshkent", "address": "Ombor"}
        )
        assert pickup.count("🏬") == 1, pickup


@pytest.mark.asyncio
async def test_a_product_without_a_fetchable_photo_still_opens_as_text():
    """Telegram only fetches https; an http image must not cost a failed call."""
    api = Api(lambda m, p, b, q: {"product": {**PRODUCT, "image": "http://localhost:3000/p.png"}})
    m = message()
    await shop.send_product(m, api, "uz", PRODUCT["slug"])
    m.answer_photo.assert_not_awaited()
    assert "Delical vanil 200 ml" in m.answer.await_args.args[0]
    assert "Biologik faol qoʻshimcha" in m.answer.await_args.args[0]
