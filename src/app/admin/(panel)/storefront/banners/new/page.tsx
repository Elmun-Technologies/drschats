import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { banners } from "@/lib/db/schema";
import { listRepoImages } from "@/lib/admin/repo-images.server";
import { isStorageConfigured } from "@/lib/admin/storage";
import { toTashkentInput } from "@/lib/admin/product-form";
import { BannerForm, type BannerFormValues } from "@/components/admin/storefront/BannerForm";
import { PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Yangi banner");

const PLACEMENTS = ["hero", "strip", "category"] as const;

/*
  `?from=<id>` starts the B variant of an A/B test from an existing banner:
  same placement, link, dates and experiment key, variant B — the team then
  changes what is being tested (the title, the picture…).
*/
async function variantOf(id: number): Promise<BannerFormValues | null> {
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  const [b] = await getDb().select().from(banners).where(eq(banners.id, id)).limit(1);
  if (!b) return null;
  const key = b.experiment ?? `test-${b.id}`;
  return {
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
    active: true,
    experiment: key,
    variant: b.variant === "B" ? "A" : "B",
    pairWith: b.id,
  };
}

export default async function NewBannerPage({ searchParams }: { searchParams: Promise<{ placement?: string; from?: string }> }) {
  await requireAdmin();
  const [{ placement, from }, repoImages] = await Promise.all([searchParams, listRepoImages()]);
  const initial = PLACEMENTS.find((p) => p === placement) ?? "hero";
  const copy = from ? await variantOf(Number(from)) : null;
  return (
    <>
      <PageHeader
        eyebrow={t("Vitrina")}
        title={copy ? t("Yangi variant ({variant})", { variant: copy.variant }) : t("Yangi banner")}
        lead={
          copy
            ? t("«{experiment}» tajribasi uchun ikkinchi variant. Saqlanganda asl banner shu tajribaning {variant} varianti boʻladi.", { experiment: copy.experiment, variant: copy.variant === "B" ? "A" : "B" })
            : t("Banner muddat ichida saytda chiqadi. Bosh sahifada faol banner boʻlmasa oʻrnatilgan slaydlar koʻrinadi.")
        }
        actions={<Link href="/admin/storefront" className={secondaryButtonClass}>{t("← Bannerlar")}</Link>}
      />
      <BannerForm
        repoImages={repoImages}
        storageReady={isStorageConfigured}
        values={
          copy ?? {
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
            experiment: "",
            variant: "",
          }
        }
      />
    </>
  );
}
