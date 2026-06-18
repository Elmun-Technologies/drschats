"use client";

import { motion } from "framer-motion";

/**
 * Abstract premium hero visual: a luminous "vitality" orb with orbiting rings
 * and floating capsules. Pure motion/gradients — no photography needed.
 *
 * Note: rotation is driven only via framer numeric transforms (never mixed with
 * Tailwind `rotate-*` classes or string `style` rotations) to avoid framer's
 * keyframe positional-value resolver crashing.
 */
export function HeroOrb() {
  return (
    <div className="relative aspect-square w-full max-w-[560px]">
      {/* glow */}
      <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(31,209,123,0.55),rgba(20,120,80,0.15)_55%,transparent_72%)] blur-2xl" />

      {/* core orb */}
      <motion.div
        className="absolute inset-[20%] rounded-full border border-white/10 bg-[radial-gradient(circle_at_32%_28%,#36e89a,#0e7a4d_45%,#06251a_85%)] shadow-[inset_0_0_60px_rgba(0,0,0,0.6),0_0_80px_rgba(31,209,123,0.35)]"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute left-[22%] top-[18%] h-1/3 w-1/3 rounded-full bg-white/25 blur-md" />
      </motion.div>

      {/* orbiting rings */}
      <motion.div
        className="absolute inset-[6%] rounded-full border border-accent/25"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_16px_4px_rgba(31,209,123,0.7)]" />
      </motion.div>
      <motion.div
        className="absolute inset-0 rounded-full border border-gold/20"
        initial={{ rotate: 0 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_14px_4px_rgba(231,185,75,0.7)]" />
      </motion.div>

      {/* floating capsules (static tilt via numeric framer rotate, animate y only) */}
      <motion.div
        className="absolute right-[2%] top-[26%] h-7 w-16 rounded-full bg-gradient-to-r from-accent to-emerald-300 shadow-[0_8px_30px_rgba(31,209,123,0.45)]"
        style={{ rotate: 28 }}
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[14%] left-[0%] h-6 w-14 rounded-full bg-gradient-to-r from-gold to-amber-200 shadow-[0_8px_30px_rgba(231,185,75,0.45)]"
        style={{ rotate: -18 }}
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute right-[14%] bottom-[6%] h-3 w-3 rounded-full bg-white/70 blur-[1px]"
        animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
