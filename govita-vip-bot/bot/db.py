from __future__ import annotations

import json
from datetime import date, datetime, timedelta

import aiosqlite

SCHEMA = """
CREATE TABLE IF NOT EXISTS customers(
  tg_id INTEGER PRIMARY KEY, phone TEXT, name TEXT, club_joined_at TEXT,
  club_source TEXT, referred_by INTEGER, promo_on INTEGER DEFAULT 1,
  lang TEXT DEFAULT 'uz', blocked_at TEXT, created_at TEXT);
CREATE UNIQUE INDEX IF NOT EXISTS ux_cust_phone ON customers(phone) WHERE phone IS NOT NULL;
CREATE TABLE IF NOT EXISTS products(
  id INTEGER PRIMARY KEY, name TEXT, short TEXT, price INTEGER, old_price INTEGER,
  servings_per_pack INTEGER, servings_per_day REAL, intake_note TEXT);
CREATE TABLE IF NOT EXISTS orders(
  code TEXT PRIMARY KEY, phone TEXT, created_at TEXT, total INTEGER, delivery_fee INTEGER,
  payment TEXT, delivery TEXT, stage TEXT, history TEXT, subscription_id INTEGER);
CREATE TABLE IF NOT EXISTS order_items(order_code TEXT, product_id INTEGER, qty INTEGER, price INTEGER);
CREATE TABLE IF NOT EXISTS reminders(
  id INTEGER PRIMARY KEY AUTOINCREMENT, tg_id INTEGER, product_id INTEGER, hhmm TEXT,
  active INTEGER DEFAULT 1, last_slot TEXT, snooze_until TEXT, ends_on TEXT);
CREATE TABLE IF NOT EXISTS courses(
  id INTEGER PRIMARY KEY AUTOINCREMENT, tg_id INTEGER, product_id INTEGER, order_code TEXT,
  ends_on TEXT, notified INTEGER DEFAULT 0, dismissed INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS subscriptions(
  id INTEGER PRIMARY KEY AUTOINCREMENT, tg_id INTEGER, product_id INTEGER, qty INTEGER DEFAULT 1,
  interval_days INTEGER, next_date TEXT, status TEXT DEFAULT 'ACTIVE', next_pct INTEGER,
  noticed_for TEXT, cancel_reason TEXT);
CREATE TABLE IF NOT EXISTS login_requests(
  id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT, code_hash TEXT, created_at TEXT,
  expires_at TEXT, attempts INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS leads(
  id INTEGER PRIMARY KEY AUTOINCREMENT, tg_id INTEGER, tag TEXT, text TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS notif_log(
  id INTEGER PRIMARY KEY AUTOINCREMENT, tg_id INTEGER, kind TEXT, ref TEXT, created_at TEXT);
"""


class DB:
    def __init__(self, path: str):
        self.path = path
        self.c: aiosqlite.Connection | None = None

    async def open(self):
        self.c = await aiosqlite.connect(self.path)
        self.c.row_factory = aiosqlite.Row
        await self.c.executescript(SCHEMA)
        await self.c.commit()
        return self

    async def close(self):
        if self.c:
            await self.c.close()

    async def one(self, q, *a):
        cur = await self.c.execute(q, a)
        return await cur.fetchone()

    async def all(self, q, *a):
        cur = await self.c.execute(q, a)
        return await cur.fetchall()

    async def run(self, q, *a):
        cur = await self.c.execute(q, a)
        await self.c.commit()
        return cur.lastrowid

    # --- customers ---
    async def ensure_customer(self, tg_id: int, name: str):
        await self.run("INSERT OR IGNORE INTO customers(tg_id,name,created_at) VALUES(?,?,?)",
                       tg_id, name, datetime.utcnow().isoformat())
        return await self.customer(tg_id)

    async def customer(self, tg_id: int):
        return await self.one("SELECT * FROM customers WHERE tg_id=?", tg_id)

    async def customer_by_phone(self, phone: str):
        return await self.one("SELECT * FROM customers WHERE phone=?", phone)

    async def link_phone(self, tg_id: int, phone: str) -> str:
        """'ok' | 'conflict'. Boshqa TG'ga bogʻlangan raqam qayta bogʻlanmaydi."""
        other = await self.customer_by_phone(phone)
        if other and other["tg_id"] != tg_id:
            await self.run("INSERT INTO leads(tg_id,tag,text,created_at) VALUES(?,?,?,?)",
                           tg_id, "club-conflict", phone, datetime.utcnow().isoformat())
            return "conflict"
        await self.run("UPDATE customers SET phone=?, club_joined_at=COALESCE(club_joined_at,?) WHERE tg_id=?",
                       phone, datetime.utcnow().isoformat(), tg_id)
        return "ok"

    # --- orders ---
    async def orders_for(self, phone: str | None, limit=5):
        if not phone:
            return []
        return await self.all("SELECT * FROM orders WHERE phone=? ORDER BY created_at DESC LIMIT ?", phone, limit)

    async def order(self, code: str):
        return await self.one("SELECT * FROM orders WHERE code=?", code)

    async def order_items(self, code: str):
        return await self.all("SELECT oi.*, p.name, p.short FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE order_code=?", code)

    async def set_stage(self, code: str, stage: str, at: datetime) -> bool:
        o = await self.order(code)
        if not o or o["stage"] == stage:
            return False
        h = json.loads(o["history"] or "{}")
        h[stage] = at.isoformat()
        await self.run("UPDATE orders SET stage=?, history=? WHERE code=?", stage, json.dumps(h), code)
        return True

    async def log(self, tg_id, kind, ref):
        """Dedupe: shu (tg, kind, ref) boʻlsa False."""
        if await self.one("SELECT 1 FROM notif_log WHERE tg_id=? AND kind=? AND ref=?", tg_id, kind, ref):
            return False
        await self.run("INSERT INTO notif_log(tg_id,kind,ref,created_at) VALUES(?,?,?,?)",
                       tg_id, kind, ref, datetime.utcnow().isoformat())
        return True

    async def product(self, pid: int):
        return await self.one("SELECT * FROM products WHERE id=?", pid)
