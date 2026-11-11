import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/AuthForms";
import { Logo } from "@/components/layout/Logo";
import { adminCount } from "@/lib/admin/accounts";
import { currentAdmin } from "@/lib/admin/session";
import { adminTitle, initAdminLocale, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Kirish");

export default async function AdminLoginPage() {
  await initAdminLocale();
  if (await currentAdmin()) redirect("/admin");
  const needsSetup = (await adminCount()) === 0;
  return (
    <main className="flex min-h-screen items-center justify-center bg-tile px-4 py-12">
      <div className="w-full max-w-[430px]">
        <Link href="/admin/login" aria-label="govita admin" className="inline-flex"><Logo className="h-10" priority /></Link>
        <p className="mt-2 text-[14px] text-muted">{t("Xodimlar uchun boshqaruv paneli")}</p>
        <h1 className="mt-8 text-[28px] font-bold leading-[34px] text-ink">{t("Admin panelga kirish")}</h1>
        <p className="mt-2 text-[15px] leading-[23px] text-ink-2">{t("govita doʻkoni boshqaruv maydoni.")}</p>
        <div className="mt-6 rounded-[20px] bg-white p-6 sm:p-7">
          {needsSetup ? (
            <p className="text-[14px] leading-6 text-ink-2">
              {t("Hali administrator yaratilmagan.")} <Link href="/admin/setup" className="font-semibold text-ink underline underline-offset-4">{t("Birinchi administratorni yarating")}</Link>.
            </p>
          ) : <LoginForm />}
        </div>
        <p className="mt-5 text-center text-[13px] text-muted">{t("Kirish faqat vakolatli govita xodimlari uchun.")}</p>
      </div>
    </main>
  );
}
