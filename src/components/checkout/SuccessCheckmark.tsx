"use client";

import { motion } from "framer-motion";

export function SuccessCheckmark() {
  return (
    <div className="relative mb-8">
      <motion.div
        className="h-24 w-24 rounded-full bg-accent-soft"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, duration: 0.5 }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.svg
          viewBox="0 0 24 24"
          className="h-12 w-12 text-accent"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 18 }}
        >
          <motion.path
            d="M5 12l4 4L19 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          />
        </motion.svg>
      </div>
    </div>
  );
}
