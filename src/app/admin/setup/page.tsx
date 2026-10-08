import { notFound } from "next/navigation";
import { adminCount } from "@/app/admin/_actions/auth";
import { SetupForm } from "@/components/admin/AuthForms";
import { MIN_PASSWORD_LENGTH } from "@/lib/admin/password";

export const metadata = { title: "Birinchi sozlash" };

/* Exists only until the first admin does, and only when a setup token is configured. */
export default async function AdminSetupPage() {
  if (!process.env.ADMIN_SETUP_TOKEN || (await adminCount()) > 0) notFound();
  return (
    <main className="mx-auto flex min-h-screen max-w-[440px] flex-col justify-center gap-6 px-4 py-10">
      <div>
        <p className="font-logo text-2xl">Go Vita</p>
        <h1 className="mt-2 text-[26px] font-bold">Birinchi administrator</h1>
        <p className="mt-1 text-[15px] text-ink-2">Bu sahifa bitta administrator yaratilgach yopiladi.</p>
      </div>
      <div className="rounded-[20px] bg-bg p-6">
        <SetupForm minPassword={MIN_PASSWORD_LENGTH} />
      </div>
    </main>
  );
}
