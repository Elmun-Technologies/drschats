"""Fon ishlari: buyurtma bosqichlari, eslatmalar, kurs tugashi, obuna."""
from __future__ import annotations

import asyncio
import logging
from datetime import date, datetime, timedelta

from aiogram import Bot
from aiogram.exceptions import TelegramForbiddenError, TelegramRetryAfter

from . import logic as L
from .config import cfg
from .ui import DISCLAIMER, ETA, STAGE_MSG, b, kb, order_footer

log = logging.getLogger("govita.workers")


def now_local():
    return datetime.utcnow() + timedelta(hours=cfg.tz_offset)


async def safe_send(bot: Bot, db, tg_id: int, text: str, markup=None):
    for _ in range(3):
        try:
            return await bot.send_message(tg_id, text, reply_markup=markup)
        except TelegramRetryAfter as e:
            await asyncio.sleep(e.retry_after)
        except TelegramForbiddenError:
            await db.run("UPDATE customers SET blocked_at=? WHERE tg_id=?", datetime.utcnow().isoformat(), tg_id)
            return None


async def push_stage(bot, db, code: str, stage: str):
    """Bosqich oʻzgarganda (dedupe bilan) mijozga xabar. Integratsiya/admin chaqiradi."""
    if not await db.set_stage(code, stage, now_local()):
        return False
    o = await db.order(code)
    c = await db.customer_by_phone(o["phone"])
    if not c or not await db.log(c["tg_id"], "stage", f"{code}:{stage}"):
        return False
    eta = ETA["tashkent"] if "Toshkent" in (o["delivery"] or "") else ETA["regions"]
    await safe_send(bot, db, c["tg_id"], STAGE_MSG[stage].format(code=code, total=L.som(o["total"]), eta=eta),
                    order_footer(code))
    if stage == "delivered":
        await on_delivered(bot, db, c, o)
    return True


async def on_delivered(bot, db, c, o):
    today = now_local().date()
    for it in await db.order_items(o["code"]):
        p = await db.product(it["product_id"])
        days = L.course_days(p["servings_per_pack"], it["qty"], p["servings_per_day"])
        if days:
            await db.run("INSERT INTO courses(tg_id,product_id,order_code,ends_on) VALUES(?,?,?,?)",
                         c["tg_id"], p["id"], o["code"], L.course_end(today, days).isoformat())
        if p["intake_note"]:
            await safe_send(bot, db, c["tg_id"], f"<b>{p['name']}</b> qabul vaqtini eslatib turaylikmi?",
                            kb([b(t, f"rem:t:{p['id']}:{t.replace(':', '')}") for t in ("08:00", "09:00", "13:00", "20:00")],
                               [b("Boshqa vaqt", f"rem:o:{p['id']}"), b("Kerak emas", "rem:no")]))


async def tick_reminders(bot, db, now=None):
    now = now or now_local()
    hhmm = now.strftime("%H:%M")
    slot = L.slot_key(now.date(), hhmm)
    rows = await db.all("SELECT r.*, p.name, p.intake_note FROM reminders r JOIN products p ON p.id=r.product_id "
                        "JOIN customers c ON c.tg_id=r.tg_id WHERE r.active=1 AND c.blocked_at IS NULL")
    sent = 0
    for r in rows:
        if r["ends_on"] and now.date() > date.fromisoformat(r["ends_on"]):
            await db.run("UPDATE reminders SET active=0 WHERE id=?", r["id"])
            await safe_send(bot, db, r["tg_id"], f"<b>{r['name']}</b> kursi tugadi — eslatmalar toʻxtatildi.")
            continue
        due = r["hhmm"] == hhmm
        snz = r["snooze_until"] and datetime.fromisoformat(r["snooze_until"]) <= datetime.utcnow()
        if not (due or snz):
            continue
        key = slot if due else f"snz:{r['snooze_until']}"
        # atomik claim: bir slotga bitta xabar
        cur = await db.c.execute("UPDATE reminders SET last_slot=?, snooze_until=NULL WHERE id=? AND "
                                 "(last_slot IS NULL OR last_slot!=?)", (key, r["id"], key))
        await db.c.commit()
        if cur.rowcount != 1:
            continue
        note = r["intake_note"] or ""
        await safe_send(bot, db, r["tg_id"], f"⏰ <b>{r['name']}</b> qabul vaqti.\n<i>{note}</i>".strip(),
                        kb([b("✅ Ichdim", f"rem:ack:{r['id']}"), b("⏱ 1 soatdan keyin", f"rem:snz:{r['id']}")],
                           [b("⏸ Eslatmani oʻchirish", f"rem:off:{r['id']}")]))
        sent += 1
    return sent


