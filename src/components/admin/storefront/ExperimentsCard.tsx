import Link from "next/link";
import type { ExperimentResult, ArmResult } from "@/lib/merch/ab-stats";
import { PLACEMENT_LABEL } from "@/lib/merch/model";
import { keepWinner } from "@/app/admin/_actions/experiments";
import { Card, Pill, TableWrap, linkClass, smallButtonClass, somShort, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";
import { t } from "@/lib/admin/i18n/server";

/*
  A/B tests on the banner list: per arm exposures, clicks, CTR and the orders
  of exposed visitors, with a two-proportion z-test on CTR. Below the
  minimum sample it says so instead of naming a winner.
*/

const pct = (v: number) => `${(v * 100).toFixed(v < 0.1 ? 2 : 1).replace(".", ",")}%`;

function verdict(exp: ExperimentResult): { text: string; tone: "dark" | "outline" | "muted" } {
  const zt = exp.test;
  if (!zt || !exp.arms.A || !exp.arms.B) return { text: t("Ikkinchi variant yoʻq"), tone: "muted" };
  if (!zt.enough) return { text: t("Hali yetarli maʼlumot yoʻq"), tone: "muted" };
  const p = zt.p < 0.001 ? "p < 0,001" : `p = ${zt.p.toFixed(3).replace(".", ",")}`;
  if (zt.significant && zt.winner) return { text: `${zt.winner} yaxshiroq (${p})`, tone: "dark" };
  return { text: `Farq ishonchli emas (${p})`, tone: "outline" };
}

function ArmRow({ exp, arm, ctr }: { exp: ExperimentResult; arm: ArmResult; ctr: number }) {
  return (
    <tr>
      <td className={tdClass}>
        <span className="flex items-center gap-2">
          <Pill tone={arm.active ? "dark" : "muted"}>{arm.variant}</Pill>
          <Link href={`/admin/storefront/banners/${arm.id}`} className={linkClass}>{arm.title}</Link>
        </span>
      </td>
      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(arm.exposures)}</td>
      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(arm.visitors)}</td>
      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(arm.clicks)}</td>
      <td className={`${tdClass} text-right font-semibold tabular-nums`}>{arm.exposures ? pct(ctr) : "—"}</td>
      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(arm.orders)}</td>
      <td className={`${tdClass} text-right tabular-nums`}>{somShort(arm.revenue)}</td>
      <td className={tdClass}>
        <div className="flex justify-end">
          {exp.running ? (
            <form action={keepWinner}>
              <input type="hidden" name="experiment" value={exp.key} />
              <input type="hidden" name="variant" value={arm.variant} />
              <button type="submit" className={smallButtonClass} aria-label={`${exp.key}: ${arm.variant} variantini gʻolib sifatida qoldirish`}>
                {t("Gʻolibni qoldirish")}
              </button>
            </form>
          ) : (
            <span className="text-[13px] text-muted">{arm.active ? "Qoldirilgan" : "Oʻchirilgan"}</span>
          )}
        </div>
      </td>
    </tr>
  );
}

export function ExperimentsCard({ experiments }: { experiments: ExperimentResult[] }) {
  if (experiments.length === 0) return null;
  return (
    <Card
      title={t("A/B testlar")}
      lead={t("Har bir tashrif buyuruvchi doim bitta variantni koʻradi (50/50, cookie boʻyicha). Koʻrish — bir kunda bir kishi; CTR — bosgan kishi-kunlar ulushi; buyurtmalar — variantni koʻrgandan keyin shu brauzerdan berilgan buyurtmalar. Ishonchlilik: ikki ulushli z-test, 95%.")}
      className="mb-5"
    >
      <div className="flex flex-col gap-6">
        {experiments.map((exp) => {
          const v = verdict(exp);
          return (
            <section key={exp.key} aria-label={`Tajriba ${exp.key}`} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[16px] font-bold text-ink">{exp.key}</h3>
                <span className="text-[13px] text-muted">{PLACEMENT_LABEL[exp.placement as keyof typeof PLACEMENT_LABEL] ?? exp.placement}</span>
                <Pill tone={v.tone}>{v.text}</Pill>
                {!exp.running && <Pill tone="muted">{t("Toʻxtatilgan")}</Pill>}
                {exp.arms.A && !exp.arms.B && (
                  <Link href={`/admin/storefront/banners/new?from=${exp.arms.A.id}`} className={smallButtonClass}>{t("+ B variant")}</Link>
                )}
              </div>
              <TableWrap>
                <table className={`${tableClass} min-w-[860px]`}>
                  <thead>
                    <tr>
                      <th className={thClass}>{t("Variant")}</th>
                      <th className={`${thClass} text-right`}>{t("Koʻrishlar")}</th>
                      <th className={`${thClass} text-right`}>{t("Kishilar")}</th>
                      <th className={`${thClass} text-right`}>{t("Bosishlar")}</th>
                      <th className={`${thClass} text-right`}>{t("CTR")}</th>
                      <th className={`${thClass} text-right`}>{t("Buyurtma")}</th>
                      <th className={`${thClass} text-right`}>{t("Tushum")}</th>
                      <th className={thClass}><span className="sr-only">{t("Amallar")}</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {exp.arms.A && <ArmRow exp={exp} arm={exp.arms.A} ctr={exp.test?.ctrA ?? (exp.arms.A.exposures ? exp.arms.A.clicks / exp.arms.A.exposures : 0)} />}
                    {exp.arms.B && <ArmRow exp={exp} arm={exp.arms.B} ctr={exp.test?.ctrB ?? (exp.arms.B.exposures ? exp.arms.B.clicks / exp.arms.B.exposures : 0)} />}
                  </tbody>
                </table>
              </TableWrap>
            </section>
          );
        })}
      </div>
    </Card>
  );
}
