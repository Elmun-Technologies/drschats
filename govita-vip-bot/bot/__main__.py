import asyncio
import logging
import sys
from pathlib import Path
import secrets

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.types import BotCommand

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
        api = await GoVitaBackend(cfg.backend_url, cfg.backend_key).open()
        try:
            settings = await api.request('GET', '/config')
            cfg.shop_url = settings['shopUrl'].rstrip('/')
            cfg.club_name = settings['clubName']
            bot = Bot(cfg.bot_token, default=DefaultBotProperties(parse_mode="HTML"))
            me = await bot.get_webhook_info()
            if me.url:
                sys.exit('Webhook faol. Pollingga ko‘chirishni avval rejalashtiring.')
            dp = Dispatcher(api=api)
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
