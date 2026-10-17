import Link from "next/link";
import { getArticles } from "@/lib/content/blog.sanity";
import type { Article } from "@/lib/content/blog.sanity";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Blog va kontent" };

export default async function AdminContentPage() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const sanityConfigured = Boolean(projectId && projectId !== "placeholder");
  const studioAvailable = sanityConfigured && (process.env.NODE_ENV !== "production" || process.env.SANITY_STUDIO_ENABLED === "on");
  let articles: Article[] = [];
  let cmsReadFailed = false;
  try {
    articles = await getArticles("uz");
  } catch {
    cmsReadFailed = true;
    const { getArticles: getStaticArticles } = await import("@/lib/content/blog");
    articles = getStaticArticles("uz");
  }

  return (
    <>
      <PageHeader
        title="Blog va kontent"
        lead="Blog maqolalarining holatini koʻring, saytdagi koʻrinishini tekshiring va CMSʼga oʻting."
        actions={studioAvailable ? <Link href="/admin/content/studio" className="inline-flex h-11 items-center gap-2 rounded-sm bg-ink px-4 text-[14px] font-semibold text-white hover:bg-black">Go Vita ichida tahrirlash <span aria-hidden="true">↗</span></Link> : undefined}
      />

      {!sanityConfigured && <div className="mb-4 rounded-sm bg-tile p-4 text-[13px] leading-5 text-ink-2"><span className="font-bold">CMS ulanmagan.</span> Sayt hozir ichki statik maqolalardan foydalanadi. Ularni tahrirlash va draft/publish oqimi uchun Sanity project ID hamda Studioʼni sozlash kerak.</div>}
      {cmsReadFailed && <div className="mb-4 rounded-sm border border-red/25 bg-white p-4 text-[13px] leading-5 text-red">CMSʼdan maqolalarni olib boʻlmadi. Roʻyxatda ichki statik kontent koʻrsatilmoqda.</div>}
      {sanityConfigured && !studioAvailable && <div className="mb-4 rounded-sm bg-tile p-4 text-[13px] leading-5 text-ink-2">Sanity project ulangan, lekin production Studio yoqilmagan. Deploy sozlamalarida <code className="rounded bg-white px-1.5 py-0.5">SANITY_STUDIO_ENABLED=on</code> ni yoqing.</div>}

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[["Koʻrinayotgan maqolalar", articles.length], ["Maqola manbasi", sanityConfigured ? "Sanity CMS" : "Statik kontent"], ["Tillar", "UZ / RU"], ["Blog sahifasi", "/uz/blog"]].map(([label, value]) => <div key={label} className="rounded-[20px] border border-line bg-white p-4"><p className="text-[12px] text-muted">{label}</p><p className="mt-2 truncate text-[17px] font-bold text-ink">{value}</p></div>)}
      </div>

      <Card title="Maqolalar roʻyxati" actions={<span className="text-[12px] text-muted">Oʻzbekcha koʻrinish</span>}>
        {articles.length ? <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead><tr className="border-b border-line text-[12px] font-semibold text-muted"><th className="pb-3">Maqola</th><th className="pb-3">Kategoriya</th><th className="pb-3">Sana</th><th className="pb-3">Oʻqish</th><th className="pb-3 text-right">Koʻrish</th></tr></thead>
            <tbody className="divide-y divide-line">
              {articles.map((article) => (
                <tr key={article.slug} className="text-[13px]">
                  <td className="py-3.5 pr-4"><span className="block max-w-[420px] truncate font-semibold text-ink-2">{article.title}</span><span className="mt-1 block max-w-[450px] truncate text-[12px] text-muted">/blog/{article.slug}</span></td>
                  <td className="py-3.5 pr-3 text-ink-2">{article.category}</td>
                  <td className="whitespace-nowrap py-3.5 pr-3 text-muted">{article.date || "—"}</td>
                  <td className="whitespace-nowrap py-3.5 pr-3 text-muted">{article.readingMinutes} daqiqa</td>
                  <td className="py-3.5 text-right"><a href={`/uz/blog/${article.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center rounded-sm border border-line px-3 text-[12px] font-semibold text-ink hover:bg-tile">Maqolani ochish ↗</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> : <p className="py-6 text-center text-[14px] text-muted">Maqolalar topilmadi.</p>}
      </Card>

      <Card title="Kontentni boshqarish" className="mt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl text-[13px] leading-5 text-muted">{sanityConfigured ? "Maqolalarni yaratish, tarjimalar va rasmlarni tahrirlash Sanity Studioʼda amalga oshadi. Sayt maqolalarni shu CMSʼdan oʻqiydi." : "Statik maqolalar roʻyxati faqat koʻrish uchun. Sanity ulanganidan soʻng ushbu paneldan Studioʼga oʻtib maqola yozish va nashr qilish mumkin boʻladi."}</p>
          {studioAvailable ? <Link href="/admin/content/studio" className="inline-flex h-10 shrink-0 items-center justify-center rounded-sm border border-line bg-white px-4 text-[13px] font-semibold text-ink-2 hover:bg-tile">Go Vita ichida tahrirlash</Link> : <Link href="/admin/integrations" className="inline-flex h-10 shrink-0 items-center justify-center rounded-sm border border-line bg-white px-4 text-[13px] font-semibold text-ink-2 hover:bg-tile">Sanity holatini tekshirish</Link>}
        </div>
      </Card>
    </>
  );
}
