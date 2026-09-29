import React from "react";

export default function PremiumSelect({
  label,
  icon: Icon,
  error,
  options,
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
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <Icon size={18} />
          </div>
        )}
        <select
          className={`w-full bg-slate-50 dark:bg-[#0F172A] border ${error ? "border-red-500" : "border-slate-200 dark:border-white/10"} text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary block p-3.5 transition-all duration-300 shadow-sm dark:shadow-inner dark:shadow-black/20 outline-none appearance-none ${Icon ? "pl-11" : ""}`}
          {...props}
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map((opt, idx) => (
            <option
              key={idx}
              value={opt.value || opt}
              className="bg-white text-slate-900 dark:bg-[#1E293B] dark:text-white"
            >
              {opt.label || opt}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
