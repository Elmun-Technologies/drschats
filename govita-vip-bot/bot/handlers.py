from __future__ import annotations

import json
from html import escape
import logging
from datetime import date, datetime, timedelta

from aiogram import F, Router
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message

from . import logic as L
from .config import cfg
from .ui import (DISCLAIMER, ETA, STAGE_MSG, T, b, contact_kb, kb, main_menu,
                 order_footer, promo_off_btn, shop_btn, shop_reply_kb)

log = logging.getLogger("govita.bot")
router = Router()


class S(StatesGroup):
    op_msg = State()
    rem_time = State()


def now_local() -> datetime:
    return datetime.utcnow() + timedelta(hours=cfg.tz_offset)


# ---------------- /start va deep link ----------------
@router.message(CommandStart())
async def start(m: Message, state: FSMContext, db):
    await state.clear()
    c = await db.ensure_customer(m.from_user.id, escape(m.from_user.full_name))
    await db.run("UPDATE customers SET blocked_at=NULL WHERE tg_id=?", m.from_user.id)
    pl = L.parse_payload(m.text)
    if pl:
        kind, val = pl
        if kind == "s" and not c["club_source"]:
            await db.run("UPDATE customers SET club_source=? WHERE tg_id=?", val[:32], c["tg_id"])
        if kind == "r" and not c["phone"] and not c["referred_by"]:
            ref = await db.one("SELECT tg_id FROM customers WHERE tg_id=?", int(val) if val.isdigit() else -1)
            if ref and ref["tg_id"] != c["tg_id"]:
                await db.run("UPDATE customers SET referred_by=? WHERE tg_id=?", ref["tg_id"], c["tg_id"])
        if kind == "login":
            await state.update_data(login=True)
            if not c["phone"]:
                return await m.answer(T["loginNeedContact"], reply_markup=contact_kb())
            return await send_pending_login(m, db, c["phone"])
        if kind == "o" and c["phone"]:
            o = await db.order(val)
            if o and o["phone"] == c["phone"]:
                return await send_order_card(m, db, val)
        if kind == "sub" and c["phone"] and val.isdigit():
            return await show_sub(m, db, c, int(val))
        if kind == "club":
            await m.answer(T["about"])
    if c["phone"]:
        return await m.answer(T["menu"], reply_markup=main_menu())
    await m.answer(T["welcome"])
    await m.answer(T["about"])
    await m.answer(T["askContact"], reply_markup=contact_kb())


@router.message(F.contact)
async def on_contact(m: Message, state: FSMContext, db):
    if not L.contact_is_own(m.contact.user_id, m.from_user.id):
        return await m.answer(T["contactNotOwn"], reply_markup=contact_kb())
    phone = L.canonical_phone(m.contact.phone_number)
    await db.ensure_customer(m.from_user.id, escape(m.from_user.full_name))
    res = await db.link_phone(m.from_user.id, phone)
    log.info("contact tg=%s phone=%s res=%s", m.from_user.id, L.mask_phone(phone), res)
    if res == "conflict":
        await notify_operator(m, f"⚠️ ID konflikti: tg={m.from_user.id} {L.mask_phone(phone)}")
        return await m.answer(T["conflict"], reply_markup=shop_reply_kb())
    orders = await db.orders_for(phone, 100)
    txt = T["joined"].format(club=cfg.club_name)
    if orders:
        txt += "\n" + T["joinedOrders"].format(n=len(orders))
    await m.answer(txt, reply_markup=shop_reply_kb())
    if (await state.get_data()).get("login"):
        await state.update_data(login=False)
        await send_pending_login(m, db, phone)
    await m.answer(T["menu"], reply_markup=main_menu())


async def send_pending_login(m: Message, db, phone: str):
    since = (datetime.utcnow() - timedelta(minutes=10)).isoformat()
    req = await db.one("SELECT * FROM login_requests WHERE phone=? AND code_hash IS NULL AND created_at>=? "
                       "ORDER BY id DESC", phone, since)
    if not req:
        return await m.answer(T["loginNoPending"], reply_markup=kb([b("🌐 Saytga oʻtish", url=f"{cfg.shop_url}/account/login")]))
    code = L.gen_code()
    exp = (datetime.utcnow() + timedelta(minutes=5)).isoformat()
    await db.run("UPDATE login_requests SET code_hash=?, expires_at=? WHERE id=?",
                 L.hash_code(code, phone, cfg.pepper), exp, req["id"])
    await m.answer(T["loginCode"].format(store=cfg.store_name, code=f"{code[:3]} {code[3:]}"))


