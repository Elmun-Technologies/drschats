import type { QuizAnswers } from "./engine";

/*
  Answers travel in the URL so a plan is shareable and the result page can be
  rendered on the server with the full product objects, instead of shipping the
  whole catalogue to the browser.

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
