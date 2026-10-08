"""Demo maʼlumot (mockuplardagidek)."""
import json
from datetime import datetime


async def seed_demo(db, phone="+998901234567"):
    if await db.one("SELECT 1 FROM products"):
        return
    P = [(1, "Dr. Frei Antistress Magniy B6, 20 shipuchi tabletka", "Antistress Magniy B6", 79000, 89000, 20, 1,
          "Kuniga 1 tabletka · qadoqdagi yoʻriqnoma boʻyicha"),
         (2, "Multivitamins + Biotin", "Multivitamins + Biotin", 79000, None, 30, 1, "Kuniga 1 kapsula, ovqat bilan"),
         (3, "Swiss Energy Vitamin C 550 mg", "Vitamin C 550 mg", 107000, None, 20, 1, None)]
    for p in P:
        await db.run("INSERT INTO products VALUES(?,?,?,?,?,?,?,?)", *p)
    O = [("GV-10248", "2026-10-08T10:42", 267000, 30000, "Payme", "Kuryer, Toshkent", "onway",
          {"received": "2026-10-08T10:42", "confirmed": "2026-10-08T10:43", "onway": "2026-10-08T15:05"},
          [(1, 2, 79000), (2, 1, 79000)]),
         ("GV-09871", "2026-09-14T12:00", 372950, 0, "Click", "Kuryer, Toshkent", "delivered", {}, [(3, 3, 107000)]),
         ("GV-09310", "2026-08-02T12:00", 341100, 0, "Naqd", "Kuryer, Toshkent", "delivered", {}, [(1, 4, 79000)])]
    for code, at, tot, fee, pay, dl, st, h, items in O:
        await db.run("INSERT INTO orders VALUES(?,?,?,?,?,?,?,?,?,NULL)", code, phone, at, tot, fee, pay, dl, st,
                     json.dumps(h))
        for pid, q, pr in items:
            await db.run("INSERT INTO order_items VALUES(?,?,?,?)", code, pid, q, pr)