async def notify_operator(m, text):
    if cfg.operator_chat_id:
        try:
            await m.bot.send_message(int(cfg.operator_chat_id), text)
        except Exception as e:  # noqa
            log.warning("operator notify failed")


# ---------------- Bosh menyu ----------------
@router.message(Command("menu"))
@router.message(F.text.in_({"☰ Menyu", "Menyu"}))
async def menu_cmd(m: Message, db):
    await m.answer(T["menu"], reply_markup=main_menu())


@router.message(Command("klub"))
async def klub_cmd(m: Message, db):
    await show_club(m, db, m.from_user.id)


@router.message(Command("yordam"))
async def help_cmd(m: Message, db):
    await m.answer(T["help"].format(phone=cfg.operator_phone, hours=cfg.support_hours), reply_markup=help_kb())


@router.message(Command("aksiyalar"))
async def promo_cmd(m: Message, db):
    await show_promo(m, db)


async def need_phone(target, db, tg_id):
    c = await db.customer(tg_id)
    if not c or not c["phone"]:
        msg = target.message if isinstance(target, CallbackQuery) else target
        await msg.answer(T["needJoin"], reply_markup=contact_kb())
        return None
    return c


@router.callback_query(F.data == "m:menu")
async def cb_menu(q: CallbackQuery):
    await q.message.answer(T["menu"], reply_markup=main_menu())
    await q.answer()


# ---------------- Buyurtmalar ----------------
@router.callback_query(F.data == "m:orders")
async def cb_orders(q: CallbackQuery, db):
    await q.answer()
    c = await need_phone(q, db, q.from_user.id)
    if not c:
        return
    orders = await db.orders_for(c["phone"])
    if not orders:
        return await q.message.answer(T["noOrders"], reply_markup=kb([shop_btn()], [b("⬅️ Orqaga", "m:menu")]))
    lines = ["<b>Oxirgi buyurtmalar</b>\n"]
    btns = []
    for o in orders:
        d = datetime.fromisoformat(o["created_at"]).date()
        lines.append(f"№{o['code']} · {L.fmt_day(d)} — <b>{L.STAGE_SHORT[o['stage']]}</b>\n{L.som(o['total'])}")
        btns.append(b(f"№{o['code']}", f"ord:{o['code']}"))
    rows = [btns[i:i + 2] for i in range(0, len(btns), 2)]
    rows[-1].append(b("🌐 Hammasi saytda", url=f"{cfg.shop_url}/account")) if len(rows[-1]) < 2 else rows.append([b("🌐 Hammasi saytda", url=f"{cfg.shop_url}/account")])
    rows.append([b("⬅️ Orqaga", "m:menu")])
    await q.message.answer("\n".join(lines), reply_markup=kb(*rows))


async def order_card_text(db, o):
    h = json.loads(o["history"] or "{}")
    lines = [f"<b>Buyurtma №{o['code']}</b>"]
    for st in L.STAGES:
        if st in h:
            t = datetime.fromisoformat(h[st]).strftime("%H:%M")
            mark = "🔘" if st == o["stage"] else "☑️"
            lines.append(f"{mark} {L.STAGE_LABEL[st]} · {t}")
        else:
            lines.append(f"▫️ {L.STAGE_LABEL[st]}")
    if o["stage"] not in L.STAGES:
        lines.append(f"⚠️ {L.STAGE_LABEL[o['stage']]}")
    lines.append("")
    for it in await db.order_items(o["code"]):
        lines.append(f"{it['short']} × {it['qty']} — {L.som(it['price'] * it['qty'])}")
    lines.append(f"Yetkazib berish — {L.som(o['delivery_fee']) if o['delivery_fee'] else 'bepul'}")
    lines.append(f"<b>Jami — {L.som(o['total'])}</b>")
    lines.append(f"Toʻlov: {o['payment']} · Yetkazish: {o['delivery']}")
    return "\n".join(lines)


