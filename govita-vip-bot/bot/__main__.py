import asyncio
import logging
import sys
from pathlib import Path
import secrets

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.types import BotCommand, MenuButtonWebApp, WebAppInfo

from .config import cfg
from .db import DB
from .handlers import router
from .seed import seed_demo
from .workers import run_loop


async def main():
    logging.basicConfig(level=logging.INFO)
    if not cfg.bot_token:
        sys.exit("BOT_TOKEN yoʻq (.env.example ga qarang)")
    demo = "--demo" in sys.argv
    if not demo:
        from .backend import GoVitaBackend
        from .remote import router as remote_router, outbox_loop
        from .shop import router as shop_router
        from .login import router as login_router
        from .reply_menu import router as reply_menu_router
        from . import settings as settings_store
        api = await GoVitaBackend(cfg.backend_url, cfg.backend_key).open()
        try:
            settings = await api.request('GET', '/config')
            # One place copies the panel's values onto cfg; the outbox loop
            # re-reads them later, so an admin edit applies without a restart.
            settings_store.apply(settings)
            bot = Bot(cfg.bot_token, default=DefaultBotProperties(parse_mode="HTML"))
            me = await bot.get_webhook_info()
            if me.url:
                sys.exit('Webhook faol. Pollingga ko‘chirishni avval rejalashtiring.')
            # The menu button beside the message field opens the shop inside Telegram.
            # The bot speaks Russian by default (2026-11); Uzbek is one press away.
            await bot.set_chat_menu_button(menu_button=MenuButtonWebApp(
                text="Магазин", web_app=WebAppInfo(url=f"{cfg.shop_url}/ru")))
            await bot.set_my_commands([
                BotCommand(command="start", description="Главное меню"),
                BotCommand(command="katalog", description="Каталог"),
                BotCommand(command="savat", description="Корзина"),
                BotCommand(command="buyurtmalar", description="Мои заказы"),
                BotCommand(command="klub", description="Клуб: баллы и код для друга"),
                BotCommand(command="yordam", description="Помощь"),
            ])
            await bot.set_my_commands([
                BotCommand(command="start", description="Bosh menyu"),
                BotCommand(command="katalog", description="Katalog"),
                BotCommand(command="savat", description="Savat"),
                BotCommand(command="buyurtmalar", description="Buyurtmalarim"),
                BotCommand(command="klub", description="Klub: ballar va doʻst kodi"),
                BotCommand(command="yordam", description="Yordam"),
            ], language_code="uz")
            dp = Dispatcher(api=api)
            # The shop first: it owns the catalogue/cart/checkout callbacks and
            # the FSM text steps; the club menu catches everything else.
            # Sign-in links and the persistent keyboard come first: a press of
            # «🛒 Savat» mid-checkout is a way out, not a typed name.
            dp.include_router(login_router)
            dp.include_router(reply_menu_router)
            dp.include_router(shop_router)
            dp.include_router(remote_router)
            worker = asyncio.create_task(outbox_loop(bot, api))
            try:
                await dp.start_polling(bot)
            finally:
                worker.cancel()
                await asyncio.gather(worker, return_exceptions=True)
                await bot.session.close()
        finally:
            await api.close()
        return
    if not cfg.pepper:
        # A generated local secret persists with the data volume.
        path = Path(cfg.db_path).resolve().parent / ".club-pepper"
        if not path.exists():
            path.touch(mode=0o600, exist_ok=True)
            path.write_text(secrets.token_hex(32))
        cfg.pepper = path.read_text().strip()
    db = await DB(cfg.db_path).open()
    if demo:
        await seed_demo(db)
    bot = Bot(cfg.bot_token, default=DefaultBotProperties(parse_mode="HTML"))
    await bot.set_my_commands([BotCommand(command="start", description="Bosh menyu"),
                               BotCommand(command="aksiyalar", description="Aksiyalar"),
                               BotCommand(command="klub", description="VIP klub"),
                               BotCommand(command="yordam", description="Yordam")])
    dp = Dispatcher(db=db)
    dp.include_router(router)
    worker = asyncio.create_task(run_loop(bot, db))
    try:
        await dp.start_polling(bot)
    finally:
        worker.cancel()
        await asyncio.gather(worker, return_exceptions=True)
        await bot.session.close()
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())
