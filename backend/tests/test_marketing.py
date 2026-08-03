from datetime import date, datetime, timedelta, timezone

import pytest
from sqlalchemy import update

from app.models import Order, Subscription

pytestmark = pytest.mark.asyncio

SIGNUP = {"name": "Aziz", "phone": "998901234567", "password": "correct horse"}


def _in_days(days: int) -> str:
    """A `MM-DD` birthday that falls `days` from today, whatever today is."""
    target = date.today() + timedelta(days=days)
    return f"{target.month:02d}-{target.day:02d}"


async def _consenting_user(client, service_headers, **profile) -> dict:
    """A registered, opted-in, verified customer — the only kind that is ever queued."""
    token = (await client.post("/api/v1/auth/register", json=SIGNUP)).json()["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}

    await client.patch(
        "/api/v1/profile/me",
        json={
            "email": "aziz@example.com",
            "birthday": None,
            "locale": "uz",
            "goals": [],
            "household": [],
            "marketingEmail": True,
            "marketingTelegram": False,
            **profile,
        },
        headers=headers,
    )

    user_id = (await client.get("/api/v1/auth/me", headers=headers)).json()["id"]
    await client.post(
        "/api/v1/marketing/verify-email",
        json={"userId": str(user_id), "email": "aziz@example.com"},
        headers=service_headers,
    )
    return headers


async def _due(client, service_headers) -> list[dict]:
    res = await client.get("/api/v1/marketing/due", headers=service_headers)
    assert res.status_code == 200
    return res.json()


async def test_the_queue_is_shut_without_a_service_key(client):
    assert (await client.get("/api/v1/marketing/due")).status_code == 401
    assert (
        await client.get("/api/v1/marketing/due", headers={"X-Service-Key": "wrong"})
    ).status_code == 401


async def test_an_unverified_address_is_never_queued(client, service_headers):
    token = (await client.post("/api/v1/auth/register", json=SIGNUP)).json()["accessToken"]
    await client.patch(
        "/api/v1/profile/me",
        json={
            "email": "aziz@example.com",
            "birthday": _in_days(3),
            "locale": "uz",
            "goals": [],
            "household": [],
            "marketingEmail": True,
            "marketingTelegram": False,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    # Consent given, address unproven: sending here is how a domain gets blocked.
    assert await _due(client, service_headers) == []


async def test_a_birthday_inside_the_window_is_queued_once(client, service_headers):
    await _consenting_user(client, service_headers, birthday=_in_days(3))

    first = await _due(client, service_headers)
    assert [m["campaign"] for m in first] == ["birthday"]
    assert first[0]["email"] == "aziz@example.com"

    # The second run is the one that matters: a cron that runs hourly must not
    # wish anyone a happy birthday every hour.
    assert await _due(client, service_headers) == []


async def test_a_distant_birthday_waits(client, service_headers):
    await _consenting_user(client, service_headers, birthday=_in_days(60))
    assert await _due(client, service_headers) == []


async def test_a_household_birthday_carries_the_name(client, service_headers):
    await _consenting_user(
        client,
        service_headers,
        household=[{"relation": "child", "name": "Aziza", "birthday": _in_days(2)}],
    )
    due = await _due(client, service_headers)
    assert due[0]["campaign"] == "birthday"
    assert due[0]["data"]["memberName"] == "Aziza"


async def test_withdrawn_consent_empties_the_queue(client, service_headers):
    headers = await _consenting_user(client, service_headers, birthday=_in_days(1))

    await client.post(
        "/api/v1/marketing/subscribers",
        json={"email": "aziz@example.com", "status": "unsubscribed", "locale": "uz"},
        headers=service_headers,
    )

    assert await _due(client, service_headers) == []
    # And the account page agrees, rather than still showing the switch on.
    assert (await client.get("/api/v1/profile/me", headers=headers)).json()["marketingEmail"] is False


async def test_confirming_the_list_creates_a_subscriber(client, service_headers):
    res = await client.post(
        "/api/v1/marketing/subscribers",
        json={"email": "Reader@Example.com", "status": "confirmed", "locale": "ru", "name": "Reader"},
        headers=service_headers,
    )
    assert res.status_code == 204

    # Idempotent: the same link clicked twice is one subscriber, not a crash.
    again = await client.post(
        "/api/v1/marketing/subscribers",
        json={"email": "reader@example.com", "status": "confirmed", "locale": "ru"},
        headers=service_headers,
    )
    assert again.status_code == 204


async def test_an_upcoming_delivery_is_announced_early_enough_to_skip(
    client, service_headers, order_payload, db_sessions
):
    order_payload["items"][0]["subscription"] = {"intervalDays": 30}
    await client.post("/api/v1/orders", json=order_payload)
    await _consenting_user(client, service_headers)

    # Nothing yet — the delivery is a month out.
    assert await _due(client, service_headers) == []

    async with db_sessions() as session:
        await session.execute(
            update(Subscription).values(
                next_delivery_at=datetime.now(timezone.utc) + timedelta(days=2)
            )
        )
        await session.commit()

    due = await _due(client, service_headers)
    assert [m["campaign"] for m in due] == ["subscription-upcoming"]
    # Announced with days to spare, which is the only reason to announce it.
    assert due[0]["data"]["daysUntil"] <= 3
    assert due[0]["data"]["items"][0]["name"].startswith("Vitamin D3")


async def test_reporting_a_send_does_not_requeue_it(client, service_headers):
    await _consenting_user(client, service_headers, birthday=_in_days(0))
    due = await _due(client, service_headers)
    assert len(due) == 1

    res = await client.post(
        "/api/v1/marketing/sent",
        json={"results": [{"reminderId": due[0]["reminderId"], "channel": "email", "ok": True}]},
        headers=service_headers,
    )
    assert res.status_code == 204
    assert await _due(client, service_headers) == []


async def test_a_failed_send_is_not_retried_the_same_day(client, service_headers):
    await _consenting_user(client, service_headers, birthday=_in_days(0))
    due = await _due(client, service_headers)

    await client.post(
        "/api/v1/marketing/sent",
        json={"results": [{"reminderId": due[0]["reminderId"], "channel": "email", "ok": False}]},
        headers=service_headers,
    )
    # Recorded as failed, not deleted: a permanently broken address should be
    # visible in the log rather than retried every night forever.
    assert await _due(client, service_headers) == []


async def test_a_reorder_is_offered_as_the_course_runs_out(
    client, service_headers, order_payload, db_sessions
):
    headers = await _consenting_user(client, service_headers)

    await client.post("/api/v1/orders", json=order_payload, headers=headers)
    # Fresh order: too early to nag.
    assert await _due(client, service_headers) == []

    # Age it past the course length, which is the one thing a test cannot wait for.
    async with db_sessions() as session:
        await session.execute(
            update(Order).values(created_at=datetime.now(timezone.utc) - timedelta(days=27))
        )
        await session.commit()

    due = await _due(client, service_headers)
    assert [m["campaign"] for m in due] == ["reorder"]
    assert due[0]["data"]["productSlug"] == "vitamin-d3"