async def send_order_card(m: Message, db, code):
    o = await db.order(code)
    await m.answer(await order_card_text(db, o), reply_markup=kb(
        [b("🔁 Takrorlash", url=f"{cfg.shop_url}/cart?repeat={code}"), b("💬 Operator", "m:op")],
        [b("⬅️ Buyurtmalarim", "m:orders")]))


@router.callback_query(F.data.startswith("ord:"))
async def cb_order(q: CallbackQuery, db):
    await q.answer()
    c = await need_phone(q, db, q.from_user.id)
    code = q.data[4:]
    o = await db.order(code) if c else None
    if not o or o["phone"] != c["phone"]:  # egalik tekshiruvi
        return await q.message.answer(T["noOrders"])
    await send_order_card(q.message, db, code)


# ---------------- Eslatmalar ----------------
@router.callback_query(F.data == "m:rem")
async def cb_rem(q: CallbackQuery, db):
    await q.answer()
    c = await need_phone(q, db, q.from_user.id)
    if not c:
        return
    rems = await db.all("SELECT r.*, p.short FROM reminders r JOIN products p ON p.id=r.product_id "
                        "WHERE tg_id=? AND active=1", c["tg_id"])
    txt = "<b>Eslatmalar</b>\n\n" + ("\n".join(f"⏰ {r['short']} — har kuni {r['hhmm']}" for r in rems)
                                     if rems else "Hozircha eslatma yoʻq.")
    rows = [[b(f"⏸ {r['short']} — oʻchirish", f"rem:off:{r['id']}")] for r in rems]
    rows.append([b("➕ Qoʻshish", "rem:add")])
    rows.append([b("⬅️ Orqaga", "m:menu")])
    await q.message.answer(txt, reply_markup=kb(*rows))


@router.callback_query(F.data == "rem:add")
async def cb_rem_add(q: CallbackQuery, db):
    await q.answer()
    c = await need_phone(q, db, q.from_user.id)
    if not c:
        return
    prods = await db.all("SELECT DISTINCT p.id, p.short FROM order_items oi JOIN orders o ON o.code=oi.order_code "
                         "JOIN products p ON p.id=oi.product_id WHERE o.phone=? LIMIT 8", c["phone"])
    if not prods:
        return await q.message.answer("Eslatma qoʻshish uchun avval xarid qiling.", reply_markup=kb([shop_btn()]))
    await q.message.answer("Qaysi mahsulot uchun?", reply_markup=kb(*[[b(p["short"], f"rem:p:{p['id']}")] for p in prods]))


def rem_time_kb(pid):
    return kb([b(t, f"rem:t:{pid}:{t.replace(':', '')}") for t in ("08:00", "09:00", "13:00", "20:00")],
              [b("Boshqa vaqt", f"rem:o:{pid}"), b("Kerak emas", "rem:no")])


@router.callback_query(F.data.startswith("rem:p:"))
async def cb_rem_p(q: CallbackQuery, db):
    p = await db.product(int(q.data.split(":")[2]))
    await q.message.answer(f"<b>{p['name']}</b> qabul vaqtini eslatib turaylikmi?", reply_markup=rem_time_kb(p["id"]))
    await q.answer()


@router.callback_query(F.data.startswith("rem:o:"))
async def cb_rem_other(q: CallbackQuery, state: FSMContext):
    await state.set_state(S.rem_time)
    await state.update_data(pid=int(q.data.split(":")[2]))
    await q.message.answer("Vaqtni HH:MM koʻrinishida yozing, masalan 07:30")
    await q.answer()


@router.message(S.rem_time)
async def rem_time_input(m: Message, state: FSMContext, db):
    import re
    t = (m.text or "").strip()
    if not re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", t):
        return await m.answer("Format: HH:MM, masalan 07:30")
    pid = (await state.get_data())["pid"]
    await state.clear()
    await create_reminder(m, db, m.from_user.id, pid, t)


