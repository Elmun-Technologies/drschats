from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from bot import remote
from bot.backend import BackendError


def message(chat=7, text='/start'):
    m = SimpleNamespace(chat=SimpleNamespace(id=chat), from_user=SimpleNamespace(id=chat, full_name='Ali', username=None),
                        text=text, answer=AsyncMock())
    return m


@pytest.mark.asyncio
async def test_menu_opens_the_shop_as_a_mini_app():
    rows = remote.menu().inline_keyboard
    assert rows[0][0].web_app.url.endswith('/uz')
    assert all(button.callback_data != 'm:subs' for row in rows for button in row)


@pytest.mark.asyncio
async def test_unlinked_start_asks_for_contact():
    api = SimpleNamespace(request=AsyncMock(side_effect=[{'ok': True}, BackendError(404, 'customer_not_linked')]))
    m = message()
    await remote.start(m, api)
    assert api.request.await_args_list[0].args[:2] == ('POST', '/members/7/start')
    assert m.answer.await_count == 2


@pytest.mark.asyncio
async def test_order_card_survives_missing_address_and_escapes():
    order = {'code': 'GV-000001', 'stage': 'Yoʻlda', 'items': [{'name': '<b>D3</b>', 'qty': 1, 'unitPrice': 1000}],
             'total': 1000, 'delivery': {'address': None}, 'timeline': [{'stage': 'Qabul qilindi'}]}
    api = SimpleNamespace(request=AsyncMock(return_value=order))
    m = message()
    await remote.show_order(m, api, 7, 'GV-000001')
    text = m.answer.await_args.args[0]
    assert '&lt;b&gt;D3' in text and 'None' not in text


@pytest.mark.asyncio
async def test_operator_messages_are_throttled():
    remote._last_ticket.clear()
    api = SimpleNamespace(request=AsyncMock(return_value={'id': 1}))
    await remote.text(message(text='salom'), api)
    await remote.text(message(text='salom yana'), api)
    tickets = [c for c in api.request.await_args_list if c.args[:2] == ('POST', '/customers/7/tickets')]
    assert len(tickets) == 1
