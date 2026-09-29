import React from "react";

export default function PremiumInput({
  label,
  icon: Icon,
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
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`w-full bg-slate-50 dark:bg-[#0F172A] border ${error ? "border-red-500" : "border-slate-200 dark:border-white/10"} text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary block p-3.5 transition-all duration-300 shadow-sm dark:shadow-inner dark:shadow-black/20 outline-none ${Icon ? "pl-11" : ""} ${props.readOnly ? "opacity-70 cursor-not-allowed" : ""}`}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
