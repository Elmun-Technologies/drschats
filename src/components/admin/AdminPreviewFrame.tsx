import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export function AdminPreviewFrame({ children }: { children: ReactNode }) {
  return (
    <AdminShell
      admin={{ name: "Demo administrator", email: "Mahalliy preview" }}
      previewMode
      logout={<span className="rounded-sm bg-[#fbf6eb] px-2 py-1 text-[9px] font-bold text-[#806a3e]">DEMO</span>}
    >
      <div className="mb-5 rounded-sm border border-gold/25 bg-[#fbf6eb] px-4 py-3 text-[11px] leading-5 text-[#806a3e]">
        <strong>Demo interfeysi.</strong> Raqamlar faqat ko‘rinish uchun — haqiqiy buyurtma yoki mijoz maʼlumoti emas. Sahifalar faqat ko‘rish uchun; o‘zgartirishlar saqlanmaydi.
      </div>
      {children}
    </AdminShell>
  );
}
