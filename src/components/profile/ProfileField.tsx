"use client";

import { useId } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "date";
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
  max?: string;
}

/**
 * One labelled input, styled like the checkout fields.
 *
 * Every profile field is optional and saves as it is typed — there is no
 * submit button on this page, because there is nothing to submit: the data
 * never leaves the browser unless the visitor asks it to.
 */
export function ProfileField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  autoComplete,
  max,
}: Props) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        max={max}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-describedby={hint ? hintId : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-accent"
      />
      {hint && (
        <p id={hintId} className="text-xs text-faint">
          {hint}
        </p>
      )}
    </div>
  );
}
