"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { captureInitData, loadTelegramWebApp, postEvent, type TelegramWebApp } from "@/lib/telegram/mini-app";

/*
  The shop inside Telegram, made to feel native.

  Everything here is additive: a browser never downloads telegram-web-app.js,
  never gets the `data-miniapp` styles and never sees the native BackButton.
  Inside Telegram the page asks for the full height, tells Telegram the header
  and background are the shop's white, stops a vertical swipe from closing it,
  and puts history behind the header's back arrow.
*/
export function TelegramMiniApp() {
  const [app, setApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    if (!captureInitData()) return;
    const root = document.documentElement;
    root.dataset.miniapp = "1";

    // Before the SDK arrives: the events Telegram Web understands today.
    postEvent("web_app_ready");
    postEvent("web_app_expand");
    postEvent("web_app_set_header_color", { color: "#ffffff" });
    postEvent("web_app_set_background_color", { color: "#ffffff" });
    // Scrolling a long catalogue must not swipe the shop closed.
    postEvent("web_app_setup_swipe_behavior", { allow_vertical_swipe: false });

    let alive = true;
    loadTelegramWebApp().then((webApp) => {
      if (!alive || !webApp) return;
      setApp(webApp);
      try {
        webApp.ready();
        webApp.expand();
        webApp.setHeaderColor?.("#ffffff");
        webApp.setBackgroundColor?.("#ffffff");
        webApp.disableVerticalSwipes?.();
        root.dataset.tgScheme = webApp.colorScheme;
        // Only a client that really has a MainButton may hide the page's own
        // buy bar; without it (old client, failed SDK load) the bar stays.
        if (webApp.MainButton) root.dataset.miniappMainbutton = "1";
      } catch {
        // An older client: the CSS-only shell is still correct.
      }
    });

    return () => {
      alive = false;
      delete root.dataset.miniapp;
      delete root.dataset.tgScheme;
      delete root.dataset.miniappMainbutton;
    };
  }, []);

  return <MiniAppBackButton app={app} />;
}

/** Telegram's own back arrow, shown everywhere except the shop's home page. */
function MiniAppBackButton({ app }: { app: TelegramWebApp | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const back = useRef<() => void>(() => {});
  back.current = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  useEffect(() => {
    const button = app?.BackButton;
    if (!button) return;
    const onClick = () => back.current();
    button.onClick(onClick);
    return () => button.offClick(onClick);
  }, [app, pathname]);

  useEffect(() => {
    const button = app?.BackButton;
    if (!button) return;
    if (pathname === "/") button.hide();
    else button.show();
  }, [app, pathname]);

  return null;
}
