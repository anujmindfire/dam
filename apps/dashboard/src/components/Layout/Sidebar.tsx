import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Library, BarChart3, Settings, ShieldCheck, Zap } from "lucide-react";

const Sidebar: React.FC = () => {
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Assets", icon: Library, path: "/assets" },
    { name: "Intelligence", icon: BarChart3, path: "/intelligence" },
    { name: "Compliance", icon: ShieldCheck, path: "/compliance" },
    { name: "Background Jobs", icon: Zap, path: "/jobs" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <aside
      className="glass fixed left-5 top-5 flex flex-col p-6 z-[1000] transition-all duration-300 ease-in-out"
      style={{ width: "var(--sidebar-width)", height: "calc(100vh - 40px)" }}
    >
      <div className="flex items-center gap-3 mb-12 pl-2">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-sm text-white"
          style={{
            background: "linear-gradient(135deg, var(--color-primary), var(--color-accent-purple))",
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

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 px-4 no-underline rounded-xl transition-all duration-300 ease-in-out ${
                isActive ? "border-l-[3px] border-l-[var(--color-primary)]" : "hover:bg-white/5"
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
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-dim)" }}>
          <div
            className="w-2 h-2 rounded-full bg-emerald-500"
            style={{ boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)" }}
          />
          <span>System Healthy</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
