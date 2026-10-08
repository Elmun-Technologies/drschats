import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin/session";
import { adminCount } from "@/app/admin/_actions/auth";
import { LoginForm } from "@/components/admin/AuthForms";
import Link from "next/link";

export const metadata = { title: "Kirish" };

export default async function AdminLoginPage() {
  if (await currentAdmin()) redirect("/admin");
  const needsSetup = (await adminCount()) === 0;
  return (
    <main className="mx-auto flex min-h-screen max-w-[400px] flex-col justify-center gap-6 px-4">
      <div>
        <p className="font-logo text-2xl">Go Vita</p>
        <h1 className="mt-2 text-[26px] font-bold">Admin panelga kirish</h1>
      </div>
      <div className="rounded-[20px] bg-bg p-6">
        {needsSetup ? (
          <p className="text-[15px] text-ink-2">
            Hali administrator yoʻq.{" "}
            <Link href="/admin/setup" className="font-semibold underline">Birinchi administratorni yarating</Link>.
          </p>
        ) : (
          <LoginForm />
        )}
      </div>
    </main>
  );
}
