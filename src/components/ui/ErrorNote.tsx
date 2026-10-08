import type { ReactNode } from "react";

/*
  One way to say "that did not work".

  This lived inside AuthForm as a private component, and the restock form was
  about to grow its own version of the same paragraph. Two error styles on one
  site is how a design system starts lying about itself — a visitor learns what
  a red note means on the sign-in form and then meets a different red note
  somewhere else.

  `role="alert"` is what makes it announced rather than merely visible: the
  message appears after a submit, so without it a screen reader user is left on
  a form that silently refused them.
*/
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg bg-red/10 px-3 py-2 text-sm font-medium text-red">
      {children}
    </p>
  );
}
