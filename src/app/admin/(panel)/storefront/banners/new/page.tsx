import Link from "next/link";
import { listRepoImages } from "@/lib/admin/repo-images.server";
import { isStorageConfigured } from "@/lib/admin/storage";
import { BannerForm } from "@/components/admin/storefront/BannerForm";
import { PageHeader, secondaryButtonClass } from "@/components/admin/ui";

export const metadata = { title: "Yangi banner" };

const PLACEMENTS = ["hero", "strip", "category"] as const;

export default async function NewBannerPage({ searchParams }: { searchParams: Promise<{ placement?: string }> }) {
  const [{ placement }, repoImages] = await Promise.all([searchParams, listRepoImages()]);
  const initial = PLACEMENTS.find((p) => p === placement) ?? "hero";
  return (
    <>
      <PageHeader
        eyebrow="Vitrina"
        title="Yangi banner"
        lead="Banner muddat ichida saytda chiqadi. Bosh sahifada faol banner boʻlmasa oʻrnatilgan slaydlar koʻrinadi."
        actions={<Link href="/admin/storefront" className={secondaryButtonClass}>← Bannerlar</Link>}
      />
      <BannerForm
        repoImages={repoImages}
        storageReady={isStorageConfigured}
        values={{
          placement: initial,
          uzTitle: "",
          ruTitle: "",
          uzSubtitle: "",
          ruSubtitle: "",
          uzCta: "",
          ruCta: "",
          href: "",
          image: "",
          imageMobile: "",
          theme: "light",
          startsAt: "",
          endsAt: "",
          showCountdown: false,
          sort: 0,
          active: true,
        }}
      />
    </>
  );
}
