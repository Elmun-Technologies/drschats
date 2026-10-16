import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/AuthForms";
import { Logo } from "@/components/layout/Logo";
import { adminCount } from "@/app/admin/_actions/auth";
import { currentAdmin } from "@/lib/admin/session";

export const metadata = { title: "Kirish" };

export default async function AdminLoginPage() {
  if (await currentAdmin()) redirect("/admin");
  const needsSetup = (await adminCount()) === 0;
  return (
    <main className="flex min-h-screen items-center justify-center bg-tile px-4 py-12">
      <div className="w-full max-w-[430px]">
        <Link href="/admin/login" aria-label="Go Vita admin" className="inline-flex"><Logo className="text-[29px]" /></Link>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Xodimlar uchun xavfsiz kirish</p>
        <h1 className="mt-7 text-[29px] font-semibold leading-9 tracking-[-0.03em] text-ink">Admin panelga kirish</h1>
        <p className="mt-2 text-[13px] leading-5 text-muted">Go Vita do‘koni boshqaruv maydoni.</p>
        <div className="mt-6 rounded-md border border-line bg-white p-6 shadow-[0_4px_20px_rgba(23,25,27,0.05)] sm:p-7">
          {needsSetup ? (
            <p className="text-[14px] leading-6 text-ink-2">
              Hali administrator yaratilmagan. <Link href="/admin/setup" className="font-semibold text-forest underline decoration-gold underline-offset-4">Birinchi administratorni yarating</Link>.
            </p>
          ) : <LoginForm />}
        </div>
        <p className="mt-5 text-center text-[10px] text-muted">Kirish faqat vakolatli Go Vita xodimlari uchun.</p>
      </div>
    </main>
  );
}
