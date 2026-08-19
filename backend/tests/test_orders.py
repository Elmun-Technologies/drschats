import pytest

pytestmark = pytest.mark.asyncio


async def test_guest_order_is_stored_and_numbered(client, order_payload):
    res = await client.post("/api/v1/orders", json=order_payload)
    assert res.status_code == 200

    body = res.json()
    assert body["ok"] is True
    # The storefront shows this to the customer, so it must be present and
    # must not be the raw row id.
    assert body["orderId"].startswith("GV-")
    assert body["orderId"] != "GV-1"


async def test_order_rejects_an_empty_basket(client, order_payload):
    order_payload["items"] = []
    res = await client.post("/api/v1/orders", json=order_payload)
    assert res.status_code == 422


async def test_signing_in_claims_earlier_guest_orders(client, sign_in, order_payload):
    # Ordered as a guest first — the ordinary case, since checkout has no login.
    await client.post("/api/v1/orders", json=order_payload)

    token = await sign_in("998901234567")

    res = await client.get("/api/v1/orders/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    orders = res.json()
    assert len(orders) == 1
    assert orders[0]["total"] == 193500
    assert orders[0]["items"][0]["quantity"] == 2


async def test_phone_formatting_does_not_split_the_customer(client, sign_in, order_payload):
    """`+998 90 123 45 67` at checkout and `998901234567` at signup are one person."""
    await client.post("/api/v1/orders", json=order_payload)

    token = await sign_in("+998 (90) 123-45-67")

    orders = (
        await client.get("/api/v1/orders/me", headers={"Authorization": f"Bearer {token}"})
    ).json()
    assert len(orders) == 1


async def test_orders_placed_after_signup_also_appear(client, sign_in, order_payload):
    token = await sign_in("998901234567")

    await client.post("/api/v1/orders", json=order_payload)

    orders = (
        await client.get("/api/v1/orders/me", headers={"Authorization": f"Bearer {token}"})
    ).json()
    assert len(orders) == 1


async def test_my_orders_requires_a_token(client):
    assert (await client.get("/api/v1/orders/me")).status_code == 401


async def test_one_customer_cannot_read_another(client, sign_in, order_payload):
    await client.post("/api/v1/orders", json=order_payload)

    other = await sign_in("998911111111")

    orders = (
        await client.get("/api/v1/orders/me", headers={"Authorization": f"Bearer {other}"})
    ).json()
    assert orders == []
