import Link from "next/link";
import { buttonClass } from "@/components/admin/ui";
import { t } from "@/lib/admin/i18n/server";

export default function AdminNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-[28px] font-bold leading-9">{t("Topilmadi")}</h1>
      <p className="text-[15px] leading-6 text-ink-2">{t("Bunday yozuv yoki sahifa yoʻq — oʻchirilgan boʻlishi yoki havola eskirgan boʻlishi mumkin.")}</p>
      <Link href="/admin" className={buttonClass}>
        {t("Bosh panel")}
      </Link>
    </main>
  );
}
