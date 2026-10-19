"""End-to-end smoke test against a running site: bot API only.

    GOVITA_LIVE_API=http://localhost:3000/api/bot \
    GOVITA_LIVE_KEY=... python scripts/live_smoke.py

It walks the same calls the native shop makes — start, contact, catalogue,
product, cart, quote, order (twice, with one idempotency key), orders list —
and prints what the API answered. Nothing here is mocked: a failure is a real
contract mismatch between the bot and the site.
"""
import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from bot.backend import BackendError, GoVitaBackend  # noqa: E402

CHAT = int(os.environ.get("GOVITA_LIVE_CHAT", "424242"))
PHONE = os.environ.get("GOVITA_LIVE_PHONE", "+998901234567")

ok = 0
bad = 0


def check(name, condition, detail=""):
    global ok, bad
    if condition:
        ok += 1
        print(f"  ok   {name}")
    else:
        bad += 1
        print(f"  FAIL {name} — {detail}")


async def main():
    url = os.environ["GOVITA_LIVE_API"]
    key = os.environ["GOVITA_LIVE_KEY"]
    api = await GoVitaBackend(url, key).open()
    try:
        config = await api.request("GET", "/config")
        check("GET /config", bool(config.get("shopUrl")), json.dumps(config)[:120])

        await api.request("POST", "/members/%d/start" % CHAT, body={"locale": "uz", "source": "live_smoke"})
        check("POST /members/:id/start", True)

        contact = await api.request(
            "POST", "/contacts",
            body={"contactUserId": CHAT, "chatId": CHAT, "phone": PHONE, "name": "Live Smoke", "telegramUserId": CHAT},
        )
        check("POST /contacts links the number", contact.get("phone"), json.dumps(contact)[:120])

        cats = await api.request("GET", "/shop/categories", params={"locale": "uz"})
        check("GET /shop/categories", len(cats.get("categories", [])) > 0)

        cat = cats["categories"][0]["slug"]
        page = await api.request("GET", "/shop/catalog", params={"locale": "uz", "page": 1, "category": cat})
        check("GET /shop/catalog", len(page.get("items", [])) > 0, json.dumps(page)[:160])
        item = page["items"][0]
        check("catalogue item carries a real price", item.get("price", 0) > 0, str(item.get("price")))
        check("catalogue item carries an absolute image", str(item.get("image", "")).startswith("http"), str(item.get("image")))

        card = await api.request("GET", "/shop/product/%s" % item["slug"], params={"locale": "uz"})
        check("GET /shop/product/:slug", card.get("product", {}).get("slug") == item["slug"])
        check("product card carries the BAD disclaimer", "qoʻshimcha" in card.get("disclaimer", ""), card.get("disclaimer"))

        search = await api.request("GET", "/shop/catalog", params={"locale": "uz", "q": item["name"].split()[0]})
        check("search by name finds the product", any(i["slug"] == item["slug"] for i in search.get("items", [])), json.dumps(search)[:160])

        add = await api.request("POST", "/shop/cart/add", body={"chatId": CHAT, "slug": item["slug"], "qty": 1})
        check("POST /shop/cart/add", any(x["slug"] == item["slug"] for x in add.get("lines", [])), json.dumps(add)[:200])

        cart = await api.request("GET", "/shop/cart", params={"chatId": CHAT, "locale": "uz"})
        check("GET /shop/cart totals", cart["totals"]["total"] > 0, json.dumps(cart.get("totals")))
        check("cart has no issues", cart.get("issues") == [], json.dumps(cart.get("issues")))

        quote = await api.request("POST", "/shop/quote", body={"chatId": CHAT, "method": "courier", "locale": "uz"})
        check("POST /shop/quote", quote["totals"]["total"] > 0, json.dumps(quote.get("totals")))

        key1 = "live-smoke-%d" % os.getpid()
        body = {
            "chatId": CHAT, "locale": "uz", "name": "Live Smoke", "phone": PHONE,
            "method": "courier", "region": "Toshkent shahri", "address": "Chilonzor 1",
            "note": "live smoke", "idempotencyKey": key1,
        }
        first = await api.request("POST", "/shop/order", body=body)
        check("POST /shop/order", first.get("ok") and first.get("orderId"), json.dumps(first)[:200])
        number = first.get("orderId")
        second = await api.request("POST", "/shop/order", body=body)
        check("a repeated key does not create a second order", second.get("orderId") == number and second.get("alreadyCreated") is True,
              json.dumps(second)[:200])

        orders = await api.request("GET", "/customers/%d/orders" % CHAT, params={"limit": 10})
        check("the order appears in «Buyurtmalarim»", any(o.get("code") == number for o in orders.get("items", [])), json.dumps(orders)[:240])

        after = await api.request("GET", "/shop/cart", params={"chatId": CHAT, "locale": "uz"})
        check("the cart is emptied only after the order exists", after["lines"] == [], json.dumps(after)[:160])

        try:
            await api.request("POST", "/shop/order", body={**body, "idempotencyKey": "live-smoke-bad-%d" % os.getpid(), "phone": "+998900000000"})
            check("a phone that is not the linked one is refused", False, "order accepted")
        except BackendError as e:
            check("a phone that is not the linked one is refused", e.code == "not_linked", e.code)

        missing = await api.request("GET", "/shop/cart", params={"chatId": CHAT + 1, "locale": "uz"})
        check("an unknown chat gets an empty cart", missing["lines"] == [])

        print(f"\n{ok}/{ok + bad} live checks passed — order {number}")
        return bad == 0
    finally:
        await api.close()


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(main()) else 1)
