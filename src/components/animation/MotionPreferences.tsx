"use client";

import { MotionConfig } from "framer-motion";

/*
  Framer Motion animations follow the visitor's reduced-motion setting; the
  CSS rule in globals.css only reaches CSS animations. Only the config context
  is imported here, so the layout chunk does not carry the animation engine.
*/
export function MotionPreferences({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
