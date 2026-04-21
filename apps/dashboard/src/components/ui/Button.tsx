import React from "react";
import type { ButtonProps } from "../../types";

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  className = "",
  style,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 tracking-tight";

  const variants = {
    primary:
      "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-md shadow-indigo-200 hover:shadow-indigo-300",
    secondary: "bg-slate-800 hover:bg-slate-900 text-white shadow-md shadow-slate-200",
    danger: "bg-[var(--danger)] hover:bg-[var(--danger-hover)] text-white shadow-md shadow-red-200",
    success:
      "bg-[var(--success)] hover:bg-[var(--success-hover)] text-white shadow-md shadow-emerald-200",
    outline:
      "bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
  };

  const sizes = {
    sm: "h-8 px-3 text-[10px] rounded-lg",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base",
    icon: "w-10 h-10 p-0 rounded-xl",
  };

  return (
    <button
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? "w-full" : ""} 
        ${className}
      `}
      disabled={disabled || isLoading}
      style={style}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};
