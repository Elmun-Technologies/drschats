"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { Locale } from "@/lib/i18n/routing";
import { useUpsell } from "@/lib/upsell/store";
import { formatMoney } from "@/lib/utils";

export function UpsellSavingsBar() {
  const locale = useLocale() as Locale;
  const t = useTranslations("upsell");
  const { steps, cumulativeSavings, shown } = useUpsell();

  if (!shown || cumulativeSavings === 0) return null;

  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.cumulativeSavings <= cumulativeSavings).length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="border-t border-line px-6 py-3"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-accent">
          {t("progressLabel", { amount: formatMoney(cumulativeSavings, locale) })}
        </span>
        <span className="text-faint">
          {t("progressSteps", { done: completedSteps, total: totalSteps })}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-accent"
        />
      </div>
    </motion.div>
  );
}