@router.callback_query(F.data.startswith("rem:t:"))
async def cb_rem_t(q: CallbackQuery, db):
    _, _, pid, hhmm = q.data.split(":")
    await create_reminder(q.message, db, q.from_user.id, int(pid), f"{hhmm[:2]}:{hhmm[2:]}")
    await q.answer()


async def create_reminder(m, db, tg_id, pid, hhmm):
    c = await db.customer(tg_id)
    owned = await db.one("SELECT 1 FROM order_items oi JOIN orders o ON o.code=oi.order_code "
                         "WHERE o.phone=? AND oi.product_id=?", c["phone"] if c else None, pid)
    if not owned:
        return await m.answer("Mahsulot topilmadi.")
    import re
    if not re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", hhmm):
        return await m.answer("Vaqt notoʻgʻri.")
    course = await db.one("SELECT * FROM courses WHERE tg_id=? AND product_id=? ORDER BY id DESC", tg_id, pid)
    ends = course["ends_on"] if course else None
    await db.run("INSERT INTO reminders(tg_id,product_id,hhmm,ends_on) VALUES(?,?,?,?)", tg_id, pid, hhmm, ends)
    txt = f"⏰ Har kuni {hhmm} da eslatamiz."
    if ends:
        txt += f" Kurs taxminan {L.fmt_day(date.fromisoformat(ends))}gacha."
    await m.answer(txt)


@router.callback_query(F.data == "rem:no")
async def cb_rem_no(q: CallbackQuery):
    await q.answer("Yaxshi 👌")


async def own_reminder(db, rid, tg_id):
    return await db.one("SELECT * FROM reminders WHERE id=? AND tg_id=?", rid, tg_id)


@router.callback_query(F.data.startswith("rem:ack:"))
async def cb_rem_ack(q: CallbackQuery, db):
    if await own_reminder(db, int(q.data.split(":")[2]), q.from_user.id):
        await db.log(q.from_user.id, "rem_ack", f"{q.data}:{date.today()}")
        await q.message.edit_reply_markup(reply_markup=None)
    await q.answer("Belgilandi ✅")


@router.callback_query(F.data.startswith("rem:snz:"))
async def cb_rem_snz(q: CallbackQuery, db):
    rid = int(q.data.split(":")[2])
    if await own_reminder(db, rid, q.from_user.id):
        await db.run("UPDATE reminders SET snooze_until=? WHERE id=?", (datetime.utcnow() + timedelta(hours=1)).isoformat(), rid)
        await q.message.edit_reply_markup(reply_markup=None)
    await q.answer("1 soatdan keyin eslatamiz ⏱")


@router.callback_query(F.data.startswith("rem:off:"))
async def cb_rem_off(q: CallbackQuery, db):
    rid = int(q.data.split(":")[2])
    if await own_reminder(db, rid, q.from_user.id):
        await db.run("UPDATE reminders SET active=0 WHERE id=?", rid)
    await q.answer("Eslatma oʻchirildi")
    await q.message.answer("⏸ Eslatma oʻchirildi.")


# ---------------- Kurs tugashi ----------------
@router.callback_query(F.data.startswith("ce:"))
async def cb_ce(q: CallbackQuery, db):
    _, act, cid = q.data.split(":")
    cr = await db.one("SELECT * FROM courses WHERE id=? AND tg_id=?", int(cid), q.from_user.id)
    if not cr:
        return await q.answer()
    p = await db.product(cr["product_id"])
    if act == "rep":
        await q.message.answer("Savatga qoʻshish uchun doʻkonni oching:", reply_markup=kb(
            [b("🔁 Takrorlash", url=f"{cfg.shop_url}/cart?repeat={cr['order_code']}")]))
    elif act == "sub":
        await q.message.answer("Qaysi oraliqda yetkazaylik?", reply_markup=kb(
            [b(f"{d} kun", f"sub:new:{p['id']}:{d}") for d in (30, 45, 60, 90)]))
    else:
        await db.run("UPDATE courses SET dismissed=1 WHERE id=?", cr["id"])
        await q.message.edit_reply_markup(reply_markup=None)
    await q.answer()


