import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VerifyForm } from "@/components/admin/AuthForms";
import { Logo } from "@/components/layout/Logo";
import { PENDING_2FA_COOKIE } from "@/lib/admin/cookie";
import { currentAdmin, readPendingToken } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Tasdiqlash kodi");
export const dynamic = "force-dynamic";

export default async function AdminVerifyPage() {
  if (await currentAdmin()) redirect("/admin");
  if (!readPendingToken((await cookies()).get(PENDING_2FA_COOKIE)?.value)) redirect("/admin/login");
  return (
    <main className="flex min-h-screen items-center justify-center bg-tile px-4 py-12">
      <div className="w-full max-w-[430px]">
        <Link href="/admin/login" aria-label={t("govita admin")} className="inline-flex"><Logo className="h-10" priority /></Link>
        <h1 className="mt-8 text-[28px] font-bold leading-[34px] text-ink">{t("Tasdiqlash kodi")}</h1>
        <p className="mt-2 text-[15px] leading-[23px] text-ink-2">{t("Autentifikator ilovasidagi 6 xonali kodni kiriting. Telefon yoʻq boʻlsa — tiklash kodlaridan birini.")}</p>
        <div className="mt-6 rounded-[20px] bg-white p-6 sm:p-7">
          <VerifyForm />
        </div>
        <p className="mt-5 text-center text-[13px] text-muted"><Link href="/admin/login" className="underline underline-offset-4">{t("Boshqa hisob bilan kirish")}</Link></p>
      </div>
    </main>
  );
}
