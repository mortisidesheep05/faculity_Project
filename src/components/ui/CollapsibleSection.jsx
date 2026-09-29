import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
  icon: Icon,
  badge,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#162033]/50 overflow-hidden mb-6 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20 shadow-sm dark:shadow-none">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg">
              <Icon size={20} />
            </div>
          )}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-wide">
            {title}
          </h3>
          {badge && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-slate-500 dark:text-slate-400"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-slate-100 dark:border-white/5 mt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
