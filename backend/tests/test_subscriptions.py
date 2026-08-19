from datetime import datetime, timedelta, timezone

import pytest

pytestmark = pytest.mark.asyncio


@pytest.fixture
def subscription_order(order_payload) -> dict:
    order_payload["items"][0]["subscription"] = {"intervalDays": 30}
    return order_payload


def _at(value: str) -> datetime:
    """
    Parse a delivery date as UTC.

    SQLite keeps no offset where Postgres does, so the same column reads back
    naive under test and aware in production. Normalising here keeps these
    tests about the schedule rather than about the driver.
    """
    parsed = datetime.fromisoformat(value)
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


async def test_a_subscribed_line_creates_a_schedule(client, sign_in, subscription_order):
    await client.post("/api/v1/orders", json=subscription_order)
    token = await sign_in()

    res = await client.get(
        "/api/v1/subscriptions/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    subscriptions = res.json()
    assert len(subscriptions) == 1
    assert subscriptions[0]["status"] == "active"
    assert subscriptions[0]["intervalDays"] == 30
    # The recurring discount, not the price paid today: the buy box promised
    # the deeper discount on every later delivery.
    assert subscriptions[0]["items"][0]["unitPrice"] == round(96750 * 0.85)


async def test_an_ordinary_order_creates_none(client, sign_in, order_payload):
    await client.post("/api/v1/orders", json=order_payload)
    token = await sign_in()
    res = await client.get(
        "/api/v1/subscriptions/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert res.json() == []


async def test_different_intervals_become_different_schedules(client, sign_in, subscription_order):
    subscription_order["items"].append(
        {
            "productId": "p2",
            "slug": "omega-3",
            "name": "Omega-3",
            "quantity": 1,
            "unitPrice": 120000,
            "subscription": {"intervalDays": 90},
        }
    )
    await client.post("/api/v1/orders", json=subscription_order)
    token = await sign_in()

    subscriptions = (
        await client.get("/api/v1/subscriptions/me", headers={"Authorization": f"Bearer {token}"})
    ).json()
    assert sorted(s["intervalDays"] for s in subscriptions) == [30, 90]


async def test_pause_clears_the_schedule_and_resume_starts_a_fresh_interval(
    client, sign_in, subscription_order
):
    await client.post("/api/v1/orders", json=subscription_order)
    token = await sign_in()
    headers = {"Authorization": f"Bearer {token}"}
    sid = (await client.get("/api/v1/subscriptions/me", headers=headers)).json()[0]["id"]

    paused = await client.patch(
        f"/api/v1/subscriptions/{sid}", json={"status": "paused"}, headers=headers
    )
    assert paused.json()["nextDeliveryAt"] is None

    resumed = await client.patch(
        f"/api/v1/subscriptions/{sid}", json={"status": "active"}, headers=headers
    )
    # A paused subscription must not ship the moment it wakes up.
    assert _at(resumed.json()["nextDeliveryAt"]) > datetime.now(timezone.utc) + timedelta(days=29)


async def test_skip_moves_the_next_delivery_by_one_interval(client, sign_in, subscription_order):
    await client.post("/api/v1/orders", json=subscription_order)
    token = await sign_in()
    headers = {"Authorization": f"Bearer {token}"}
    before = (await client.get("/api/v1/subscriptions/me", headers=headers)).json()[0]

    after = await client.patch(
        f"/api/v1/subscriptions/{before['id']}", json={"skipNext": True}, headers=headers
    )
    moved = _at(after.json()["nextDeliveryAt"]) - _at(before["nextDeliveryAt"])
    assert moved == timedelta(days=30)


async def test_a_longer_interval_re_times_from_today(client, sign_in, subscription_order):
    await client.post("/api/v1/orders", json=subscription_order)
    token = await sign_in()
    headers = {"Authorization": f"Bearer {token}"}
    sid = (await client.get("/api/v1/subscriptions/me", headers=headers)).json()[0]["id"]

    res = await client.patch(
        f"/api/v1/subscriptions/{sid}", json={"intervalDays": 90}, headers=headers
    )
    # "Not so soon" must not leave next month's delivery in place.
    assert _at(res.json()["nextDeliveryAt"]) > datetime.now(timezone.utc) + timedelta(days=89)


async def test_cancelling_stops_it_and_a_cancelled_one_cannot_be_edited(
    client, sign_in, subscription_order
):
    await client.post("/api/v1/orders", json=subscription_order)
    token = await sign_in()
    headers = {"Authorization": f"Bearer {token}"}
    sid = (await client.get("/api/v1/subscriptions/me", headers=headers)).json()[0]["id"]

    cancelled = await client.patch(
        f"/api/v1/subscriptions/{sid}", json={"status": "cancelled"}, headers=headers
    )
    assert cancelled.json()["status"] == "cancelled"
    assert cancelled.json()["nextDeliveryAt"] is None

    refused = await client.patch(
        f"/api/v1/subscriptions/{sid}", json={"skipNext": True}, headers=headers
    )
    assert refused.status_code == 409


async def test_someone_elses_subscription_is_not_found(client, sign_in, subscription_order):
    await client.post("/api/v1/orders", json=subscription_order)
    await sign_in()

    other = await sign_in("998900000000")

    res = await client.patch(
        "/api/v1/subscriptions/1",
        json={"status": "cancelled"},
        headers={"Authorization": f"Bearer {other}"},
    )
    # 404 rather than 403: the difference would turn the id in the URL into a
    # way to count other people's subscriptions.
    assert res.status_code == 404


async def test_a_due_delivery_becomes_an_order_and_the_schedule_moves_on(
    client, sign_in, service_headers, subscription_order, db
):
    """
    The second delivery. Without this the subscription is a promise the shop
    never keeps: a date in the past and no order behind it.
    """
    from sqlalchemy import update

    from app.models import Subscription

    await client.post("/api/v1/orders", json=subscription_order)
    token = await sign_in()
    headers = {"Authorization": f"Bearer {token}"}

    # Nothing is due yet, a month out.
    idle = await client.post("/api/v1/marketing/subscriptions/run", headers=service_headers)
    assert idle.json()["created"] == []

    await db.execute(
        update(Subscription).values(next_delivery_at=datetime.now(timezone.utc) - timedelta(hours=1))
    )
    await db.commit()

    run = await client.post("/api/v1/marketing/subscriptions/run", headers=service_headers)
    created = run.json()["created"]
    assert len(created) == 1
    assert created[0].startswith("GV-")

    orders = (await client.get("/api/v1/orders/me", headers=headers)).json()
    repeat = next(o for o in orders if o["orderId"] == created[0])
    # Charged at the recurring price the customer was promised, not the first-
    # order one they already used.
    assert repeat["items"][0]["unitPrice"] == round(96750 * 0.85)

    subscription = (await client.get("/api/v1/subscriptions/me", headers=headers)).json()[0]
    assert _at(subscription["nextDeliveryAt"]) > datetime.now(timezone.utc) + timedelta(days=28)

    # And it does not fire twice for the same date.
    again = await client.post("/api/v1/marketing/subscriptions/run", headers=service_headers)
    assert again.json()["created"] == []


async def test_a_paused_subscription_is_not_delivered(
    client, sign_in, service_headers, subscription_order, db
):
    from sqlalchemy import update

    from app.models import Subscription

    await client.post("/api/v1/orders", json=subscription_order)
    token = await sign_in()
    headers = {"Authorization": f"Bearer {token}"}
    sid = (await client.get("/api/v1/subscriptions/me", headers=headers)).json()[0]["id"]

    await client.patch(f"/api/v1/subscriptions/{sid}", json={"status": "paused"}, headers=headers)
    await db.execute(
        update(Subscription).values(next_delivery_at=datetime.now(timezone.utc) - timedelta(hours=1))
    )
    await db.commit()

    run = await client.post("/api/v1/marketing/subscriptions/run", headers=service_headers)
    assert run.json()["created"] == []


async def test_the_delivery_run_needs_the_service_key(client):
    assert (await client.post("/api/v1/marketing/subscriptions/run")).status_code == 401
