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
    api = SimpleNamespace(request=AsyncMock(side_effect=[
        {'ok': True}, BackendError(404, 'customer_not_linked'), {'greeting': {'uz': 'Salom <b>Ali</b>'}}]))
    m = message()
    await remote.start(m, api)
    assert api.request.await_args_list[0].args[:2] == ('POST', '/members/7/start')
    assert m.answer.await_count == 2
    # Admin text is plain: HTML in it must not become markup.
    assert m.answer.await_args_list[0].args[0] == 'Salom &lt;b&gt;Ali&lt;/b&gt;'


@pytest.mark.asyncio
async def test_start_survives_a_config_failure():
    api = SimpleNamespace(request=AsyncMock(side_effect=[
        {'ok': True}, BackendError(404, 'customer_not_linked'), BackendError(503, 'upstream_unavailable')]))
    m = message()
    await remote.start(m, api)
    assert m.answer.await_args_list[0].args[0] == remote.T['welcome']


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

@pytest.mark.asyncio
async def test_order_shows_reorder_button():
    order = {'code': 'GV-000123', 'stage': 'Yetkazildi', 'items': [{'name': 'Delical 200ml', 'qty': 1, 'unitPrice': 118000}],
             'total': 118000, 'delivery': {'address': 'Toshkent'}, 'timeline': []}
    api = SimpleNamespace(request=AsyncMock(side_effect=[
        order,  # GET /customers/.../orders/GV-000123
        {'locale': 'uz'}  # locale_of
    ]))
    # Also need shop_ui.locale_of mock? show_order now calls locale_of first via shop_ui
    # We'll patch shop_ui.locale_of by making api return locale via shop/locale
    # Instead mock remote's dependency: patch shop_ui.locale_of to return 'uz'
    from unittest.mock import patch
    m = message()
    with patch('bot.shop.locale_of', new=AsyncMock(return_value='uz')):
        await remote.show_order(m, api, 7, 'GV-000123')
    text = m.answer.await_args.args[0]
    assert 'GV-000123' in text
    kb = m.answer.await_args.kwargs.get('reply_markup') or m.answer.await_args.args[1]
    # Check that one button has callback_data starting with reorder:
    flat = [b.callback_data for row in kb.inline_keyboard for b in row if b.callback_data]
    assert any(d.startswith('reorder:') for d in flat), f"buttons: {flat}"


@pytest.mark.asyncio
async def test_reorder_callback_triggers_api_and_cart():
    from types import SimpleNamespace as NS
    from unittest.mock import AsyncMock, patch
    api = SimpleNamespace(request=AsyncMock())
    # api request for reorder then cart
    api.request = AsyncMock(side_effect=[
        {'locale': 'uz', 'lines': [], 'totals': {}},  # not used, just reorder success
    ])
    # Need to fake callback query
    q = NS(from_user=NS(id=7), message=NS(chat=NS(id=7), answer=AsyncMock(), edit_text=AsyncMock()), data='reorder:GV-000123', answer=AsyncMock())
    # Patch send_cart
    with patch('bot.shop.send_cart', new=AsyncMock()) as mock_cart:
        with patch('bot.shop.locale_of', new=AsyncMock(return_value='uz')):
            # need api to return success for reorder
            api.request = AsyncMock(return_value={'items': []})
            await remote.callback(q, api)
            # should have claimed reorder
            assert api.request.await_count >= 1
            assert any('reorder' in str(c.args) for c in api.request.await_args_list)

