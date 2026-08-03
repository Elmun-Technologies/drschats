"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "@/lib/i18n/navigation";
import { visibleQuestions, type QuizQuestion } from "@/lib/quiz/questions";
import { buildQuizResult, saveQuiz, type QuizAnswers } from "@/lib/quiz/engine";
import { encodeAnswers } from "@/lib/quiz/recommend";
import { useProfile } from "@/lib/profile/store";
import { track } from "@/lib/analytics/events";
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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{t("stepOf", { step: stepIndex + 1, total: visible.length })}</span>
        <span className="tabular-nums">{progress}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("progressLabel")}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2"
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          <fieldset>
            <legend id={`q-${question.id}`} className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {question.question}
            </legend>
            {question.hint && <p className="mt-2 text-sm text-muted">{question.hint}</p>}

            {/* role="radio" has to be owned by a radiogroup — a fieldset maps to
                plain `group`, which leaves the radios unowned and costs the
                "N of M" position a screen reader would otherwise announce. */}
            <div
              ref={optionsRef}
              role={question.multiSelect ? undefined : "radiogroup"}
              aria-labelledby={question.multiSelect ? undefined : `q-${question.id}`}
              onKeyDown={onOptionKeyDown}
              className="mt-6 grid gap-3"
            >
              {question.options.map((option, index) => {
                const isSelected = selected.includes(option.id);
                // Roving tabindex: Tab reaches the group once, arrows move within.
                const roving = question.multiSelect
                  ? undefined
                  : isSelected || (selected.length === 0 && index === 0)
                    ? 0
                    : -1;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role={question.multiSelect ? "checkbox" : "radio"}
                    aria-checked={isSelected}
                    tabIndex={roving}
                    onClick={() => toggle(option.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      isSelected
                        ? "border-accent bg-accent-soft text-fg"
                        : "border-line bg-surface text-muted hover:border-line-strong hover:text-fg",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center border transition-colors",
                        question.multiSelect ? "rounded-md" : "rounded-full",
                        isSelected ? "border-accent bg-accent text-ink" : "border-line-strong",
                      )}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.6">
                          <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-fg disabled:opacity-40"
        >
          {t("back")}
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goNext}
            className="rounded-full px-4 py-2.5 text-sm font-medium text-faint transition-colors hover:text-fg"
          >
            {t("skip")}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={selected.length === 0 || submitting}
            className="rounded-full bg-accent px-7 py-3 text-sm font-bold text-ink transition-all hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-40"
          >
            {isLast ? t("finish") : t("next")}
          </button>
        </div>
      </div>
    </div>
  );
}