async def tick_courses(bot, db, now=None):
    now = now or now_local()
    if L.in_quiet_hours(now):
        return 0
    lim = (now.date() + timedelta(days=cfg.course_lead_days)).isoformat()
    rows = await db.all("SELECT cr.*, p.name, p.price, p.short FROM courses cr JOIN products p ON p.id=cr.product_id "
                        "WHERE notified=0 AND dismissed=0 AND ends_on<=?", lim)
    n = 0
    for r in rows:
        await db.run("UPDATE courses SET notified=1 WHERE id=?", r["id"])
        if await db.one("SELECT 1 FROM subscriptions WHERE tg_id=? AND product_id=? AND status='ACTIVE'",
                        r["tg_id"], r["product_id"]):
            continue  # obunadagi mahsulotga xabar yoʻq
        days = max((date.fromisoformat(r["ends_on"]) - now.date()).days, 0)
        await safe_send(bot, db, r["tg_id"],
                        f"<b>{r['name']}</b> taxminan {days} kunda tugaydi. Tanaffussiz davom ettirish uchun hozir "
                        f"buyurtma bering yoki obunaga oʻting — keyingi har yetkazishda −{cfg.sub_next_pct}%.\n\n"
                        f"Bir martalik: <b>{L.som(r['price'])}</b>\nObuna, har 30 kunda: "
                        f"<b>{L.som(L.sub_price(r['price'], cfg.sub_next_pct))}</b>\n\n{DISCLAIMER}",
                        kb([b("🔁 Takrorlash", f"ce:rep:{r['id']}"), b(f"🔁 Obuna (−{cfg.sub_next_pct}%)", f"ce:sub:{r['id']}")],
                           [b("Kerak emas", f"ce:no:{r['id']}")]))
        n += 1
    return n


async def tick_subscriptions(bot, db, now=None):
    now = now or now_local()
    today = now.date()
    rows = await db.all("SELECT s.*, p.short, p.price FROM subscriptions s JOIN products p ON p.id=s.product_id "
                        "WHERE status='ACTIVE'")
    for s in rows:
        nd = date.fromisoformat(s["next_date"])
        if nd - timedelta(days=3) <= today < nd and s["noticed_for"] != s["next_date"] and not L.in_quiet_hours(now):
            await db.run("UPDATE subscriptions SET noticed_for=? WHERE id=?", s["next_date"], s["id"])
            total = L.sub_price(s["price"], s["next_pct"]) * s["qty"]
            await safe_send(bot, db, s["tg_id"],
                            f"🔁 Keyingi yetkazish: <b>{L.fmt_day(nd)}</b>\n{s['short']} × {s['qty']}\n"
                            f"<b>{L.som(total)}</b> (−{s['next_pct']}%) · Yetkazishda toʻlov",
                            kb([b("⏭ Bu safar oʻtkazish", f"sub:skip:{s['id']}"), b("📅 Sanani surish", f"sub:mv:{s['id']}")],
                               [b("✏️ Oʻzgartirish", f"sub:open:{s['id']}")]))
        elif nd <= today:
            # Buyurtma yaratish — ShopFlow/do'kon integratsiyasi; bu yerda keyingi sanaga oʻtkaziladi va operator xabardor qilinadi
            nxt = nd + timedelta(days=s["interval_days"])
            cur = await db.c.execute("UPDATE subscriptions SET next_date=? WHERE id=? AND next_date=?",
                                     (nxt.isoformat(), s["id"], s["next_date"]))
            await db.c.commit()
            if cur.rowcount == 1 and cfg.operator_chat_id:
                await safe_send(bot, db, int(cfg.operator_chat_id),
                                f"🔁 Obuna buyurtmasi: sub#{s['id']} tg={s['tg_id']} {s['short']} × {s['qty']}")


async def run_loop(bot, db):
    last_min = None
    while True:
        try:
            n = now_local()
            if n.strftime("%H:%M") != last_min:
                last_min = n.strftime("%H:%M")
                await tick_reminders(bot, db, n)
                if n.minute % 15 == 0:
                    await tick_subscriptions(bot, db, n)
                if n.minute == 0:
                    await tick_courses(bot, db, n)
        except Exception:
            log.exception("worker tick failed")
        await asyncio.sleep(10)
