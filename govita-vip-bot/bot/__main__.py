import asyncio
import logging
import sys

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
    db = await DB(cfg.db_path).open()
    if "--demo" in sys.argv:
        await seed_demo(db)
    bot = Bot(cfg.bot_token, default=DefaultBotProperties(parse_mode="HTML"))
    await bot.set_my_commands([BotCommand(command="start", description="Bosh menyu"),
                               BotCommand(command="aksiyalar", description="Aksiyalar"),
                               BotCommand(command="klub", description="VIP klub"),
                               BotCommand(command="yordam", description="Yordam")])
    dp = Dispatcher(db=db)
    dp.include_router(router)
    asyncio.create_task(run_loop(bot, db))
    try:
        await dp.start_polling(bot)
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())
