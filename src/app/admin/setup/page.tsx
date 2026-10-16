import Link from "next/link";
import { notFound } from "next/navigation";
import { SetupForm } from "@/components/admin/AuthForms";
import { Logo } from "@/components/layout/Logo";
import { adminCount } from "@/app/admin/_actions/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/admin/password";

export const metadata = { title: "Birinchi sozlash" };

/* Exists only until the first admin does, and only when a setup token is configured. */
export default async function AdminSetupPage() {
  if (!process.env.ADMIN_SETUP_TOKEN || (await adminCount()) > 0) notFound();
  return (
    <main className="flex min-h-screen items-center justify-center bg-tile px-4 py-12">
      <div className="w-full max-w-[460px]">
        <Link href="/admin/login" aria-label="Go Vita admin" className="inline-flex"><Logo className="text-[29px]" /></Link>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Xodimlar uchun xavfsiz kirish</p>
        <h1 className="mt-7 text-[29px] font-semibold leading-9 tracking-[-0.03em] text-ink">Birinchi administrator</h1>
        <p className="mt-2 text-[13px] leading-5 text-muted">Bu sozlash sahifasi birinchi administrator yaratilgach avtomatik yopiladi.</p>
        <div className="mt-6 rounded-md border border-line bg-white p-6 shadow-[0_4px_20px_rgba(23,25,27,0.05)] sm:p-7">
          <SetupForm minPassword={MIN_PASSWORD_LENGTH} />
        </div>
        <p className="mt-5 text-center text-[10px] text-muted"><Link href="/admin/login" className="font-semibold text-forest hover:underline">Kirish sahifasiga qaytish</Link></p>
      </div>
    </main>
  );
}
