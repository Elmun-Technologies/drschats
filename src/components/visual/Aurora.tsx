"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Cinematic animated background: slow-drifting colour blobs + mesh, used behind
 * heroes and statement sections to give a premium, "alive" Whoop-like depth.
 * Purely CSS/transform driven (no media assets). Reduced-motion friendly —
 * framer respects the OS setting and the blobs simply rest.
 */
export function Aurora({
  className,
  variant = "green",
}: {
  className?: string;
  variant?: "green" | "gold" | "spectrum";
}) {
  const palettes: Record<string, string[]> = {
    green: ["rgba(31,209,123,0.40)", "rgba(20,160,110,0.30)", "rgba(231,185,75,0.18)"],
    gold: ["rgba(231,185,75,0.40)", "rgba(31,209,123,0.22)", "rgba(231,185,75,0.15)"],
    spectrum: ["rgba(31,209,123,0.35)", "rgba(95,140,255,0.28)", "rgba(231,185,75,0.25)"],
  };
  const [a, b, c] = palettes[variant];

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="absolute -left-[10%] top-[-10%] h-[55vw] w-[55vw] rounded-full blur-[120px]"
        style={{ background: `radial-gradient(circle, ${a}, transparent 70%)` }}
        animate={{ x: [0, 80, -40, 0], y: [0, 60, 30, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-10%] top-[10%] h-[50vw] w-[50vw] rounded-full blur-[120px]"
        style={{ background: `radial-gradient(circle, ${b}, transparent 70%)` }}
        animate={{ x: [0, -70, 40, 0], y: [0, 40, -30, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-20%] left-[30%] h-[45vw] w-[45vw] rounded-full blur-[120px]"
        style={{ background: `radial-gradient(circle, ${c}, transparent 70%)` }}
        animate={{ x: [0, 50, -60, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* fine grid + vignette for depth */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--color-ink)_90%)]" />
    </div>
  );
}
