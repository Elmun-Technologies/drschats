# Maʼlumotlar modeli — Prisma qoʻshimchalari

ShopFlow konvensiyasi: `cuid()`, har jadvalda `tenantId` + `onDelete: Cascade`, pul — `Decimal(14,2)`, indekslar `tenantId` bilan boshlanadi. Migratsiya — `npx prisma migrate dev --name club_<qism>` (MIGRATIONS.md). Har bosqich alohida migratsiya.

## 1. Mavjud modellarga maydonlar

```prisma
model Customer {
  // ...
  clubJoinedAt      DateTime?  // birinchi marta tasdiqlangan kontakt ulashgan payt
  clubSource        String?    // deep link s_<source>; birinchi qiymat saqlanadi
  telegramBlockedAt DateTime?  // Telegram 403 — botni bloklagan; /start bilan tozalanadi
  notifyReminders   Boolean @default(true)
  notifyCourseEnd   Boolean @default(true)

  subscriptions   Subscription[]
  intakeReminders IntakeReminder[]
  courseTrackers  CourseTracker[]
  sessions        CustomerSession[]
}

model Product {
  // ...
  /// Qadoqdagi porsiyalar soni (60 kapsula → 60). null — kurs hisoblanmaydi.
  servingsPerPack Int?
  /// Yoʻriqnoma boʻyicha kunlik porsiya (1, 2, 0.5). null — kurs hisoblanmaydi.
  servingsPerDay  Decimal? @db.Decimal(6, 2)
  /// Qabul izohi {uz, ru}: "1 kapsula, ovqat bilan". Faqat qadoqdagi yoʻriqnomadan.
  intakeNote      Json?
}

model Order {
  // ...
  subscriptionId String?
  subscription   Subscription? @relation(fields: [subscriptionId], references: [id], onDelete: SetNull)
  @@index([tenantId, subscriptionId])
}

enum NotificationType {
  // mavjudlar...
  ORDER_STAGE   // mijoz koʻradigan bosqich oʻzgardi
  REMINDER      // qabul eslatmasi
  COURSE_END    // kurs tugayapti
  SUBSCRIPTION  // obuna: ogohlantirish / buyurtma yaratildi / pauza
  LOGIN_CODE    // saytga kirish kodi (body'da kod SAQLANMAYDI)
}
```

## 2. Yangi modellar

