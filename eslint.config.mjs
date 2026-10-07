import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

/**
 * ESLint 9 flat config.
 *
 * This replaced `.eslintrc.json` + `npm run lint` = `next lint`. Next 16 removes
 * `next lint` entirely, and `next lint` on 15.5.27 already prints a migration
 * notice on every run, so the command was deprecated output with a lint result
 * attached. CI called it on every push.
 *
 * `eslint-config-next` still ships only eslintrc-shaped configs, so
 * `FlatCompat` bridges them rather than the rules being rewritten by hand —
 * hand-rolling the plugin list is how a project quietly loses the Next-specific
 * rules (`@next/next/no-html-link-for-pages`, the image escape hatches, the
 * React Hook rules) that were the reason for extending the preset in the first
 * place. Only `next/core-web-vitals` is extended, exactly as before; `next` and
 * `next/typescript` were not in `.eslintrc.json` and are not added here, so the
 * rule set is unchanged by this migration.
 *
 * **One behaviour does change, deliberately.** `next lint` only walked
 * `app/`, `pages/`, `components/`, `lib/` and `src/`. The ESLint CLI lints
 * everything not ignored, which brings `scripts/` into scope for the first
 * time — including the 650-line Playwright audit harness and the dependency
 * ratchet that CI runs on every push. Those were never linted before.
 */
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = [
  {
    // ESLint ignores node_modules and dotfiles already; these are the build
    // and coverage outputs that would otherwise be walked.
    ignores: [".next/**", "out/**", "build/**", "coverage/**", "dist/**"],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;
