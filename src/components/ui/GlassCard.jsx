import React from "react";
import { motion } from "framer-motion";

export default function GlassCard({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-xl dark:shadow-black/20 ${className}`}
    >
      {children}
    </motion.div>
  );
}
