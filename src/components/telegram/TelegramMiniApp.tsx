"use client";

import { useEffect } from "react";
import { captureInitData, postEvent } from "@/lib/telegram/mini-app";

/** Tells Telegram the shop is ready and fills the screen; nothing outside Telegram. */
export function TelegramMiniApp() {
  useEffect(() => {
    if (!captureInitData()) return;
    postEvent("web_app_ready");
    postEvent("web_app_expand");
    postEvent("web_app_set_header_color", { color: "#ffffff" });
    postEvent("web_app_set_background_color", { color: "#ffffff" });
    // Scrolling a long catalogue must not swipe the shop closed.
    postEvent("web_app_setup_swipe_behavior", { allow_vertical_swipe: false });
  }, []);
  return null;
}
