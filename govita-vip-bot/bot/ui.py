"""Matnlar va klaviaturalar (MESSAGES.md + mockups)."""
from aiogram.types import (InlineKeyboardButton as IB, InlineKeyboardMarkup as IM,
                           KeyboardButton as KB, ReplyKeyboardMarkup as RM, WebAppInfo)

from .config import cfg

DISCLAIMER = "<i>Biologik faol qoʻshimcha. Dori vositasi emas. Qabul qilishdan oldin mutaxassis bilan maslahatlashing.</i>"

T = {
    "welcome": "Assalomu alaykum! <b>GoVita</b> VIP Salomatlik Klubiga xush kelibsiz 👋",
    "about": ("<b>Klubda nima bor</b>\n• Buyurtma holati va yetkazish xabarlari\n"
              "• Qabul eslatmalari va kurs tugashi haqida ogohlantirish\n"
              "• Obunani shu yerdan boshqarish\n• Klub takliflari\n• 300 000 soʻmdan bepul yetkazish"),
    "askContact": "Klubga qoʻshilish uchun raqamingizni ulashing — buyurtma holati va eslatmalar shu raqamga bogʻlanadi.",
    "contactNotOwn": "Faqat oʻz raqamingizni ulashishingiz mumkin. Pastdagi tugmani bosing.",
    "joined": "✅ Siz <b>{club}</b>dasiz.\nBuyurtma holati, eslatmalar va klub takliflari shu yerga keladi.",
    "joinedOrders": "Raqamingizga bogʻlangan {n} ta buyurtma topildi.",
    "conflict": "Bu raqam boshqa Telegram hisobiga bogʻlangan. Operator tekshirib, siz bilan bogʻlanadi.",
    "menu": ("<b>GoVita VIP Salomatlik Klubi</b>\n\nBuyurtma holati, qabul eslatmalari, obunalar "
             "va klub takliflari — hammasi shu yerda."),
    "loginCode": ("<b>{store}</b> saytiga kirish kodi:\n\n<code>{code}</code>\n\n5 daqiqa amal qiladi. "
                  "Kodni hech kimga aytmang.\n<i>Siz soʻramagan boʻlsangiz — eʼtibor bermang.</i>"),
    "loginNeedContact": "Saytga kirish uchun raqamingizni ulashing — kod shu zahoti keladi.",
    "loginNoPending": "Saytda kirish kodini soʻrang — kod shu yerga keladi.",
    "needJoin": "Avval raqamingizni ulashing — shunda buyurtmalaringizni koʻrsata olamiz.",
    "noOrders": "Raqamingizga bogʻlangan buyurtma topilmadi.",
    "soon": "Tez orada 🙂",
    "promoOff": "Klub takliflari oʻchirildi. Buyurtma va eslatma xabarlari kelaveradi.",
    "consult": "Bu tibbiy maslahat emas. Davolanish boʻyicha shifokorga murojaat qiling.",
    "opSent": "Xabaringiz operatorga yuborildi. Ish vaqtida ({hours}) tez javob beramiz.",
    "help": "Qanday yordam kerak?\n\nOperator: <b>{phone}</b>\n{hours}",
    "opAsk": "Savolingizni bitta xabarda yozing — operatorga yuboramiz.",
}

STAGE_MSG = {
    "received": "🧾 Buyurtma <b>№{code}</b> qabul qilindi · {total}",
    "confirmed": "✅ Buyurtma <b>№{code}</b> tasdiqlandi va yigʻilmoqda.",
    "onway": "🚚 Buyurtma <b>№{code}</b> yoʻlda. {eta}",
    "delivered": "📬 Buyurtma <b>№{code}</b> yetkazildi. Xaridingiz uchun rahmat!",
    "failed": "Kuryer siz bilan bogʻlana olmadi (№{code}). Qulay vaqtni operatorga yozing.",
    "cancelled": "Buyurtma <b>№{code}</b> bekor qilindi. Savol boʻlsa — operatorga yozing.",
    "returned": "Buyurtma <b>№{code}</b> boʻyicha qaytarish rasmiylashtirildi. Toʻlov 3–10 ish kunida qaytariladi.",
}
ETA = {"tashkent": "Toshkent boʻylab — 24 soat ichida.", "regions": "Viloyatlarga — 1–3 kun."}


def b(text, data=None, url=None, webapp=None):
    if webapp:
        return IB(text=text, web_app=WebAppInfo(url=webapp))
    if url:
        return IB(text=text, url=url)
    return IB(text=text, callback_data=data)


def kb(*rows):
    return IM(inline_keyboard=[list(r) for r in rows])


def shop_btn(text="🛍 Doʻkon"):
    u = cfg.shop_url
    return b(text, webapp=u) if u.startswith("https://") else b(text, url=u)


def main_menu():
    return kb(
        [shop_btn()],
        [b("📦 Buyurtmalarim", "m:orders"), b("🔁 Obunalarim", "m:subs")],
        [b("⏰ Eslatmalar", "m:rem"), b("⭐ VIP klub", "m:club")],
        [b("🎁 Aksiyalar", "m:promo"), b("🧪 Vitamin testi", url=f"{cfg.shop_url}/quiz")],
        [b("💬 Savol berish", "m:help"), b("ℹ️ Maʼlumot", "m:info")],
        [b("🌐 Til / Язык", "m:lang")],
    )


def contact_kb():
    return RM(keyboard=[[KB(text="📱 Raqamni ulashish", request_contact=True)]],
              resize_keyboard=True, is_persistent=True)


def shop_reply_kb():
    u = cfg.shop_url
    btn = KB(text="🛍 Doʻkon", web_app=WebAppInfo(url=u)) if u.startswith("https://") else KB(text="🛍 Doʻkon")
    return RM(keyboard=[[btn]], resize_keyboard=True, is_persistent=True)


def order_footer(code):
    return kb([b("📦 Batafsil", f"ord:{code}"), b("💬 Operator", "m:op")])


def promo_off_btn():
    return b("🔕 Bunday xabarlarni oʻchirish", "promo:off")
