import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getProgram } from "@/lib/content/programs.sanity";
import { loadProgramPage } from "@/lib/content/program-loader";
import { buildPageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd, faqLd } from "@/lib/seo/jsonld";
import { ProgramTemplate } from "@/components/program/ProgramTemplate";

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const program = await getProgram(slug, locale);
  if (!program) return {};
  return buildPageMetadata({
    locale,
    path: `/programs/${slug}`,
    title: `${program.name} — ${program.headline} | ${SITE_NAME}`,
    description: program.intro,
  });
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [data, t, prod] = await Promise.all([
    loadProgramPage(slug, locale),
    getTranslations("programs"),
    getTranslations("product"),
  ]);
  if (!data) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: prod("breadcrumbHome"), url: `${SITE_URL}/${locale}` },
          { name: t("plural"), url: `${SITE_URL}/${locale}/programs` },
          { name: data.program.name, url: `${SITE_URL}/${locale}/programs/${slug}` },
        ])}
      />
      {data.program.faq.length > 0 && <JsonLd data={faqLd(data.program.faq)} />}
      <ProgramTemplate data={data} locale={locale} />
    </>
  );
}
