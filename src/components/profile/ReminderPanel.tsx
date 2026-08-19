"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useProfile } from "@/lib/profile/store";
import { dueReminders, type Reminder } from "@/lib/profile/reminders";
import { getPurchaseEvents, getUserProfile } from "@/lib/personalization/tracker";
import { loadQuiz } from "@/lib/quiz/engine";

/*
  What we would say, and when — shown before anything is sent.

  A reminder programme that a customer can only discover by receiving one is a
  programme they cannot judge. This panel is the same rules the email and
  Telegram senders use, rendered in the open: these are the dates we hold,
  this is what is due, and the toggles that decide whether it goes anywhere are
  directly beneath it.
*/
export function ReminderPanel() {
  const t = useTranslations("profile.reminders");
  const profile = useProfile((s) => s.profile);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const behaviour = getUserProfile();
    setReminders(
      dueReminders({
        profile,
        purchases: behaviour ? getPurchaseEvents(behaviour) : [],
        quizSavedAt: loadQuiz()?.savedAt,
        now: new Date(),
      }),
    );
  }, [profile]);

  return (
    <section aria-labelledby="profile-reminders">
      <h2 id="profile-reminders" className="font-display text-lg font-bold tracking-tight">
        {t("title")}
      </h2>
      <p className="mt-1 text-sm text-muted">{t("description")}</p>

      {reminders.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-line px-4 py-5 text-sm text-muted">
          {t("empty")}
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {reminders.map((reminder) => (
            <li
              key={reminder.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-line bg-surface px-4 py-3"
            >
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
                {reminder.daysUntil === 0 ? t("today") : t("inDays", { days: reminder.daysUntil })}
              </span>
              <span className="text-sm text-fg">{describe(reminder, t)}</span>
              {reminder.kind === "reorder" && reminder.productSlug && (
                <Link
                  href={`/product/${reminder.productSlug}`}
                  className="text-sm font-semibold text-accent-strong underline-offset-4 hover:underline"
                >
                  {t("reorderCta")}
                </Link>
              )}
              {reminder.kind === "quiz-refresh" && (
                <Link
                  href="/quiz"
                  className="text-sm font-semibold text-accent-strong underline-offset-4 hover:underline"
                >
                  {t("quizCta")}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type Translator = ReturnType<typeof useTranslations<"profile.reminders">>;

function describe(reminder: Reminder, t: Translator): string {
  const who = reminder.memberName ?? "";

  switch (reminder.kind) {
    case "birthday":
      if (!who) {
        return reminder.age
          ? t("birthdaySelfAge", { age: reminder.age })
          : t("birthdaySelf");
      }
      return reminder.age
        ? t("birthdayMemberAge", { name: who, age: reminder.age })
        : t("birthdayMember", { name: who });
    case "child-season":
      return who ? t("schoolNamed", { name: who }) : t("school");
    case "reorder":
      return reminder.productName
        ? t("reorderNamed", { name: reminder.productName })
        : t("reorder");
    case "quiz-refresh":
      return t("quizStale");
  }
}
