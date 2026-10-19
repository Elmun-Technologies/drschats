"use client";

import { useEffect, useRef, useState } from "react";
import { haptic, isMiniApp, loadTelegramWebApp, type TelegramWebApp } from "@/lib/telegram/mini-app";

/*
  Telegram's MainButton for the two actions that matter in a shop: add to cart
  and place the order. It only appears inside a Mini App — a browser has no
  MainButton and the hook does nothing there. The action itself stays the
  page's own: the same handler, the same validation.
*/
export function useMiniAppMainButton(input: {
  text: string;
  onClick: () => void;
  visible?: boolean;
  enabled?: boolean;
}) {
  const { text, visible = true, enabled = true } = input;
  const [app, setApp] = useState<TelegramWebApp | null>(null);
  const action = useRef(input.onClick);
  action.current = input.onClick;

  useEffect(() => {
    if (!isMiniApp()) return;
    let alive = true;
    loadTelegramWebApp().then((webApp) => {
      if (alive && webApp?.MainButton) setApp(webApp);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const button = app?.MainButton;
    if (!button) return;
    const onClick = () => {
      haptic("tap");
      action.current();
    };
    button.setText(text);
    button.onClick(onClick);
    if (!visible) {
      button.hide();
      return () => button.offClick(onClick);
    }
    if (enabled) button.enable();
    else button.disable();
    button.show();
    return () => {
      button.offClick(onClick);
      button.hide();
    };
  }, [app, text, visible, enabled]);
}