# ---------------- Obunalar ----------------
@router.callback_query(F.data.startswith("sub:new:"))
async def cb_sub_new(q: CallbackQuery, db):
    await q.answer()
    await q.message.answer("Obuna avtomatik buyurtma tizimi hali ulanmagan. "
                           "Hozircha operator orqali rasmiylashtiring.",
                           reply_markup=kb([b("💬 Operator", "m:op")]))


@router.callback_query(F.data == "m:subs")
async def cb_subs(q: CallbackQuery, db):
    await q.answer()
    c = await need_phone(q, db, q.from_user.id)
    if not c:
        return
    subs = await db.all("SELECT s.*, p.short, p.price FROM subscriptions s JOIN products p ON p.id=s.product_id "
                        "WHERE tg_id=? AND status!='CANCELLED'", c["tg_id"])
    if not subs:
        return await q.message.answer("Faol obuna yoʻq. Kurs tugashi xabaridan yoki saytdan obuna boʻlishingiz mumkin.",
                                      reply_markup=kb([shop_btn()], [b("⬅️ Orqaga", "m:menu")]))
    lines = ["<b>Obunalarim</b>\n"]
    rows = []
    for s in subs:
        st = "Faol" if s["status"] == "ACTIVE" else "Toʻxtatilgan"
        lines.append(f"<b>{s['short']}</b> — {st}\nHar {s['interval_days']} kunda · "
                     f"{L.som(L.sub_price(s['price'], s['next_pct']))}"
                     + (f"\nKeyingisi: {L.fmt_day(date.fromisoformat(s['next_date']))}" if s["status"] == "ACTIVE" else ""))
        lbl = "boshqarish" if s["status"] == "ACTIVE" else "davom ettirish"
        rows.append([b(f"{s['short']} — {lbl}", f"sub:open:{s['id']}")])
    rows.append([b("⬅️ Orqaga", "m:menu")])
    await q.message.answer("\n\n".join(lines), reply_markup=kb(*rows))


async def show_sub(m, db, c, sid):
    s = await db.one("SELECT s.*, p.short, p.price FROM subscriptions s JOIN products p ON p.id=s.product_id "
                     "WHERE s.id=? AND tg_id=?", sid, c["tg_id"])
    if not s:
        return await m.answer("Obuna topilmadi.")
    if s["status"] == "ACTIVE":
        rows = [[b("⏭ Bu safar oʻtkazish", f"sub:skip:{sid}"), b("📅 Sanani surish", f"sub:mv:{sid}")],
                [b("↔️ Oraliq", f"sub:iv:{sid}"), b("⏸ Toʻxtatish", f"sub:pause:{sid}")],
                [b("✖️ Bekor qilish", f"sub:cx:{sid}")]]
    else:
        rows = [[b("▶️ Davom ettirish", f"sub:resume:{sid}")], [b("✖️ Bekor qilish", f"sub:cx:{sid}")]]
    rows.append([b("⬅️ Obunalarim", "m:subs")])
    await m.answer(f"🔁 <b>{s['short']}</b>\nHar {s['interval_days']} kunda · "
                   f"{L.som(L.sub_price(s['price'], s['next_pct']))} (−{s['next_pct']}%)\n"
                   f"Keyingi yetkazish: <b>{L.fmt_day(date.fromisoformat(s['next_date']))}</b>", reply_markup=kb(*rows))


