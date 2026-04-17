import React from "react";
import type { ButtonProps } from "../../types";

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  children,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 focus:ring-blue-500",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-700",
    outline:
      "border border-white/10 bg-transparent hover:bg-white/5 text-slate-300 focus:ring-white/20",
    ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white focus:ring-white/10",
    danger: "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
    icon: "p-2",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};

export { Button };
