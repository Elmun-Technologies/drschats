"""Drive the native shop's own handlers against a running site.

    GOVITA_LIVE_API=http://localhost:3000/api/bot GOVITA_LIVE_KEY=... \
      python scripts/live_shop_ui.py

Unlike tests/test_shop.py (API faked at the transport boundary), here the API
is the real one and only Telegram is faked. Every message the customer would
see is printed, so a screen that renders "{ism}" or a stale price is visible.
The walk is: menu → catalogue → category → product → cart → quantity →
checkout (name, phone, method, region, address, note, promo, summary) →
confirm → my orders → reorder → language switch.
"""
import asyncio
import os
import sys
from types import SimpleNamespace

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from bot import shop  # noqa: E402
from bot.backend import GoVitaBackend  # noqa: E402
from bot.config import cfg  # noqa: E402

CHAT = int(os.environ.get("GOVITA_LIVE_CHAT", "515151"))
PHONE = os.environ.get("GOVITA_LIVE_PHONE", "+998935556677")

seen: list[str] = []
problems: list[str] = []


class State:
    def __init__(self):
        self.data = {}
        self.state = None

    async def set_state(self, s):
        self.state = s

    async def get_state(self):
        return self.state

    async def set_data(self, d):
        self.data = dict(d)

    async def get_data(self):
        return dict(self.data)

    async def update_data(self, **kw):
        self.data.update(kw)
        return self.data

    async def clear(self):
        self.data = {}
        self.state = None


def check_text(text, where):
    seen.append(text)
    for token in ("{ism}", "{havola}", "{kod}", "None", "Traceback"):
        if token in text:
            problems.append(f"{where}: leaked {token!r}")
    if len(text) > 4096:
        problems.append(f"{where}: {len(text)} characters (>4096)")
    return text


class Target:
    """A message a handler can edit or answer with."""

    def __init__(self, sink):
        self.sink = sink
        self.chat = SimpleNamespace(id=CHAT)

    async def answer(self, text, reply_markup=None, **kw):
        check_text(text, "answer")
        self.sink.append(("answer", text, reply_markup))
        return self

    async def answer_photo(self, photo=None, caption=None, reply_markup=None, **kw):
        if not photo or not str(photo).startswith("https://"):
            problems.append(f"photo: not an absolute URL: {photo!r}")
        check_text(caption or "", "photo")
        self.sink.append(("photo", caption or "", reply_markup))
        return self

    async def edit_text(self, text, reply_markup=None, **kw):
        check_text(text, "edit")
        self.sink.append(("edit", text, reply_markup))
        return self


class Msg(Target):
    def __init__(self, sink, text=None):
        super().__init__(sink)
        self.text = text
        self.from_user = SimpleNamespace(id=CHAT)
        self.contact = None
        self.location = None


class Callback:
    def __init__(self, data, message, answered):
        self.data = data
        self.message = message
        self.from_user = SimpleNamespace(id=CHAT)
        self.answered = answered

    async def answer(self, *a, **kw):
        self.answered.append((self.data, a))


def buttons(markup):
    if not markup:
        return []
    return [b for row in markup.inline_keyboard for b in row]


async def press(api, state, data, sink, answered, text=None):
    """Press the button whose callback_data starts with `data`."""
    msg = Target(sink)
    await shop.dispatch(data, Callback(data, msg, answered), api, state) if hasattr(shop, "dispatch") else None
    return msg


