import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { banners } from "@/lib/db/schema";
import { listRepoImages } from "@/lib/admin/repo-images.server";
import { isStorageConfigured } from "@/lib/admin/storage";
import { toTashkentInput } from "@/lib/admin/product-form";
import { formatNumber } from "@/lib/utils";
import { BannerForm } from "@/components/admin/storefront/BannerForm";
import { PageHeader, secondaryButtonClass } from "@/components/admin/ui";

export const metadata = { title: "Banner" };

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isSafeInteger(num) || num <= 0) notFound();
  const [[b], repoImages] = await Promise.all([getDb().select().from(banners).where(eq(banners.id, num)).limit(1), listRepoImages()]);
  if (!b) notFound();
  return (
    <>
      <PageHeader
        eyebrow="Vitrina"
        title={b.title.uz}
        lead={`Bosishlar: ${formatNumber(b.clicks)}`}
        actions={<Link href="/admin/storefront" className={secondaryButtonClass}>← Bannerlar</Link>}
      />
      <BannerForm
        repoImages={repoImages}
        storageReady={isStorageConfigured}
        values={{
          id: b.id,
          placement: b.placement,
          uzTitle: b.title.uz,
          ruTitle: b.title.ru,
          uzSubtitle: b.subtitle.uz ?? "",
          ruSubtitle: b.subtitle.ru ?? "",
          uzCta: b.cta.uz ?? "",
          ruCta: b.cta.ru ?? "",
          href: b.href,
          image: b.image ?? "",
          imageMobile: b.imageMobile ?? "",
          theme: b.theme,
          startsAt: toTashkentInput(b.startsAt),
          endsAt: toTashkentInput(b.endsAt),
          showCountdown: b.showCountdown,
          sort: b.sort,
          active: b.active,
        }}
      />
    </>
  );
}
