"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { visibleQuestions, type QuizQuestion } from "@/lib/quiz/questions";
import { buildQuizResult, saveQuiz, type QuizAnswers } from "@/lib/quiz/engine";
import { encodeAnswers } from "@/lib/quiz/recommend";
import { useProfile } from "@/lib/profile/store";
import { track } from "@/lib/analytics/events";
import { AUDIENCE_PHOTOS, audienceSubtitleKey } from "@/lib/content/audience";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function QuizFlow({
  questions,
  initialAnswers,
}: {
  questions: QuizQuestion[];
  /** Pre-filled from the URL when the visitor arrived having already answered. */
  initialAnswers?: QuizAnswers;
}) {
  const t = useTranslations("quiz");
  const tv = useTranslations("quiz.v3");
  const ta = useTranslations("home.audience");
  const router = useRouter();
  // Start past whatever arrived answered, so a shortcut saves a step instead
  // of re-asking what the visitor just told us.
  const [step, setStep] = useState(() => Object.keys(initialAnswers ?? {}).length);
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers ?? {});
  const [submitting, setSubmitting] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const applyQuiz = useProfile((s) => s.applyQuiz);

  /*
    Recomputed from the answers rather than fixed up front, so going back and
    changing an earlier answer can bring a later question back as well as
    remove one. `step` indexes this list, and is clamped because the list can
    shrink under it.
  */
  const visible = useMemo(() => visibleQuestions(questions, answers), [questions, answers]);
  const stepIndex = Math.min(step, visible.length - 1);
  const question = visible[stepIndex];
  const selected = useMemo(() => answers[question.id] ?? [], [answers, question.id]);
  const progress = Math.round(((stepIndex + 1) / visible.length) * 100);
  const photos = question.options.every((o) => AUDIENCE_PHOTOS[o.id]);
  const lead = question.hint ?? (stepIndex === 0 ? tv("lead") : undefined);
  const isLast = stepIndex === visible.length - 1;

  function toggle(optionId: string) {
    setAnswers((prev) => {
      const current = prev[question.id] ?? [];
      if (question.multiSelect) {
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [question.id]: next };
      }
      return { ...prev, [question.id]: [optionId] };
    });
  }

  /*
    Arrow-key movement inside the radio group. The options already announce
    themselves as radios, so a screen-reader user arrives expecting arrows to
    move between them — without this the role promises a behaviour the widget
    doesn't have. Checkbox questions keep plain Tab, which is their pattern.
  */
  function onOptionKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (question.multiSelect) return;
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"];
    if (!keys.includes(event.key)) return;
    const items = Array.from(
      optionsRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [],
    );
    if (items.length === 0) return;
    event.preventDefault();
    const from = items.findIndex((el) => el === document.activeElement);
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    const next = from < 0 ? 0 : (from + (forward ? 1 : -1) + items.length) % items.length;
    items[next].focus();
    toggle(question.options[next].id);
  }

  function goNext() {
    if (isLast) {
      finish();
      return;
    }
    track("quiz_step", { step: step + 1, question_id: question.id });
    setStep(() => Math.min(visible.length - 1, stepIndex + 1));
  }

  function finish() {
    setSubmitting(true);
    // Only the questions actually asked — a skipped one has no answer
    // and must not count against the answered total.
    const result = buildQuizResult(visible, answers);
    saveQuiz(answers, result);
    // The consultant's conclusion is also a statement about the visitor, so it
    // seeds the saved profile — otherwise someone who has just answered eleven
    // questions about themselves arrives on /profile to an empty page.
    applyQuiz(result.rankedTopics, result.rankedIngredients);
    track("quiz_complete", {
      answered: result.answeredCount,
      top_topic: result.rankedTopics[0] ?? null,
    });
    router.push(`/quiz/result?a=${encodeURIComponent(encodeAnswers(answers))}`);
  }


  const backIcon = (
    <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );

  return (
    <div className="mx-auto flex max-w-[1032px] flex-col gap-5 lg:gap-7">
      <div className="flex flex-col gap-2.5 lg:gap-3">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            aria-label={t("back")}
            className="-ml-2.5 flex h-11 w-11 items-center justify-center rounded-sm disabled:opacity-30 lg:hidden"
          >
            {backIcon}
          </button>
          <span className="text-[15px] font-semibold lg:text-ink-2">
            {t("eyebrow")}
            <span className="lg:hidden"> · {t("stepOf", { step: stepIndex + 1, total: visible.length })}</span>
          </span>
          <span className="hidden text-[15px] font-semibold tabular-nums lg:inline">
            {t("stepOf", { step: stepIndex + 1, total: visible.length })}
          </span>
          <Link href="/" aria-label={tv("close")} className="-mr-2.5 flex h-11 w-11 items-center justify-center rounded-sm lg:hidden">
            <svg viewBox="0 0 24 24" aria-hidden className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </Link>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("progressLabel")}
          className="flex gap-1.5"
        >
          {visible.map((q, i) => (
            <span key={q.id} className={cn("h-1.5 flex-1 rounded-[3px] transition-colors", i <= stepIndex ? "bg-ink" : "bg-chip-strong")} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-5 lg:gap-7"
        >
          <div className="flex flex-col gap-2 lg:gap-2.5">
            <h1 id={`q-${question.id}`} className="text-[28px] font-bold leading-[34px] lg:text-[40px] lg:leading-[46px]">
              {question.question}
            </h1>
            {lead && (
              <p className="text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">
                {question.hint ?? (
                  <>
                    <span className="hidden lg:inline">{lead}</span>
                    <span className="lg:hidden">{tv("leadShort")}</span>
                  </>
                )}
              </p>
            )}
          </div>

          {/* role="radio" has to be owned by a radiogroup, or the radios lose
              the "N of M" position a screen reader would announce. */}
          <div
            ref={optionsRef}
            role={question.multiSelect ? "group" : "radiogroup"}
            aria-labelledby={`q-${question.id}`}
            onKeyDown={onOptionKeyDown}
            className={cn("grid gap-2.5", photos ? "lg:grid-cols-3 lg:gap-4" : "lg:grid-cols-2 lg:gap-3")}
          >
            {question.options.map((option, index) => {
              const isSelected = selected.includes(option.id);
              // Roving tabindex: Tab reaches the group once, arrows move within.
              const roving = question.multiSelect
                ? undefined
                : isSelected || (selected.length === 0 && index === 0)
                  ? 0
                  : -1;
              const photo = photos ? AUDIENCE_PHOTOS[option.id] : undefined;
              const subtitle = photo ? ta(audienceSubtitleKey(option.id)) : undefined;
              return (
                <button
                  key={option.id}
                  type="button"
                  role={question.multiSelect ? "checkbox" : "radio"}
                  aria-checked={isSelected}
                  tabIndex={roving}
                  onClick={() => toggle(option.id)}
                  className={cn(
                    "relative flex items-center gap-3.5 rounded-[16px] border-2 bg-tile p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
                    photo ? "lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-hidden lg:rounded-[20px] lg:p-0" : "min-h-16 px-4 py-3",
                    isSelected ? "border-ink" : "border-transparent hover:bg-tile-hover",
                  )}
                >
                  {photo && (
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px] lg:aspect-[4/3] lg:h-auto lg:w-full lg:rounded-none">
                      <Image
                        src={photo.src}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 64px, 330px"
                        className="object-cover"
                        style={{ objectPosition: photo.position }}
                      />
                    </span>
                  )}
                  <span className={cn("flex min-w-0 flex-1 flex-col gap-0.5", photo && "lg:px-[18px] lg:pb-[18px] lg:pt-4")}>
                    <span className={cn("font-bold", photo ? "text-[17px] lg:text-[19px]" : "text-base lg:text-[17px]")}>{option.label}</span>
                    {subtitle && <span className="text-sm leading-[19px] text-ink-2">{subtitle}</span>}
                  </span>
                  <Indicator selected={isSelected} multi={question.multiSelect} photo={Boolean(photo)} />
                </button>
              );
            })}
          </div>

          {question.guidance && (
            <p className="rounded-[16px] bg-tile px-4 py-3.5 text-sm leading-5 text-ink-2 lg:px-5 lg:text-[15px] lg:leading-[22px]">
              <span className="font-semibold text-ink">{t("guidanceLabel")}:</span> {question.guidance}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Phones: the two forward actions sit in a fixed bar above the tab bar;
          `data-buy-bar` makes the footer and toasts step around it. */}
      <div
        data-buy-bar
        className="fixed inset-x-0 bottom-[var(--tab-bar)] z-40 flex h-[var(--buy-bar)] items-center gap-2.5 border-t border-line bg-bg px-4 lg:static lg:h-auto lg:justify-between lg:border-0 lg:px-0 lg:pt-2"
      >
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="hidden bg-transparent disabled:opacity-40 lg:inline-flex"
        >
          {backIcon}
          {t("back")}
        </Button>
        <div className="flex flex-1 gap-2.5 lg:flex-none lg:gap-2">
          <Button variant="light" onClick={goNext} className="flex-1 lg:flex-none">
            <span className="lg:hidden">{tv("skipShort")}</span>
            <span className="hidden lg:inline">{t("skip")}</span>
          </Button>
          <Button onClick={goNext} disabled={selected.length === 0 || submitting} className="flex-[1.6] lg:flex-none lg:px-8">
            {isLast ? t("finish") : t("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Indicator({ selected, multi, photo }: { selected: boolean; multi: boolean; photo: boolean }) {
  const check = (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
  return (
    <>
      {photo && (
        <span
          aria-hidden
          className={cn(
            "absolute right-3.5 top-3.5 hidden h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white lg:flex",
            selected ? "bg-ink" : "bg-ink/25",
          )}
        >
          {selected && check}
        </span>
      )}
      <span
        aria-hidden
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center border-2",
          multi ? "rounded-[7px]" : "rounded-full",
          selected ? "border-ink" : "border-[#8A8F95]",
          multi && selected && "bg-ink text-white",
          photo && "lg:hidden",
        )}
      >
        {selected && (multi ? check : <span className="h-3 w-3 rounded-full bg-ink" />)}
      </span>
    </>
  );
}