async def main():
    url = os.environ["GOVITA_LIVE_API"]
    key = os.environ["GOVITA_LIVE_KEY"]
    cfg.shop_url = "https://govita.uz"
    api = await GoVitaBackend(url, key).open()
    state = State()
    sink: list = []
    answered: list = []
    try:
        await api.request("POST", f"/members/{CHAT}/start", body={"locale": "uz"})
        await api.request("POST", "/contacts", body={
            "contactUserId": CHAT, "chatId": CHAT, "phone": PHONE, "name": "Bot UI", "telegramUserId": CHAT})
        locale = await shop.locale_of(api, CHAT)
        menu = shop.main_menu(locale)
        webapp = [b.web_app.url for b in buttons(menu) if getattr(b, "web_app", None)]
        if not webapp or not webapp[0].startswith("https://"):
            problems.append(f"menu: Mini App button missing or not https: {webapp}")

        await shop.send_catalog(Target(sink), api, locale, edit=False)
        cats = [b.callback_data for b in buttons(sink[-1][2]) if b.callback_data and b.callback_data.startswith("cat:")]
        if not cats:
            problems.append("catalogue: no category buttons")
        await shop.send_list(Target(sink), api, locale, cats[0][4:], 1, None, edit=False)
        products = [b.callback_data for b in buttons(sink[-1][2]) if b.callback_data and b.callback_data.startswith("pr:")]
        if not products:
            problems.append("list: no product buttons")
        slug = products[0][3:]
        await shop.send_product(Target(sink), api, locale, slug, back_data="cat")

        # Add, bump, remove.
        added = await api.request("POST", "/shop/cart/add", body={"chatId": CHAT, "slug": slug, "qty": 1})
        line = next((x for x in added["lines"] if x["slug"] == slug), None)
        if not line:
            problems.append("cart: the product did not land in the cart")
        await api.request("POST", "/shop/cart/set", body={"chatId": CHAT, "slug": slug, "qty": 2})
        await shop.send_cart(Target(sink), api, CHAT, locale, edit=False)
        cart_markup = sink[-1][2]
        if not any((b.callback_data or "").startswith(("q+:", "q-:", "rm:")) for b in buttons(cart_markup)):
            problems.append("cart: no quantity buttons")

        # A promo code that cannot exist must be refused with a readable reason.
        await api.request("POST", "/shop/promo", body={"chatId": CHAT, "code": "YOQBUNDAYKOD"})
        quote = await api.request("GET", "/shop/cart", params={"chatId": CHAT, "locale": locale})
        if quote["promo"]["ok"] or not quote["promo"].get("reason"):
            problems.append(f"promo: a nonsense code was not refused: {quote['promo']}")
        await api.request("POST", "/shop/promo", body={"chatId": CHAT, "code": ""})

        # Checkout, step by step, exactly as the handlers do it.
        await shop.cb_checkout(Callback("co", Target(sink), answered), api, state)
        await shop.on_name(Msg(sink, "Bot UI"), api, state)
        if not (await state.get_data()).get("name"):
            problems.append("checkout: name not stored")
        await shop.cb_method(Callback("co:method", Target(sink), answered), api, state)
        await shop.cb_courier(Callback("co:courier", Target(sink), answered), api, state)
        await shop.cb_region(Callback("co:region:0", Target(sink), answered), api, state)
        await shop.on_address(Msg(sink, "Chilonzor 9-42"), api, state)
        await shop.cb_note_skip(Callback("co:note_skip", Target(sink), answered), api, state)
        await shop.cb_promo_skip(Callback("promo:skip", Target(sink), answered), api, state)
        draft = await state.get_data()
        quote = await api.request("GET", "/shop/cart", params={"chatId": CHAT, "locale": locale})
        summary = shop.summary_text(locale, quote, draft)
        check_text(summary, "summary")
        if "naqd" not in summary:
            problems.append("summary: payment line missing")
        if summary.count("🚚") > 1:
            problems.append("summary: the courier icon is repeated")

        # Confirm — twice, the second click must not create a second order.
        await shop.cb_confirm(Callback("co:confirm", Target(sink), answered), api, state)
        placed = (await state.get_data()).get("placed")
        if not placed:
            problems.append("confirm: no order number in the reply/state")
        await shop.cb_confirm(Callback("co:confirm", Target(sink), answered), api, state)
        if (await state.get_data()).get("placed") != placed:
            problems.append("confirm: a second click changed the order")

        orders = await api.request("GET", f"/customers/{CHAT}/orders", params={"limit": 10})
        if placed and not any(o["code"] == placed for o in orders["items"]):
            problems.append("orders: the order is missing from «Buyurtmalarim»")
        again = await api.request("POST", "/shop/reorder", body={"chatId": CHAT, "orderNumber": placed})
        if not again.get("lines"):
            problems.append("reorder: the cart came back empty")
        await shop.send_cart(Target(sink), api, CHAT, locale, edit=False)

        # Language is remembered server-side, not in the bot's memory.
        await api.request("POST", "/shop/locale", body={"chatId": CHAT, "locale": "ru"})
        if await shop.locale_of(api, CHAT) != "ru":
            problems.append("locale: Russian was not remembered")
        ru_menu = shop.main_menu("ru")
        if "Doʻkon" in str([b.text for b in buttons(ru_menu)]):
            problems.append("menu: Russian menu is still Uzbek")
        if not any(getattr(b, "web_app", None) for b in buttons(ru_menu)):
            problems.append("menu: the Russian menu has no shop button")
        await api.request("POST", "/shop/locale", body={"chatId": CHAT, "locale": "uz"})

        print("\n".join(seen))
        if problems:
            print("\nPROBLEMS")
            for p in problems:
                print(" -", p)
            return False
        print(f"\nshop UI walk clean — {len(seen)} screens, order {placed}")
        return True
    finally:
        await api.close()


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(main()) else 1)
