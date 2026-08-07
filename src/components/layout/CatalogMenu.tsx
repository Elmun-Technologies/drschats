"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { getCategoryIcon } from "@/lib/shop/category-icons";
import type { Category } from "@/lib/shopflow/types";
import { isNavigable } from "@/lib/content/nav-sections";

/*
  The catalogue button every marketplace has, and the one thing a nav bar full
  of links cannot do: show the whole shop at once.

  The health entries sit in their own column rather than mixed among the
  categories. Someone opening this menu is browsing by product; someone who
  does not know which product they need is browsing by problem. Both belong
  here, but they are different questions and reading them as one list makes
  neither easy to scan.
*/
const HEALTH_LINKS = [
  { key: "quiz", href: "/quiz" },
  { key: "goals", href: "/goals" },
  { key: "symptoms", href: "/symptoms" },
  { key: "programs", href: "/programs" },
  { key: "vitamins", href: "/vitamins" },
] as const;

export function CatalogMenu({
  categories,
  topicPaths = [],
}: {
  categories: Category[];
  topicPaths?: string[];
}) {
  const healthLinks = HEALTH_LINKS.filter((l) => isNavigable(l.href, topicPaths));
  const t = useTranslations("nav");
  const health = useTranslations("health");
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Navigating away is a decision; the menu should not survive it.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setOpen(false);
      // Escape has to hand focus back, otherwise it lands on <body> and the
      // next Tab restarts from the top of the page.
      buttonRef.current?.focus();
    }
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  if (categories.length === 0) {
    return (
      <Link href="/products" className={TRIGGER_CLASS}>
        <BurgerIcon />
        {t("shopByCategories")}
      </Link>
    );
  }

  return (
    <div ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={TRIGGER_CLASS}
      >
        {open ? <CloseIcon /> : <BurgerIcon />}
        {t("shopByCategories")}
      </button>

      {open && (
        <>
          {/* Dims the page under the panel and gives a dismiss target on touch
              devices, where "click outside" is easy to miss. Anchored at
              `top-full` so it starts below the nav row — a full-viewport
              overlay would paint over the row's own links and grey out the
              menu the visitor is using. */}
          <div
            aria-hidden
            className="absolute left-1/2 top-full z-30 h-screen w-screen -translate-x-1/2 bg-fg/20"
          />

          <div
            id={panelId}
            role="group"
            aria-label={t("shopByCategories")}
            className="absolute inset-x-0 top-full z-40 rounded-b-2xl border border-line bg-ink shadow-[0_24px_48px_-24px_rgba(19,22,50,0.35)]"
          >
            {/* No <Container> here: the panel already spans the container, and
                nesting one would pad the contents twice. */}
            <div className="grid gap-8 p-7 lg:grid-cols-[1fr_260px]">
              <div>
                <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products/${c.slug}`}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-fg transition-colors group-hover:bg-accent-soft group-hover:text-accent-strong">
                        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d={getCategoryIcon(c.slug)} />
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-semibold text-fg group-hover:text-accent-strong">
                        {c.name}
                      </span>
                      {/* Truthy, not `!= null`: a bare "0" beside a category
                          name reads as a broken count, not as "empty". */}
                      {c.productCount ? (
                        <span className="text-xs tabular-nums text-faint">{c.productCount}</span>
                      ) : null}
                    </Link>
                  ))}
                </div>

                <Link
                  href="/products"
                  className="mt-4 inline-flex items-center gap-1.5 px-3 text-sm font-bold text-accent-strong hover:underline"
                >
                  {t("allCategories")}
                  <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 10h12M10 4l6 6-6 6" />
                  </svg>
                </Link>
              </div>

              <div className="rounded-2xl bg-surface p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-faint">
                  {health("goal.plural")}
                </p>
                <ul className="mt-3 flex flex-col gap-1">
                  {healthLinks.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className="block rounded-lg px-2 py-1.5 text-sm font-semibold text-fg transition-colors hover:bg-ink hover:text-accent-strong"
                      >
                        {t(item.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const TRIGGER_CLASS =
  "flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong";

function BurgerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
