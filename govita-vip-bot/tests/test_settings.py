import pytest

from bot import settings as settings_store
from bot.config import cfg

CONFIG = {
    "enabled": True,
    "clubName": "GoVita VIP",
    "shopUrl": "https://shop.example/",
    "supportPhone": "+998 71 000 11 22",
    "supportHours": "Du–Sha, 10:00–19:00",
    "greeting": {"uz": "Salom", "ru": "Привет"},
}


@pytest.fixture(autouse=True)
def restore():
    """Every test writes to the process-wide cfg; put it back afterwards."""
    saved = {attr: getattr(cfg, attr) for attr in (*settings_store.FIELDS.values(), "menu")}
    settings_store.reset()
    yield
    for attr, value in saved.items():
        setattr(cfg, attr, value)
    settings_store.reset()


class Api:
    def __init__(self, answer=CONFIG, fail=False):
        self.answer = answer
        self.fail = fail
        self.calls = 0

    async def request(self, method, path, body=None, params=None):
        self.calls += 1
        if self.fail:
            raise RuntimeError("down")
        return self.answer


@pytest.mark.asyncio
async def test_panel_values_reach_the_bot():
    api = Api()
    changed = await settings_store.refresh(api, now=1000)
    assert api.calls == 1
    assert cfg.shop_url == "https://shop.example"
    assert cfg.club_name == "GoVita VIP"
    assert cfg.operator_phone == "+998 71 000 11 22"
    assert cfg.support_hours == "Du–Sha, 10:00–19:00"
    assert changed == {"shop_url", "club_name", "operator_phone", "support_hours"}


@pytest.mark.asyncio
async def test_a_change_is_read_once_per_window_not_on_every_tick():
    api = Api()
    await settings_store.refresh(api, max_age=300, now=1000)
    assert await settings_store.refresh(api, max_age=300, now=1100) == set()
    assert api.calls == 1
    api.answer = {**CONFIG, "shopUrl": "https://new.example"}
    changed = await settings_store.refresh(api, max_age=300, now=1400)
    assert changed == {"shop_url"}
    assert cfg.shop_url == "https://new.example"


@pytest.mark.asyncio
async def test_a_failed_read_keeps_the_last_good_values():
    await settings_store.refresh(Api(), now=1000)
    changed = await settings_store.refresh(Api(fail=True), max_age=0, now=2000)
    assert changed == set()
    assert cfg.shop_url == "https://shop.example"
    assert cfg.operator_phone == "+998 71 000 11 22"


def test_blank_and_missing_fields_never_blank_a_customer_facing_value():
    before = cfg.shop_url
    changed = settings_store.apply({"shopUrl": "   ", "clubName": None, "supportPhone": 42})
    assert changed == set()
    assert cfg.shop_url == before


def test_a_non_object_response_is_ignored():
    assert settings_store.apply("nope") == set()
    assert settings_store.apply(None) == set()


@pytest.mark.asyncio
async def test_the_greeting_route_also_refreshes_the_rest():
    """A /start fetches /config for the greeting; the same answer carries the phone."""
    from bot import remote

    class GreetingApi:
        async def request(self, method, path, body=None, params=None):
            return CONFIG

    text = await remote.greeting(GreetingApi(), "ru")
    assert text == "Привет"
    assert cfg.operator_phone == "+998 71 000 11 22"


def test_menu_switches_apply_and_keep_the_ones_not_sent():
    """The panel sends seven booleans; a missing one must keep its value."""
    changed = settings_store.apply({"menu": {"promo": False}})
    assert changed == {"menu"}
    assert cfg.menu["promo"] is False
    assert cfg.menu["catalog"] is True
    # Again with the same value: nothing changed.
    assert settings_store.apply({"menu": {"promo": False}}) == set()


def test_menu_ignores_values_that_are_not_booleans():
    before = dict(cfg.menu)
    assert settings_store.apply({"menu": {"cart": "no", "orders": 1}}) == set()
    assert cfg.menu == before
