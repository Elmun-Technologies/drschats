"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { telegramInitData } from "@/lib/telegram/mini-app";
import { SESSION_EVENT } from "@/lib/config/telegram-login";
import { pollTelegramLogin, signInWithMiniApp, startTelegramLogin, type PollLoginResult } from "@/app/actions/customer";

/*
  «Telegram orqali kirish». The request is created when the card mounts, so
  the button is a real link (a new tab to t.me opens Telegram on a phone,
  and no popup blocker sees a window opened after an await). The page then
  polls; the bot's «✅ Tasdiqlash» turns the next poll into a session and the
  page re-renders as the cabinet. Inside the Mini App Telegram already says
  who the user is, so there is nothing to press.
*/

type State = "loading" | "ready" | "waiting" | "denied" | "expired" | "error" | "rateLimited" | "miniApp" | "miniAppContact";

const POLL_MS = 2500;

export function TelegramLogin({ bot }: { bot: string }) {
  const t = useTranslations("account.tg");
  const locale = useLocale() === "ru" ? "ru" : "uz";
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [link, setLink] = useState<{ url: string; qr: string | null; expiresAt: number } | null>(null);
  const busy = useRef(false);

  const create = useCallback(async () => {
    setState("loading");
    const r = await startTelegramLogin({ locale }).catch(() => null);
    if (!r || !r.ok) {
      setState(r && !r.ok && r.error === "rate_limited" ? "rateLimited" : "error");
      return;
    }
    setLink({ url: r.url, qr: r.qr, expiresAt: r.expiresAt });
    setState("ready");
  }, [locale]);

  const settle = useCallback(
    (r: PollLoginResult) => {
      if (r.status === "done") {
        window.dispatchEvent(new Event(SESSION_EVENT));
        router.refresh();
        return true;
      }
      if (r.status === "denied" || r.status === "expired") {
        setState(r.status);
        return true;
      }
      return false;
    },
    [router],
  );

  useEffect(() => {
    const init = telegramInitData();
    if (!init) {
      void create();
      return;
    }
    setState("miniApp");
    signInWithMiniApp(init)
      .then((r) => {
        if (r.status === "done") {
          window.dispatchEvent(new Event(SESSION_EVENT));
          router.refresh();
        }
        else if (r.status === "need_contact") setState("miniAppContact");
        else void create();
      })
      .catch(() => void create());
  }, [create, router]);

  const poll = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const r = await pollTelegramLogin();
      settle(r);
    } catch {
      // A dropped request is retried on the next tick.
    } finally {
      busy.current = false;
    }
  }, [settle]);

  useEffect(() => {
    if (!link || (state !== "ready" && state !== "waiting")) return;
    const tick = () => {
      if (Date.now() > link.expiresAt) setState("expired");
      else void poll();
    };
    const timer = window.setInterval(tick, POLL_MS);
    // Back from Telegram: answer at once rather than on the next tick.
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [link, state, poll]);

  const message =
    state === "denied" ? t("denied") : state === "expired" ? t("expired") : state === "error" ? t("error") : state === "rateLimited" ? t("rateLimited") : null;

  return (
    <div className="flex flex-col gap-5 lg:rounded-[20px] lg:border lg:border-line lg:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold leading-[34px] lg:text-[32px] lg:leading-[38px]">{t("title")}</h1>
        <p className="text-base leading-6 text-ink-2 lg:text-[17px]">{t("lead")}</p>
      </div>

      {state === "miniApp" || state === "miniAppContact" ? (
        <p role="status" className="rounded-[16px] bg-tile p-4 text-base leading-6">
          {state === "miniApp" ? t("miniApp") : t("miniAppContact")}
        </p>
      ) : message ? (
        <div className="flex flex-col gap-3">
          <p role="alert" className="rounded-[16px] bg-tile p-4 text-base leading-6">
            {message}
          </p>
          <button type="button" onClick={() => void create()} className="flex h-14 items-center justify-center rounded-sm bg-ink px-6 text-[17px] font-semibold text-white">
            {t("retry")}
          </button>
        </div>
      ) : (
        <>
          <a
            href={link?.url ?? `https://t.me/${bot}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!link}
            onClick={(e) => {
              if (!link) e.preventDefault();
              else setState("waiting");
            }}
            className="flex h-14 items-center justify-center gap-2.5 rounded-sm bg-ink px-6 text-[17px] font-semibold text-white aria-disabled:opacity-60"
          >
            <TelegramIcon />
            {state === "waiting" ? t("reopen") : t("cta")}
          </a>
          {state === "waiting" && (
            <div role="status" className="flex items-start gap-3 rounded-[16px] bg-tile p-4">
              <span aria-hidden className="mt-1.5 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-ink" />
              <span className="flex flex-col gap-1">
                <span className="text-base font-semibold leading-6">{t("waiting")}</span>
                <span className="text-sm text-ink-2">{t("waitingHint")}</span>
              </span>
            </div>
          )}
          {link?.qr && (
            <div className="hidden items-center gap-5 rounded-[16px] border border-line p-4 lg:flex">
              {/* eslint-disable-next-line @next/next/no-img-element -- a data: URL generated on the server, nothing to optimise */}
              <img src={link.qr} alt={t("qrAlt")} width={132} height={132} className="shrink-0 rounded-[8px] bg-white" />
              <span className="text-[15px] leading-6 text-ink-2">{t("qrHint")}</span>
            </div>
          )}
        </>
      )}

      <div className="flex flex-col gap-3 rounded-[16px] bg-tile p-5">
        <h2 className="text-base font-bold">{t("steps")}</h2>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-[15px] leading-6 text-ink-2">
          <li>{t("step1", { bot })}</li>
          <li>{t("step2")}</li>
          <li>{t("step3")}</li>
        </ol>
      </div>
    </div>
  );
}

export function TelegramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 4L3 11l6 2.5M21 4l-3.5 16-8.5-6.5M21 4L9 13.5V19l3-3" />
    </svg>
  );
}
