import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Library,
  BarChart3,
  Settings,
  ShieldCheck,
  Zap,
  X,
  Folders,
  CheckSquare,
  Users,
} from "lucide-react";
import type { SidebarProps } from "../../types/index";
import { useAuth } from "../../components/AuthContext";

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Assets", icon: Library, path: "/assets" },
    { name: "Collections", icon: Folders, path: "/collections" },
    ...(user?.roleId === 1
      ? [
          { name: "Approvals", icon: CheckSquare, path: "/approvals" },
          { name: "Team", icon: Users, path: "/users" },
        ]
      : []),
    { name: "Intelligence", icon: BarChart3, path: "/intelligence" },
    { name: "Compliance", icon: ShieldCheck, path: "/compliance" },
    { name: "Background Jobs", icon: Zap, path: "/jobs" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`glass fixed lg:left-5 top-5 flex flex-col p-6 z-[1000] transition-all duration-300 ease-in-out ${
          isOpen ? "left-5" : "-left-full lg:left-5"
        }`}
        style={{ width: "var(--sidebar-width)", height: "calc(100vh - 40px)" }}
      >
        <div className="flex items-center justify-between mb-12 pl-2">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-sm text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-accent-purple))",
                boxShadow: "0 4px 12px var(--color-primary-glow)",
              }}
            >
              DAM
            </div>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-text-main)" }}
            >
              Intelligence
            </span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 px-4 no-underline rounded-xl transition-all duration-300 ease-in-out ${
                  isActive
                    ? "border-l-[3px] border-l-[var(--color-primary)] shadow-sm shadow-blue-500/10"
                    : "hover:bg-white/5"
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                background: isActive ? "var(--color-primary-glow)" : undefined,
              })}
            >
              <item.icon size={20} style={{ opacity: 0.7 }} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6" style={{ borderTop: "1px solid var(--color-glass-border)" }}>
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "var(--color-text-dim)" }}
          >
            <div
              className="w-2 h-2 rounded-full bg-emerald-500"
              style={{ boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)" }}
            />
            <span>System Healthy</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
