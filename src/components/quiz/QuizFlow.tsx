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

function renderOptionIcon(id: string) {
  if (id.includes("woman")) {
    return (
      <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (id.includes("man")) {
    return (
      <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (id.includes("child")) {
    return (
      <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" /><path d="M9 10h.01" /><path d="M15 10h.01" /><path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
      </svg>
    );
  }
  if (id.includes("parent")) {
    return (
      <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    );
  }
  if (id.includes("fatigue")) {
    return (
      <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
  }
  if (id.includes("sleep")) {
    return (
      <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (id.includes("stress")) {
    return (
      <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
      </svg>
    );
  }
  if (id.includes("colds")) {
    return (
      <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v8m-4-4h8" />
      </svg>
    );
  }
  if (id.includes("hair") || id.includes("beauty")) {
    return (
      <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
      </svg>
    );
  }
  if (id.includes("bones")) {
    return (
      <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="8" width="18" height="8" rx="3" /><circle cx="7" cy="12" r="1.5" /><circle cx="17" cy="12" r="1.5" />
      </svg>
    );
  }
  if (id.includes("heart")) {
    return (
      <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  if (id.includes("focus") || id.includes("brain")) {
    return (
      <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    );
  }
  if (id.includes("sun") || id.includes("almost-none") || id.includes("lt1") || id.includes("1-3") || id.includes("gt3")) {
    return (
      <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

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
      <div className="flex items-center justify-between text-xs sm:text-sm text-muted">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent-strong">
            {t("stepOf", { step: stepIndex + 1, total: visible.length })}
          </span>
          <span className="text-xs text-muted">· ~1.5 daqiqa</span>
        </div>
        <span className="tabular-nums font-semibold text-fg">{progress}%</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("progressLabel")}
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2 p-0.5 shadow-inner"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-amber-500 transition-all duration-500"
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
              className="mt-6 grid gap-3 sm:grid-cols-1"
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
                      "group flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                      isSelected
                        ? "border-amber-400 bg-amber-500/10 text-fg shadow-[0_0_18px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/50"
                        : "border-line bg-surface text-muted hover:border-amber-500/40 hover:text-fg hover:shadow-sm",
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 transition-colors group-hover:bg-amber-500/10">
                        {renderOptionIcon(option.id)}
                      </div>
                      <span className="text-base font-semibold">{option.label}</span>
                    </div>

                    <span
                      aria-hidden
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center border transition-all",
                        question.multiSelect ? "rounded-md" : "rounded-full",
                        isSelected ? "border-amber-500 bg-amber-500 text-ink scale-110" : "border-line-strong",
                      )}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.8">
                          <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Doctor Guidance Tooltip */}
            {question.guidance && (
              <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-800 font-bold">
                    i
                  </div>
                  <div>
                    <span className="font-semibold text-fg block mb-0.5">Tibbiy konsilium izohi:</span>
                    <span className="text-muted leading-relaxed">{question.guidance}</span>
                  </div>
                </div>
              </div>
            )}
          </fieldset>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-fg disabled:opacity-40"
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
            className="rounded-full bg-gradient-to-r from-amber-500 to-accent px-8 py-3.5 text-sm font-bold text-ink transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-40 shadow-md"
          >
            {isLast ? t("finish") : t("next")}
          </button>
        </div>
      </div>
    </div>
  );
}
