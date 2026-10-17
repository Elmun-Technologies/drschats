"use client";

import { useState } from "react";
import { smallButtonClass } from "./ui";

export function CopyButton({ text, label = "Nusxalash" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={smallButtonClass}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          setDone(false);
        }
      }}
    >
      <span aria-live="polite">{done ? "Nusxalandi" : label}</span>
    </button>
  );
}
