import Link from "next/link";
import { notFound } from "next/navigation";
import { SetupForm } from "@/components/admin/AuthForms";
import { Logo } from "@/components/layout/Logo";
import { adminCount } from "@/lib/admin/accounts";
import { MIN_PASSWORD_LENGTH } from "@/lib/admin/password";

export const metadata = { title: "Birinchi sozlash" };

/* Exists only until the first admin does, and only when a setup token is configured. */
export default async function AdminSetupPage() {
  if (!process.env.ADMIN_SETUP_TOKEN || (await adminCount()) > 0) notFound();
  return (
    <main className="flex min-h-screen items-center justify-center bg-tile px-4 py-12">
      <div className="w-full max-w-[460px]">
        <Link href="/admin/login" aria-label="Go Vita admin" className="inline-flex"><Logo className="text-[34px]" /></Link>
        <p className="mt-2 text-[14px] text-muted">Xodimlar uchun boshqaruv paneli</p>
        <h1 className="mt-8 text-[28px] font-bold leading-[34px] text-ink">Birinchi administrator</h1>
        <p className="mt-2 text-[15px] leading-[23px] text-ink-2">Bu sozlash sahifasi birinchi administrator yaratilgach avtomatik yopiladi.</p>
        <div className="mt-6 rounded-[20px] bg-white p-6 sm:p-7">
          <SetupForm minPassword={MIN_PASSWORD_LENGTH} />
        </div>
        <p className="mt-5 text-center text-[13px] text-muted"><Link href="/admin/login" className="font-semibold text-ink underline underline-offset-4">Kirish sahifasiga qaytish</Link></p>
      </div>
    </main>
  );
}