```prisma
model ClubSettings {
  id       String @id @default(cuid())
  tenantId String @unique
  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  enabled              Boolean @default(false)
  clubName             Json    @default("{\"uz\":\"\",\"ru\":\"\"}")
  loginCodesEnabled    Boolean @default(false)
  subscriptionsEnabled Boolean @default(false)
  subscriptionFirstPct Int     @default(10)
  subscriptionNextPct  Int     @default(15)
  subscriptionIntervals Int[]  @default([30, 45, 60, 90])
  subscriptionNoticeDays Int   @default(3)
  remindersEnabled     Boolean @default(false)
  courseEndEnabled     Boolean @default(false)
  courseEndLeadDays    Int     @default(5)
  promoMaxPerWeek      Int     @default(2)
  quietFrom            String  @default("20:00") // HH:MM, tenant vaqti
  quietTo              String  @default("10:00")
  timezone             String  @default("Asia/Tashkent")
  supportHours         Json    @default("{\"uz\":\"\",\"ru\":\"\"}")

  updatedAt DateTime @updatedAt
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELLED
}

model Subscription {
  id         String   @id @default(cuid())
  tenantId   String
  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  variantId  String?
  qty        Int      @default(1)

  intervalDays Int                 // ClubSettings.subscriptionIntervals dan biri
  status       SubscriptionStatus  @default(ACTIVE)
  /// Yaratilgan paytdagi foiz (sozlama keyin oʻzgarsa ham mijozga vaʼda saqlanadi)
  nextPct      Int

  addressId      String?   // CustomerAddress
  deliveryMethod String    // "courier" | "post" | "pickup"
  paymentMethod  String    // "cod" | "payment_link"

  nextRunAt    DateTime
  pausedUntil  DateTime?
  cancelledAt  DateTime?
  cancelReason String?     // "price" | "no_effect" | "stock" | "other"
  failedInRow  Int         @default(0) // 2 ta ketma-ket FAILED → PAUSED

  createdFromOrderId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  runs   SubscriptionRun[]
  orders Order[]

  @@index([tenantId, status, nextRunAt])
  @@index([tenantId, customerId])
}

enum SubscriptionRunStatus {
  SCHEDULED
  NOTIFIED
  ORDER_CREATED
  SKIPPED
  FAILED
}

model SubscriptionRun {
  id             String  @id @default(cuid())
  tenantId       String
  subscriptionId String
  subscription   Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  scheduledFor DateTime
  status       SubscriptionRunStatus @default(SCHEDULED)
  notifiedAt   DateTime?
  orderId      String?   @unique
  error        String?
  lockedAt     DateTime? // worker claim

  createdAt DateTime @default(now())

  @@unique([subscriptionId, scheduledFor]) // ikki marta yaratilmaydi
  @@index([tenantId, status, scheduledFor])
}

model IntakeReminder {
  id         String   @id @default(cuid())
  tenantId   String
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  productId  String?
  label      String           // mahsulot qisqa nomi yoki mijoz yozgan matn (≤ 60)
  times      String[]         // ["09:00", "20:00"], tenant vaqti
  daysOfWeek Int[]   @default([0,1,2,3,4,5,6])
  startDate  DateTime
  endDate    DateTime?        // kurs tugashi; null — cheksiz
  active     Boolean @default(true)

  snoozeUntil DateTime?
  lastSentAt  DateTime?
  lastSlot    String?         // "2026-10-08T09:00" — bir slotga bir marta
  sentCount   Int @default(0)
  ackCount    Int @default(0)
  lockedAt    DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId, active])
  @@index([customerId])
}

enum CourseStatus {
  ACTIVE
  ALERTED
  REORDERED
  DISMISSED
  SUPERSEDED   // mijoz yangi buyurtma qilgan yoki obunaga oʻtgan
}

model CourseTracker {
  id         String   @id @default(cuid())
  tenantId   String
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  productId  String
  orderId    String

  startedAt DateTime   // yetkazilgan sana
  endsAt    DateTime
  alertAt   DateTime   // endsAt - courseEndLeadDays
  status    CourseStatus @default(ACTIVE)
  lockedAt  DateTime?

  createdAt DateTime @default(now())

  @@unique([orderId, productId])
  @@index([tenantId, status, alertAt])
  @@index([customerId, productId])
}

model ClubLoginCode {
  id         String   @id @default(cuid())
  tenantId   String
  phone      String   // canonicalPhone()
  customerId String?
  codeHash   String?  // sha256(code|tenantId|phone|PEPPER); null — kod hali yuborilmagan (bot kutilmoqda)
  expiresAt  DateTime
  attempts   Int      @default(0)
  consumedAt DateTime?
  ip         String?
  createdAt  DateTime @default(now())

  @@index([tenantId, phone, createdAt])
}

model CustomerSession {
  id         String   @id @default(cuid())
  tenantId   String
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  tokenHash  String   @unique   // sha256(token)
  userAgent  String?
  expiresAt  DateTime
  revokedAt  DateTime?
  lastUsedAt DateTime?
  createdAt  DateTime @default(now())

  @@index([tenantId, customerId])
}
```

## 3. Hisoblash qoidalari
- **Kurs kunlari:** `floor(servingsPerPack × qty / servingsPerDay)`. Prenatal Forte 60 kapsula, kuniga 1 → 60 kun.
- **CourseTracker yaratish:** buyurtma bosqichi «Yetkazildi» boʻlganda, har bir `OrderItem` uchun (doza maydonlari toʻla boʻlsa). Shu mijoz + mahsulot uchun eski `ACTIVE` tracker → `SUPERSEDED`, yangisining `startedAt = max(deliveredAt, eski endsAt)` (zaxira ustiga zaxira).
- **Obunadagi mahsulot:** tracker yaratilmaydi.
- **Obuna narxi:** har run'da joriy `Product.price` × (1 − `nextPct`/100), butun soʻmga yaxlitlanadi. Boshqa chegirma bilan qoʻshilmaydi — eng kattasi.
- **Keyingi run:** `scheduledFor + intervalDays` (oʻtkazilgan run ham shunday hisoblanadi).
