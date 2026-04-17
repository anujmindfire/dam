import React from "react";
import { Search, Bell, Menu, LogOut } from "lucide-react";
import { useAuth } from "../AuthContext";
import type { HeaderProps } from "../../types/index";

const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuth();

  return (
    <header
      className="glass fixed top-5 right-5 px-6 flex items-center justify-between z-[900] transition-all duration-300 ease-in-out"
      style={{ height: "var(--header-height)", left: "calc(var(--sidebar-width) + 60px)" }}
    >
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden text-[var(--color-text-main)] p-2 hover:bg-white/5 rounded-lg transition-colors">
          <Menu size={24} />
        </button>
        <div
          className="flex items-center gap-3 w-full max-w-[480px] py-2 px-4 rounded-xl transition-all duration-300 ease-in-out focus-within:shadow-[0_0_0_3px_var(--color-primary-glow)]"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--color-glass-border)",
          }}
        >
          <Search size={18} style={{ color: "var(--color-text-dim)" }} />
          <input
            type="text"
            placeholder="Search assets, metadata, versions..."
            className="bg-transparent border-none text-sm w-full outline-none"
            style={{ color: "var(--color-text-main)" }}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="hidden sm:block relative" style={{ color: "var(--color-text-muted)" }}>
          <Bell size={20} />
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
            style={{
              background: "var(--color-accent-purple)",
              border: "2px solid var(--color-bg-sidebar)",
            }}
          />
        </button>
        <div
          className="flex items-center gap-3 pl-5"
          style={{ borderLeft: "1px solid var(--color-glass-border)" }}
        >
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium" style={{ color: "var(--color-text-main)" }}>
              {user?.name || "Guest"}
            </span>
            <span
              className="text-[11px] uppercase tracking-wider"
              style={{ color: "var(--color-text-dim)" }}
            >
              {user?.roleId === 1 ? "Administrator" : "User"}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-2 text-[var(--color-text-muted)] hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
