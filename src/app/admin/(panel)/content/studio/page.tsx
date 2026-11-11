import Link from "next/link";
import { AdminSanityStudio } from "@/components/admin/AdminSanityStudio";
import { Card, Notice, PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const dynamic = "force-dynamic";
export const generateMetadata = () => adminTitle("Kontentni tahrirlash");

export default async function AdminContentStudioPage() {
  await requireAdmin();
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const studioEnabled = process.env.NODE_ENV !== "production" || process.env.SANITY_STUDIO_ENABLED === "on";
  const ready = Boolean(projectId && projectId !== "placeholder" && studioEnabled);

  return (
    <>
      <PageHeader
        title={t("Kontentni tahrirlash")}
        lead={t("Maqolalar va tahrirlanadigan kontentni govita admin ichida boshqaring.")}
        actions={<Link href="/admin/content" className={secondaryButtonClass}>{t("← Kontent roʻyxati")}</Link>}
      />
      {!ready ? (
        <Card>
          <Notice>
            {t("CMS hozircha sozlanmagan. Sanity project ID kiriting; productionʼda qoʻshimcha ravishda kerak:")} <code className="rounded-sm bg-white px-1.5 py-0.5">SANITY_STUDIO_ENABLED=on</code>
          </Notice>
          <p className="mt-4 text-[14px] leading-5 text-muted">{t("Kontent sahifasi maʼlumotlarni ichki statik maqolalardan koʻrsatishda davom etadi. Studio sozlanmaguncha bu yerda nashr yoki tahrir amali bajarilmaydi.")}</p>
        </Card>
      ) : (
        <div className="h-[calc(100vh-230px)] min-h-[560px] overflow-hidden rounded-[20px] border border-line bg-white">
          <AdminSanityStudio />
        </div>
      )}
    </>
  );
}
