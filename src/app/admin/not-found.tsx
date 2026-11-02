import Link from "next/link";
import { buttonClass } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-[28px] font-bold leading-9">Topilmadi</h1>
      <p className="text-[15px] leading-6 text-ink-2">Bunday yozuv yoki sahifa yoʻq — oʻchirilgan boʻlishi yoki havola eskirgan boʻlishi mumkin.</p>
      <Link href="/admin" className={buttonClass}>
        Bosh panel
      </Link>
    </main>
  );
}
