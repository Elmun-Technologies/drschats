# Tizim xabarlari (uz / ru)

BotFlow ekranlari — `botflow/*.json`. Bu yerda — kod yuboradigan xabarlar. ShopFlow'da ular **tenant tomonidan tahrirlanadigan shablon** boʻladi (`ClubSettings.templates` yoki i18n default). Quyidagisi — default matn, GoVita uchun ham shu.

Qoidalar: HTML parse_mode; `{…}` — oʻzgaruvchi; narx `379 000 soʻm`; apostrof `ʻ`; tibbiy vaʼda yoʻq; reklama xabarida oʻchirish tugmasi majburiy.

## Kontakt va klub
| Kalit | uz | ru |
|---|---|---|
| `club.askContact` | Klubga qoʻshilish uchun raqamingizni ulashing — buyurtma holati va eslatmalar shu raqamga bogʻlanadi. | Поделитесь номером, чтобы вступить в клуб — статусы заказов и напоминания привяжутся к нему. |
| `btn.shareContact` | 📱 Raqamni ulashish | 📱 Поделиться номером |
| `club.contactNotOwn` | Faqat oʻz raqamingizni ulashishingiz mumkin. Pastdagi tugmani bosing. | Можно поделиться только своим номером. Нажмите кнопку ниже. |
| `club.joined` | ✅ Siz <b>{clubName}</b>dasiz.\nBuyurtma holati, eslatmalar va klub takliflari shu yerga keladi. | ✅ Вы в <b>{clubName}</b>.\nСтатусы заказов, напоминания и предложения клуба будут приходить сюда. |
| `club.joinedOrders` | Raqamingizga bogʻlangan {n} ta buyurtma topildi. | Найдено заказов по вашему номеру: {n}. |
| `club.conflict` | Bu raqam boshqa Telegram hisobiga bogʻlangan. Operator tekshirib, siz bilan bogʻlanadi. | Этот номер привязан к другому аккаунту Telegram. Оператор проверит и свяжется с вами. |

## Kirish kodi
| Kalit | uz | ru |
|---|---|---|
| `login.code` | <b>{store}</b> saytiga kirish kodi:\n\n<code>{code}</code>\n\n5 daqiqa amal qiladi. Kodni hech kimga aytmang. Siz soʻramagan boʻlsangiz — eʼtibor bermang. | Код для входа на сайт <b>{store}</b>:\n\n<code>{code}</code>\n\nДействует 5 минут. Никому не сообщайте код. Если вы не запрашивали — проигнорируйте. |
| `login.needContact` | Saytga kirish uchun raqamingizni ulashing — kod shu zahoti keladi. | Чтобы войти на сайт, поделитесь номером — код придёт сразу. |

## Buyurtma bosqichlari
Hammasi oxirida: [📦 Batafsil] [💬 Operator].
| Kalit | uz | ru |
|---|---|---|
| `stage.received` | 🧾 Buyurtma <b>№{code}</b> qabul qilindi · {total} | 🧾 Заказ <b>№{code}</b> принят · {total} |
| `stage.confirmed` | ✅ Buyurtma <b>№{code}</b> tasdiqlandi va yigʻilmoqda. | ✅ Заказ <b>№{code}</b> подтверждён и собирается. |
| `stage.onway` | 🚚 Buyurtma <b>№{code}</b> yoʻlda. {eta} | 🚚 Заказ <b>№{code}</b> в пути. {eta} |
| `stage.delivered` | 📬 Buyurtma <b>№{code}</b> yetkazildi. Xaridingiz uchun rahmat! | 📬 Заказ <b>№{code}</b> доставлен. Спасибо за покупку! |
| `stage.failed` | Kuryer siz bilan bogʻlana olmadi (№{code}). Qulay vaqtni operatorga yozing. | Курьер не смог с вами связаться (№{code}). Напишите оператору удобное время. |
| `stage.cancelled` | Buyurtma <b>№{code}</b> bekor qilindi. Savol boʻlsa — operatorga yozing. | Заказ <b>№{code}</b> отменён. Если есть вопросы — напишите оператору. |
| `stage.returned` | Buyurtma <b>№{code}</b> boʻyicha qaytarish rasmiylashtirildi. Toʻlov 3–10 ish kunida qaytariladi. | Возврат по заказу <b>№{code}</b> оформлен. Деньги вернутся за 3–10 рабочих дней. |
| `eta.tashkent` | Toshkent boʻylab — 24 soat ichida. | По Ташкенту — в течение 24 часов. |
| `eta.regions` | Viloyatlarga — 1–3 kun. | В регионы — 1–3 дня. |

