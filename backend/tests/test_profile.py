import pytest

pytestmark = pytest.mark.asyncio

SIGNUP = {"name": "Aziz", "phone": "998901234567", "password": "correct horse"}

PROFILE = {
    "email": "aziz@example.com",
    "birthday": "1990-03-20",
    "locale": "uz",
    "goals": ["immunity", "sleep"],
    "household": [
        {"relation": "child", "name": "Aziza", "birthday": "2018-05-04"},
        {"relation": "parent", "name": None, "birthday": None},
    ],
    "marketingEmail": True,
    "marketingTelegram": False,
}


async def _register(client) -> str:
    res = await client.post("/api/v1/auth/register", json=SIGNUP)
    return res.json()["accessToken"]


async def test_profile_round_trips(client):
    token = await _register(client)
    headers = {"Authorization": f"Bearer {token}"}

    saved = await client.patch("/api/v1/profile/me", json=PROFILE, headers=headers)
    assert saved.status_code == 200

    read = await client.get("/api/v1/profile/me", headers=headers)
    body = read.json()
    assert body["goals"] == ["immunity", "sleep"]
    assert body["birthday"] == "1990-03-20"
    assert len(body["household"]) == 2
    assert body["household"][0]["name"] == "Aziza"


async def test_a_new_address_is_not_a_verified_address(client, service_headers):
    token = await _register(client)
    headers = {"Authorization": f"Bearer {token}"}
    await client.patch("/api/v1/profile/me", json=PROFILE, headers=headers)

    user_id = (await client.get("/api/v1/auth/me", headers=headers)).json()["id"]
    await client.post(
        "/api/v1/marketing/verify-email",
        json={"userId": str(user_id), "email": "aziz@example.com"},
        headers=service_headers,
    )
    assert (await client.get("/api/v1/profile/me", headers=headers)).json()["emailVerified"] is True

    # Changing it drops the verification: otherwise a profile edit would move
    # confirmed consent onto an inbox nobody proved they own.
    await client.patch(
        "/api/v1/profile/me", json={**PROFILE, "email": "other@example.com"}, headers=headers
    )
    after = (await client.get("/api/v1/profile/me", headers=headers)).json()
    assert after["email"] == "other@example.com"
    assert after["emailVerified"] is False


async def test_household_is_replaced_not_appended(client):
    token = await _register(client)
    headers = {"Authorization": f"Bearer {token}"}

    await client.patch("/api/v1/profile/me", json=PROFILE, headers=headers)
    await client.patch(
        "/api/v1/profile/me",
        json={**PROFILE, "household": [{"relation": "child", "name": "Aziza", "birthday": "2018-05-04"}]},
        headers=headers,
    )

    body = (await client.get("/api/v1/profile/me", headers=headers)).json()
    assert len(body["household"]) == 1


async def test_profile_needs_a_session(client):
    assert (await client.get("/api/v1/profile/me")).status_code == 401
    assert (await client.patch("/api/v1/profile/me", json=PROFILE)).status_code == 401


async def test_verification_link_does_not_match_a_different_address(client, service_headers):
    token = await _register(client)
    headers = {"Authorization": f"Bearer {token}"}
    await client.patch("/api/v1/profile/me", json=PROFILE, headers=headers)
    user_id = (await client.get("/api/v1/auth/me", headers=headers)).json()["id"]

    await client.post(
        "/api/v1/marketing/verify-email",
        json={"userId": str(user_id), "email": "someone-else@example.com"},
        headers=service_headers,
    )
    assert (await client.get("/api/v1/profile/me", headers=headers)).json()["emailVerified"] is False
