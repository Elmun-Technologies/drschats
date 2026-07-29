"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "@/lib/i18n/navigation";
import type { QuizQuestion } from "@/lib/quiz/questions";
import { buildQuizResult, saveQuiz, type QuizAnswers } from "@/lib/quiz/engine";
import { encodeAnswers } from "@/lib/quiz/recommend";
import { track } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

export function QuizFlow({ questions }: { questions: QuizQuestion[] }) {
  const t = useTranslations("quiz");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [submitting, setSubmitting] = useState(false);

  const question = questions[step];
  const selected = useMemo(() => answers[question.id] ?? [], [answers, question.id]);
  const progress = Math.round(((step + 1) / questions.length) * 100);
  const isLast = step === questions.length - 1;

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

  function goNext() {
    if (isLast) {
      finish();
      return;
    }
    track("quiz_step", { step: step + 1, question_id: question.id });
    setStep((s) => Math.min(questions.length - 1, s + 1));
  }

  function finish() {
    setSubmitting(true);
    const result = buildQuizResult(questions, answers);
    saveQuiz(answers, result);
    track("quiz_complete", {
      answered: result.answeredCount,
      top_topic: result.rankedTopics[0] ?? null,
    });
    router.push(`/quiz/result?a=${encodeURIComponent(encodeAnswers(answers))}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{t("stepOf", { step: step + 1, total: questions.length })}</span>
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
            <legend className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {question.question}
            </legend>
            {question.hint && <p className="mt-2 text-sm text-muted">{question.hint}</p>}

            <div className="mt-6 grid gap-3">
              {question.options.map((option) => {
                const isSelected = selected.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    role={question.multiSelect ? "checkbox" : "radio"}
                    aria-checked={isSelected}
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
