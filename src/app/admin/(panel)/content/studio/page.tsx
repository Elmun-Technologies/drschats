import Link from "next/link";
import { AdminSanityStudio } from "@/components/admin/AdminSanityStudio";
import { Card, Notice, PageHeader, secondaryButtonClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kontentni tahrirlash" };

export default function AdminContentStudioPage() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const studioEnabled = process.env.NODE_ENV !== "production" || process.env.SANITY_STUDIO_ENABLED === "on";
  const ready = Boolean(projectId && projectId !== "placeholder" && studioEnabled);

  return (
    <>
      <PageHeader
        title="Kontentni tahrirlash"
        lead="Maqolalar va tahrirlanadigan kontentni Go Vita admin ichida boshqaring."
        actions={<Link href="/admin/content" className={secondaryButtonClass}>← Kontent roʻyxati</Link>}
      />
      {!ready ? (
        <Card>
          <Notice>
            CMS hozircha sozlanmagan. Sanity project ID kiriting; production’da qoʻshimcha ravishda <code className="rounded-sm bg-white px-1.5 py-0.5">SANITY_STUDIO_ENABLED=on</code> talab qilinadi.
          </Notice>
          <p className="mt-4 text-[12px] leading-5 text-muted">Kontent sahifasi maʼlumotlarni ichki statik maqolalardan ko‘rsatishda davom etadi. Studio sozlanmaguncha bu yerda nashr yoki tahrir amali bajarilmaydi.</p>
        </Card>
      ) : (
        <div className="h-[calc(100vh-230px)] min-h-[560px] overflow-hidden rounded-md border border-line bg-white">
          <AdminSanityStudio />
        </div>
      )}
    </>
  );
}