@router.callback_query(F.data.startswith("sub:"))
async def cb_sub(q: CallbackQuery, db):
    parts = q.data.split(":")
    act, sid = parts[1], int(parts[2])
    c = await db.customer(q.from_user.id)
    s = await db.one("SELECT * FROM subscriptions WHERE id=? AND tg_id=?", sid, q.from_user.id)
    if not s or not c:
        return await q.answer("Topilmadi")
    nd = date.fromisoformat(s["next_date"])
    if act == "open":
        await show_sub(q.message, db, c, sid)
    elif act == "skip":
        nd += timedelta(days=s["interval_days"])
        await db.run("UPDATE subscriptions SET next_date=?, noticed_for=NULL WHERE id=?", nd.isoformat(), sid)
        await q.message.answer(f"Bu yetkazish oʻtkazildi. Keyingisi — {L.fmt_day(nd)}.")
    elif act == "mv":
        await q.message.answer("Necha kunga surilsin?", reply_markup=kb(
            [b("+7 kun", f"sub:mvd:{sid}:7"), b("+14 kun", f"sub:mvd:{sid}:14")]))
    elif act == "mvd":
        nd += timedelta(days=int(parts[3]))
        await db.run("UPDATE subscriptions SET next_date=?, noticed_for=NULL WHERE id=?", nd.isoformat(), sid)
        await q.message.answer(f"📅 Keyingi yetkazish — {L.fmt_day(nd)}.")
    elif act == "iv":
        await q.message.answer("Yangi oraliq:", reply_markup=kb(
            [b(f"{d} kun", f"sub:ivd:{sid}:{d}") for d in (30, 45, 60, 90)]))
    elif act == "ivd":
        await db.run("UPDATE subscriptions SET interval_days=? WHERE id=?", int(parts[3]), sid)
        await q.message.answer(f"↔️ Endi har {parts[3]} kunda yetkazamiz.")
    elif act == "pause":
        await db.run("UPDATE subscriptions SET status='PAUSED' WHERE id=?", sid)
        await q.message.answer("⏸ Obuna toʻxtatildi. «Obunalarim»dan davom ettirishingiz mumkin.")
    elif act == "resume":
        nd = max(nd, date.today() + timedelta(days=1))
        await db.run("UPDATE subscriptions SET status='ACTIVE', next_date=? WHERE id=?", nd.isoformat(), sid)
        await q.message.answer(f"▶️ Obuna davom etadi. Keyingi yetkazish — {L.fmt_day(nd)}.")
    elif act == "cx":
        await q.message.answer("Nima uchun bekor qilyapsiz?", reply_markup=kb(
            [b("Qimmat", f"sub:cxr:{sid}:price"), b("Natija sezmadim", f"sub:cxr:{sid}:no_effect")],
            [b("Zaxira bor", f"sub:cxr:{sid}:stock"), b("Boshqa", f"sub:cxr:{sid}:other")]))
    elif act == "cxr":
        await db.run("UPDATE subscriptions SET status='CANCELLED', cancel_reason=? WHERE id=?", parts[3], sid)
        await q.message.answer("Obuna bekor qilindi. Istalgan vaqtda qayta yoqishingiz mumkin.")
    await q.answer()


# ---------------- Klub, aksiyalar, yordam ----------------
async def show_club(m, db, tg_id):
    c = await db.customer(tg_id)
    if not c or not c["phone"]:
        return await m.answer(T["about"] + "\n\n" + T["askContact"], reply_markup=contact_kb())
    subs = (await db.one("SELECT COUNT(*) n FROM subscriptions WHERE tg_id=? AND status='ACTIVE'", tg_id))["n"]
    rems = (await db.one("SELECT COUNT(*) n FROM reminders WHERE tg_id=? AND active=1", tg_id))["n"]
    j = datetime.fromisoformat(c["club_joined_at"]).date()
    await m.answer(
        f"<b>VIP Salomatlik Klubi</b>\n{c['name']} · aʼzo {L.MONTHS_UZ[j.month - 1]} {j.year} dan\n\n"
        f"Faol obunalar — <b>{subs}</b>\nEslatmalar — <b>{rems}</b>\n"
        f"Bepul yetkazish — <b>{L.som(cfg.free_delivery_from)}dan</b>\n\n<i>Qoʻshimcha foiz chegirma vaʼda qilinmaydi.</i>",
        reply_markup=kb([b("🤝 Doʻstni taklif qilish", "m:ref"), b("⚙️ Sozlamalar", "m:set")],
                        [b("⬅️ Orqaga", "m:menu")]))


@router.callback_query(F.data == "m:club")
async def cb_club(q: CallbackQuery, db):
    await q.answer()
    await show_club(q.message, db, q.from_user.id)


@router.callback_query(F.data == "m:ref")
async def cb_ref(q: CallbackQuery):
    me = await q.bot.get_me()
    await q.message.answer(f"Doʻstingizga shu havolani yuboring:\nhttps://t.me/{me.username}?start=r_{q.from_user.id}")
    await q.answer()


