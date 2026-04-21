import React from "react";
import type { CardProps } from "../../types";

export const Card: React.FC<CardProps> & {
  Header: React.FC<CardProps>;
  HeaderTitle: React.FC<CardProps>;
  Body: React.FC<CardProps>;
} = ({ children, className = "", style }) => (
  <div
    className={`bg-white rounded-2xl border border-[var(--border)] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 ${className}`}
    style={style}
  >
    {children}
  </div>
);

Card.Header = ({ children, className = "" }) => (
  <div className={`px-8 py-6 border-b border-slate-100 bg-slate-50/50 ${className}`}>
    {children}
  </div>
);

Card.HeaderTitle = ({ children, className = "", style }) => (
  <h2
    className={`text-xl font-bold tracking-tight text-[var(--text-color)] ${className}`}
    style={style}
  >
    {children}
  </h2>
);

Card.Body = ({ children, className = "" }) => <div className={`p-8 ${className}`}>{children}</div>;
