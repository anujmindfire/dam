import React from "react";
import type { InputProps } from "../../types";

export const Input: React.FC<InputProps> = ({
  error,
  icon,
  label,
  className = "",
  style,
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5 group">
      {label && (
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full px-4 border border-slate-200 rounded-xl outline-none 
            bg-slate-50/50 focus:bg-white
            focus:border-[var(--primary)] focus:ring-4 focus:ring-indigo-500/5
            transition-all duration-200
            ${icon ? "pl-11" : ""}
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/5" : ""}
            ${className}
          `}
          style={{
            height: "var(--input-height)",
            fontSize: "var(--input-font-size)",
            ...style,
          }}
          {...props}
        />
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-[10px] font-bold ml-1 uppercase tracking-tight">{error}</p>
      )}
    </div>
  );
};