@router.callback_query(F.data == "m:set")
async def cb_set(q: CallbackQuery, db):
    c = await db.customer(q.from_user.id)
    on = c and c["promo_on"]
    await q.message.answer(f"⚙️ <b>Sozlamalar</b>\nKlub takliflari: <b>{'yoqilgan' if on else 'oʻchirilgan'}</b>",
                           reply_markup=kb([b("🔕 Takliflarni oʻchirish" if on else "🔔 Takliflarni yoqish",
                                              "promo:off" if on else "promo:on")]))
    await q.answer()


@router.callback_query(F.data.in_({"promo:off", "promo:on"}))
async def cb_promo_toggle(q: CallbackQuery, db):
    on = q.data == "promo:on"
    await db.run("UPDATE customers SET promo_on=? WHERE tg_id=?", int(on), q.from_user.id)
    await q.message.answer("🔔 Klub takliflari yoqildi." if on else T["promoOff"])
    await q.answer()


async def show_promo(m, db):
    p = await db.one("SELECT * FROM products WHERE old_price IS NOT NULL ORDER BY id LIMIT 1")
    if not p:
        return await m.answer("Hozircha aksiya yoʻq.", reply_markup=kb([shop_btn()]))
    await m.answer(f"🎁 <b>Haftaning taklifi</b>\n{p['name']}\n<b>{L.som(p['price'])}</b>  <s>{L.som(p['old_price'])}</s>\n\n{DISCLAIMER}",
                   reply_markup=kb([shop_btn("🛍 Doʻkonda ochish")], [promo_off_btn()]))


@router.callback_query(F.data == "m:promo")
async def cb_promo(q: CallbackQuery, db):
    await q.answer()
    await show_promo(q.message, db)


def help_kb():
    return kb([b("💬 Operatorga yozish", "m:op")], [b("🧑‍⚕️ Mahsulot boʻyicha maslahat", "m:consult")],
              [b("📦 Buyurtma boʻyicha savol", "m:orders"), b("↩️ Qaytarish", "m:op")], [b("⬅️ Orqaga", "m:menu")])


@router.callback_query(F.data == "m:help")
async def cb_help(q: CallbackQuery):
    await q.message.answer(T["help"].format(phone=cfg.operator_phone, hours=cfg.support_hours), reply_markup=help_kb())
    await q.answer()


@router.callback_query(F.data.in_({"m:op", "m:consult"}))
async def cb_op(q: CallbackQuery, state: FSMContext):
    await state.set_state(S.op_msg)
    await state.update_data(tag="consult" if q.data == "m:consult" else "operator")
    txt = T["opAsk"] + ("\n\n<i>" + T["consult"] + "</i>" if q.data == "m:consult" else "")
    await q.message.answer(txt)
    await q.answer()


@router.message(S.op_msg)
async def op_msg(m: Message, state: FSMContext, db):
    tag = (await state.get_data()).get("tag", "operator")
    await state.clear()
    await db.run("INSERT INTO leads(tg_id,tag,text,created_at) VALUES(?,?,?,?)", m.from_user.id, tag,
                 m.text or "", datetime.utcnow().isoformat())
    await notify_operator(m, f"💬 [{tag}] {escape(m.from_user.full_name)} (tg={m.from_user.id}):\n{escape(m.text or '')}")
    await m.answer(T["opSent"].format(hours=cfg.support_hours.split(", ")[-1]))


@router.callback_query(F.data == "m:info")
async def cb_info(q: CallbackQuery):
    await q.message.answer(f"ℹ️ <b>{cfg.store_name}</b>\nSayt: {cfg.shop_url}\nOperator: {cfg.operator_phone}\n"
                           f"{cfg.support_hours}\n\n{DISCLAIMER}")
    await q.answer()


@router.callback_query(F.data == "m:lang")
async def cb_lang(q: CallbackQuery):
    await q.answer("Русский язык — скоро", show_alert=True)


@router.message()
async def fallback(m: Message):
    await m.answer(T["menu"], reply_markup=main_menu())
