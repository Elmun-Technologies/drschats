import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/AuthForms";
import { Logo } from "@/components/layout/Logo";
import { adminCount } from "@/lib/admin/accounts";
import { currentAdmin } from "@/lib/admin/session";

export const metadata = { title: "Kirish" };

export default async function AdminLoginPage() {
  if (await currentAdmin()) redirect("/admin");
  const needsSetup = (await adminCount()) === 0;
  return (
    <main className="flex min-h-screen items-center justify-center bg-tile px-4 py-12">
      <div className="w-full max-w-[430px]">
        <Link href="/admin/login" aria-label="Go Vita admin" className="inline-flex"><Logo className="text-[34px]" /></Link>
        <p className="mt-2 text-[14px] text-muted">Xodimlar uchun boshqaruv paneli</p>
        <h1 className="mt-8 text-[28px] font-bold leading-[34px] text-ink">Admin panelga kirish</h1>
        <p className="mt-2 text-[15px] leading-[23px] text-ink-2">Go Vita doʻkoni boshqaruv maydoni.</p>
        <div className="mt-6 rounded-[20px] bg-white p-6 sm:p-7">
          {needsSetup ? (
            <p className="text-[14px] leading-6 text-ink-2">
              Hali administrator yaratilmagan. <Link href="/admin/setup" className="font-semibold text-ink underline underline-offset-4">Birinchi administratorni yarating</Link>.
            </p>
          ) : <LoginForm />}
        </div>
        <p className="mt-5 text-center text-[13px] text-muted">Kirish faqat vakolatli Go Vita xodimlari uchun.</p>
      </div>
    </main>
  );
}
