"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "@/lib/i18n/navigation";

export function SearchBox() {
  const t = useTranslations("shop");
  const nav = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    setOpen(false);
    router.push({ pathname: "/products", query: { q } });
  }

  return (
    <div className="flex items-center">
      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={submit}
            className="overflow-hidden"
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => !value && setOpen(false)}
              placeholder={t("searchPlaceholder")}
              className="h-10 w-[200px] rounded-full border border-line bg-surface-2 px-4 text-sm text-fg outline-none placeholder:text-faint focus:border-accent"
            />
          </motion.form>
        )}
      </AnimatePresence>
      <button
        onClick={() => {
          if (open) {
            if (value.trim()) router.push({ pathname: "/products", query: { q: value.trim() } });
          } else {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        aria-label={nav("search")}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-fg transition-colors hover:border-line-strong"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
