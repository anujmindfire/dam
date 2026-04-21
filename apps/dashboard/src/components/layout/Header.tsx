import React from "react";
import Breadcrumb from "./Breadcrumb";
import Logout from "./Logout";
import { Menu } from "lucide-react";
import type { HeaderProps } from "../../types";

const Header: React.FC<HeaderProps> = ({ onMenuClick, collapsed = false }) => {
  return (
    <header className="sticky top-0 z-20 flex items-center h-[var(--header-height)] px-6 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
      <button
        onClick={onMenuClick}
        className={`
          mr-4 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95
          ${collapsed ? "opacity-100" : "opacity-0 pointer-events-none lg:hidden"}
        `}
      >
        <Menu size={18} className="text-slate-600" />
      </button>

      <div className="flex-1 overflow-hidden">
        <Breadcrumb />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
          <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">
            Live System
          </span>
        </div>
        <div className="h-8 w-px bg-slate-200 mx-1" />
        <Logout />
      </div>
    </header>
  );
};

export default Header;
