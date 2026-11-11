import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { requireAdmin, twoFactorRequired } from "@/lib/admin/session";
import { otpauthUrl } from "@/lib/admin/totp";
import { openTotpSecret } from "@/lib/admin/totp-store";
import { ROLE_HINT, ROLE_LABEL } from "@/lib/admin/roles";
import { MIN_PASSWORD_LENGTH } from "@/lib/admin/password";
import { changePassword, disableTwoFactor, startTwoFactor } from "@/app/admin/_actions/accounts";
import { logoutEverywhere } from "@/app/admin/_actions/auth";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmTwoFactorForm, RegenerateCodesForm } from "@/components/admin/TwoFactorForms";
import { Card, Field, Notice, PageHeader, Pill, buttonClass, inputClass, secondaryButtonClass } from "@/components/admin/ui";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Xavfsizlik");
export const dynamic = "force-dynamic";

/* Every role: my password, my two-factor sign-in, my sessions. */
export default async function AdminSecurityPage({ searchParams }: { searchParams: Promise<{ setup?: string; enrol?: string }> }) {
  const me = await requireAdmin();
  const params = await searchParams;
  const [user] = await getDb().select().from(adminUsers).where(eq(adminUsers.id, me.id)).limit(1);
  const required = await twoFactorRequired();
  const pendingSecret = !user?.totpEnabledAt && user?.totpSecret ? openTotpSecret(user.totpSecret, me.id) : null;
  const setup = params.setup === "1" && pendingSecret ? pendingSecret : null;
  const qr = setup ? await QRCode.toDataURL(otpauthUrl(setup, me.email), { margin: 1, width: 220, errorCorrectionLevel: "M" }) : null;
  const codesLeft = user?.recoveryCodes?.length ?? 0;

  return (
    <>
      <PageHeader title={t("Xavfsizlik")} lead={<span className="inline-flex flex-wrap items-center gap-2"><Pill tone="dark">{t(ROLE_LABEL[me.role])}</Pill><span className="text-ink-2">{t(ROLE_HINT[me.role])}</span></span>} />
      {required && !me.twoFactor && <div className="mb-4"><Notice tone="error">{t("Doʻkon egasi ikki bosqichli kirishni majburiy qilgan. Uni yoqmaguncha panelning boshqa sahifalari ochilmaydi.")}</Notice></div>}
      <div className="flex flex-col gap-4">
        <Card
          title={t("Ikki bosqichli kirish")}
          lead={t("Parolga qoʻshimcha — telefondagi autentifikator ilovasi (Google Authenticator, Microsoft Authenticator, 1Password) beradigan 6 xonali kod. Parol sizsa ham panelga kirib boʻlmaydi.")}
          actions={<Pill tone={me.twoFactor ? "dark" : "outline"}>{me.twoFactor ? t("Yoqilgan") : t("Oʻchiq")}</Pill>}
        >
          {me.twoFactor ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                <p className="text-[14px] text-ink-2">{t("Ishlatilmagan tiklash kodlari: {n} ta.", { n: codesLeft })}{codesLeft <= 3 && ` ${t("Yangilarini yarating.")}`}</p>
                <RegenerateCodesForm />
              </div>
              <div className="flex flex-col gap-3 border-t border-line pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <p className="text-[14px] font-semibold text-ink">{t("Oʻchirib qoʻyish")}</p>
                <ActionForm action={disableTwoFactor} submitLabel={t("Ikki bosqichli kirishni oʻchirish")} className="flex flex-col gap-4">
                  <Field label={t("Parol")}><input name="password" type="password" autoComplete="current-password" required className={inputClass} /></Field>
                  <Field label={t("Ilovadagi kod")}><input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={8} required className={inputClass} /></Field>
                </ActionForm>
              </div>
            </div>
          ) : setup && qr ? (
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              {/* eslint-disable-next-line @next/next/no-img-element -- a data: URL generated on the server, nothing to optimise */}
              <img src={qr} alt={t("Autentifikator ilovasi uchun QR kod")} width={220} height={220} className="rounded-[12px] border border-line bg-white" />
              <div className="flex flex-col gap-4">
                <ol className="list-decimal pl-5 text-[14px] leading-6 text-ink-2">
                  <li>{t("Ilovada «+» → «QR kodni skanerlash».")}</li>
                  <li>{t("Skaner boʻlmasa — kalitni qoʻlda kiriting:")} <code className="break-all rounded-[8px] bg-tile px-2 py-0.5 text-[13px] text-ink">{setup.match(/.{1,4}/g)?.join(" ")}</code></li>
                  <li>{t("Ilova koʻrsatgan kodni pastga yozing.")}</li>
                </ol>
                <ConfirmTwoFactorForm />
              </div>
            </div>
          ) : (
            <form action={startTwoFactor}>
              <button type="submit" className={buttonClass}>{t("Ikki bosqichli kirishni sozlash")}</button>
            </form>
          )}
          {params.enrol === "1" && !me.twoFactor && !setup && <p className="mt-3 text-[13px] text-muted">{t("Sozlash 2 daqiqa oladi.")}</p>}
        </Card>

        <Card title={t("Parol")} lead={t("Parol almashtirilganda boshqa qurilmalardagi sessiyalar yopiladi.")}>
          <ActionForm action={changePassword} submitLabel={t("Parolni almashtirish")} className="grid gap-4 lg:grid-cols-2">
            <Field label={t("Joriy parol")}><input name="current" type="password" autoComplete="current-password" required className={inputClass} /></Field>
            <Field label={t("Yangi parol")} hint={t("Kamida {n} belgi", { n: MIN_PASSWORD_LENGTH })}><input name="next" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required className={inputClass} /></Field>
          </ActionForm>
          <form action={logoutEverywhere} className="mt-4 border-t border-line pt-4">
            <button type="submit" className={secondaryButtonClass}>{t("Barcha qurilmalardan chiqish")}</button>
          </form>
        </Card>
      </div>
    </>
  );
}
