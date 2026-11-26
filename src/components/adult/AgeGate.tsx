"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { useDialog } from "@/lib/ui/useDialog";
import { AGE_COOKIE, AGE_COOKIE_MAX_AGE } from "@/lib/catalog/adult";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface AgeGateText {
  title: string;
  text: string;
  yes: string;
  no: string;
}

/*
  An 18+ page is drawn blurred and inert until the visitor says they are 18.
  The answer lives in a cookie for 30 days; a one-line script marks <html>
  before paint, so a returning visitor never sees the blur flash and the page
  can stay static (ISR). The content is in the HTML either way, so search
  engines read it. "No" (or Escape) goes back to the home page.
*/
export function AgeGate({ children, text }: { children: ReactNode; text: AgeGateText }) {
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    setOk(document.cookie.split("; ").includes(`${AGE_COOKIE}=1`));
  }, []);

  const decline = () => router.push("/");
  const ref = useDialog<HTMLDivElement>(ok === false, decline);

  function confirm() {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${AGE_COOKIE}=1; max-age=${AGE_COOKIE_MAX_AGE}; path=/; SameSite=Lax${secure}`;
    document.documentElement.classList.add("age-ok");
    setOk(true);
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(document.cookie.split("; ").indexOf("${AGE_COOKIE}=1")>-1)document.documentElement.classList.add("age-ok")}catch(e){}`,
        }}
      />
      <div className="age-gated" inert={ok !== true} aria-hidden={ok === false ? true : undefined}>
        {children}
      </div>
      {ok === false && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 p-4">
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="age-gate-title"
            tabIndex={-1}
            className="flex w-full max-w-[420px] flex-col items-center gap-4 rounded-[28px] bg-white p-6 text-center shadow-[0_24px_64px_rgba(23,25,27,0.28)] lg:p-8"
          >
            <span aria-hidden className="flex h-20 w-20 items-center justify-center rounded-full bg-pantone-magenta text-[28px] font-extrabold text-white">
              18+
            </span>
            <h2 id="age-gate-title" className="text-[24px] font-extrabold leading-[30px]">
              {text.title}
            </h2>
            <p className="text-[15px] leading-[22px] text-ink-2">{text.text}</p>
            <div className="flex w-full flex-col gap-2.5 pt-1">
              <button type="button" onClick={confirm} className={cn(buttonVariants("primary", "lg"), "w-full")}>
                {text.yes}
              </button>
              <button type="button" onClick={decline} className={cn(buttonVariants("light", "lg"), "w-full")}>
                {text.no}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
