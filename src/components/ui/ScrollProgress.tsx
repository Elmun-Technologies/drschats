"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Slim reading-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 140, damping: 24, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX: width }}
      className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left bg-accent"
      aria-hidden
    />
  );
}
