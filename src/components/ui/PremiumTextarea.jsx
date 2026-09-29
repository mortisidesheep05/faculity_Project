import React from "react";

export default function PremiumTextarea({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={`w-full bg-slate-50 dark:bg-[#0F172A] border ${error ? "border-red-500" : "border-slate-200 dark:border-white/10"} text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary block p-4 transition-all duration-300 shadow-sm dark:shadow-inner dark:shadow-black/20 outline-none resize-y`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
