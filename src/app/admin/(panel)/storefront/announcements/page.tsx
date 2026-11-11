import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";
import { ANNOUNCEMENTS_KEY, MAX_ANNOUNCEMENTS, parseAnnouncements } from "@/lib/merch/model";
import { toTashkentInput } from "@/lib/admin/product-form";
import { StorefrontTabs } from "@/components/admin/storefront/StorefrontTabs";
import { AnnouncementsForm } from "@/components/admin/storefront/AnnouncementsForm";
import { Notice, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Eʼlon qatori");

export default async function AnnouncementsPage() {
  await requireAdmin();
  const [row] = await getDb().select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, ANNOUNCEMENTS_KEY));
  const items = parseAnnouncements(row?.value);
  return (
    <>
      <PageHeader
        title={t("Vitrina")}
        lead={t("Sayt tepasidagi qator: kompyuterda shahar va telefon oʻrtasida, telefonda header ustida ingichka qator. Bir nechta eʼlon boʻlsa 6 soniyada almashadi.")}
      />
      <StorefrontTabs active="announcements" />
      <div className="mb-4">
        <Notice>
          {t("Yoqilgan eʼlon boʻlmasa saytda odatiy qator koʻrinadi (Yetkazib berish, Toʻlov, Kafolat, Sodiqlik dasturi, Dorixonalar uchun). Qatorni olib tashlash uchun ikkala tildagi matnni oʻchiring.")}
        </Notice>
      </div>
      <AnnouncementsForm
        max={MAX_ANNOUNCEMENTS}
        rows={items.map((a) => ({
          key: a.id,
          id: a.id,
          uz: a.text.uz,
          ru: a.text.ru,
          href: a.href ?? "",
          endsAt: a.endsAt ? toTashkentInput(new Date(a.endsAt)) : "",
          showCountdown: a.showCountdown,
          active: a.active,
        }))}
      />
    </>
  );
}
