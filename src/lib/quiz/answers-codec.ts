import type { QuizAnswers } from "./engine";

/*
  Answers reach the result page so it can be rendered on the server with the
  full product objects, instead of shipping the whole catalogue to the browser.
  The quiz hands them over in a short-lived first-party cookie, not the URL:
  they are health data (pregnancy, medicines), and analytics tags read the URL.
  A legacy `?a=` link still renders.

  Format: `questionId.option1_option2~questionId.option`
*/
export function encodeAnswers(answers: QuizAnswers): string {
  return Object.entries(answers)
    .filter(([, options]) => options.length > 0)
    .map(([id, options]) => `${id}.${options.join("_")}`)
    .join("~");
}

export function decodeAnswers(encoded: string | undefined): QuizAnswers {
  if (!encoded) return {};
  const answers: QuizAnswers = {};
  for (const part of encoded.split("~")) {
    const separator = part.indexOf(".");
    if (separator < 1) continue;
    const id = part.slice(0, separator);
    const options = part.slice(separator + 1).split("_").filter(Boolean);
    if (options.length > 0) answers[id] = options;
  }
  return answers;
}

/** Cookie that carries the encoded answers from the quiz to its result page. */
export const QUIZ_ANSWERS_COOKIE = "gv_quiz";