## Eslatmalar
| Kalit | uz | ru |
|---|---|---|
| `rem.offer` | <b>{product}</b> qabul vaqtini eslatib turaylikmi? | Напоминать о приёме <b>{product}</b>? |
| `btn.remTimes` | 08:00 · 09:00 · 13:00 · 20:00 · Boshqa vaqt | 08:00 · 09:00 · 13:00 · 20:00 · Другое время |
| `rem.created` | ⏰ Har kuni {times} da eslatamiz. Kurs taxminan {endDate} gacha. | ⏰ Будем напоминать каждый день в {times}. Курс примерно до {endDate}. |
| `rem.push` | ⏰ <b>{product}</b> qabul vaqti.\n{intakeNote} | ⏰ Время принять <b>{product}</b>.\n{intakeNote} |
| `btn.remAck / Snooze / Off` | ✅ Ichdim · ⏱ 1 soatdan keyin · ⏸ Oʻchirish | ✅ Принял(а) · ⏱ Через час · ⏸ Отключить |
| `rem.ack` | Belgilandi ✅ | Отмечено ✅ |
| `rem.ended` | <b>{product}</b> kursi tugadi — eslatmalar toʻxtatildi. | Курс <b>{product}</b> закончился — напоминания остановлены. |

## Kurs tugashi
| Kalit | uz | ru |
|---|---|---|
| `course.ending` | <b>{product}</b> taxminan {days} kunda tugaydi.\nTanaffussiz davom ettirish uchun hozir buyurtma bering yoki obunaga oʻting — keyingi har yetkazishda −{nextPct}%. | <b>{product}</b> закончится примерно через {days} дн.\nЧтобы не прерывать приём, закажите сейчас или оформите подписку — −{nextPct}% на каждую следующую доставку. |
| `btn.courseRepeat / Sub / No` | 🔁 Takrorlash · 🔁 Obuna (−{nextPct}%) · Kerak emas | 🔁 Повторить · 🔁 Подписка (−{nextPct}%) · Не нужно |
| `bad.disclaimer` | <i>Biologik faol qoʻshimcha. Dori vositasi emas. Qabul qilishdan oldin mutaxassis bilan maslahatlashing.</i> | <i>БАД. Не является лекарственным средством. Перед применением проконсультируйтесь со специалистом.</i> |

## Obuna
| Kalit | uz | ru |
|---|---|---|
| `sub.notice` | 🔁 Keyingi yetkazish: <b>{date}</b>\n{items}\n<b>{total}</b> (−{pct}%) · {payment} | 🔁 Следующая доставка: <b>{date}</b>\n{items}\n<b>{total}</b> (−{pct}%) · {payment} |
| `btn.subSkip / Move / Edit` | ⏭ Bu safar oʻtkazish · 📅 Sanani surish · ✏️ Oʻzgartirish | ⏭ Пропустить · 📅 Перенести · ✏️ Изменить |
| `sub.skipped` | Bu yetkazish oʻtkazildi. Keyingisi — {nextDate}. | Доставка пропущена. Следующая — {nextDate}. |
| `sub.orderCreated` | 🔁 Obuna boʻyicha buyurtma <b>№{code}</b> yaratildi · {total}. {payHint} | 🔁 Заказ по подписке <b>№{code}</b> создан · {total}. {payHint} |
| `sub.payLink` | Toʻlash: {link} | Оплатить: {link} |
| `sub.autoPaused` | Ketma-ket 2 ta yetkazish amalga oshmadi — obuna pauzaga qoʻyildi. Davom ettirish uchun «Obunalarim». | Две доставки подряд не состоялись — подписка приостановлена. Возобновить — в «Мои подписки». |
| `sub.cancelAsk` | Nima uchun bekor qilyapsiz? | Почему отменяете? |
| `btn.cancelReasons` | Qimmat · Natija sezmadim · Zaxira bor · Boshqa | Дорого · Не заметил(а) эффекта · Есть запас · Другое |
| `sub.cancelled` | Obuna bekor qilindi. Istalgan vaqtda qayta yoqishingiz mumkin. | Подписка отменена. Можно включить снова в любое время. |

## Reklama va operator
| Kalit | uz | ru |
|---|---|---|
| `promo.footer.btn` | 🔕 Bunday xabarlarni oʻchirish | 🔕 Отключить такие сообщения |
| `promo.off` | Klub takliflari oʻchirildi. Buyurtma va eslatma xabarlari kelaveradi. | Предложения клуба отключены. Сообщения о заказах и напоминания продолжат приходить. |
| `op.offHours` | Ish vaqti: {supportHours}. Xabaringiz saqlandi — ish vaqtida javob beramiz. | Рабочее время: {supportHours}. Сообщение сохранено — ответим в рабочее время. |
| `consult.note` | Bu tibbiy maslahat emas. Davolanish boʻyicha shifokorga murojaat qiling. | Это не медицинская консультация. По вопросам лечения обратитесь к врачу. |

## callback_data formati (≤ 64 bayt)
`rem:ack:<id>` · `rem:snz:<id>` · `rem:off:<id>` · `rem:t:<productId>:<HHMM>` · `ce:rep:<trackerId>` · `ce:sub:<trackerId>` · `ce:no:<trackerId>` · `sub:skip:<runId>` · `sub:move:<runId>:<days>` · `sub:open:<id>` · `sub:pause:<id>` · `sub:cancel:<id>:<reason>` · `ord:<code>` · `promo:off`.
cuid = 25 belgi → eng uzuni `sub:cancel:<25>:no_effect` = 45 bayt.
