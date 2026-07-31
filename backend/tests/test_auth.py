import pytest

pytestmark = pytest.mark.asyncio

SIGNUP = {"name": "Aziz", "phone": "998901234567", "password": "correct horse"}


async def test_register_then_me(client):
    res = await client.post("/api/v1/auth/register", json=SIGNUP)
    assert res.status_code == 201

    token = res.json()["accessToken"]
    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["phone"] == "998901234567"


async def test_phone_is_taken_only_once(client):
    await client.post("/api/v1/auth/register", json=SIGNUP)
    again = await client.post("/api/v1/auth/register", json={**SIGNUP, "phone": "+998 90 123 45 67"})
    assert again.status_code == 409


async def test_login_succeeds_and_fails_the_same_way(client):
    await client.post("/api/v1/auth/register", json=SIGNUP)

    ok = await client.post(
        "/api/v1/auth/login", json={"phone": "998901234567", "password": "correct horse"}
    )
    assert ok.status_code == 200

    wrong_password = await client.post(
        "/api/v1/auth/login", json={"phone": "998901234567", "password": "wrong"}
    )
    unknown_phone = await client.post(
        "/api/v1/auth/login", json={"phone": "998900000000", "password": "correct horse"}
    )
    # Identical response either way: a different message would turn login into
    # a way to test which phone numbers are registered.
    assert wrong_password.status_code == unknown_phone.status_code == 401
    assert wrong_password.json() == unknown_phone.json()


async def test_short_password_is_refused(client):
    res = await client.post("/api/v1/auth/register", json={**SIGNUP, "password": "short"})
    assert res.status_code == 422


async def test_garbage_token_is_not_a_session(client):
    res = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not-a-token"})
    assert res.status_code == 401
