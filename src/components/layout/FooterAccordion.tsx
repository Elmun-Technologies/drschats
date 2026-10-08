"use client";

import { useId, useState } from "react";
import { Link } from "@/lib/i18n/navigation";

/*
  A footer column on phones (design: FooterMobileV3). Not <details>: Chrome
  keeps a closed details' links laid out under `content-visibility: hidden`,
  so they still report a box at the bottom of the page — under the tab bar —
  and the bottom-edge and tap-target audits count links nobody can see.
  Collapsed here means not rendered.
*/
export function FooterAccordion({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="border-b border-line-strong md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-full items-center justify-between text-left text-[17px] font-semibold"
      >
        {title}
        <svg viewBox="0 0 24 24" aria-hidden className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul id={id} className="flex flex-col pb-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="flex min-h-11 items-center text-[15px] text-ink-2">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
