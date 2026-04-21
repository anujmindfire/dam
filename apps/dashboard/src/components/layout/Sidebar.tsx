import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Library,
  BarChart3,
  ShieldCheck,
  Zap,
  Folders,
  CheckSquare,
  Users,
  Menu,
} from "lucide-react";
import type { SidebarProps } from "../../types/index";
import { useAuth } from "../../config/AuthContext";

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Assets", icon: Library, path: "/assets" },
    { name: "Collections", icon: Folders, path: "/collections" },
    ...(user?.roleId === 1
      ? [
          { name: "Approvals", icon: CheckSquare, path: "/approvals" },
          { name: "Users", icon: Users, path: "/users" },
        ]
      : []),
    { name: "Intelligence", icon: BarChart3, path: "/intelligence" },
    { name: "Compliance", icon: ShieldCheck, path: "/compliance" },
    { name: "Background Jobs", icon: Zap, path: "/jobs" },
  ];

  return (
    <aside
      className={`
        ${!isOpen ? "w-0" : "w-[var(--sidebar-width)]"}
        fixed lg:relative z-30 h-full
        bg-white
        flex flex-col
        overflow-hidden
        transition-all duration-300 ease-in-out
        border-r border-[var(--border)]
      `}
    >
      <div className="flex items-center h-[var(--header-height)] px-6 gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-[var(--text-color)]">DAM</span>
        </Link>

        <button
          onClick={onClose}
          className="ml-auto p-1.5 rounded-md hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="p-4 flex-1 flex flex-col gap-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg 
                transition-all duration-200 group
                ${
                  active
                    ? "bg-indigo-50 text-[var(--primary)] font-semibold shadow-sm border border-indigo-100"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[var(--text-color)]"
                }`}
            >
              <item.icon
                size={18}
                className={
                  active
                    ? "text-[var(--primary)]"
                    : "text-gray-400 group-hover:text-gray-600 transition-colors"
                }
              />
              <span className="truncate text-sm">{item.name}</span>
              {active && <div className="ml-auto w-1 h-4 bg-[var(--primary)] rounded-full" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[var(--primary)] font-bold text-xs">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--text-color)] truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-500 truncate uppercase tracking-wider">
              {user?.roleId === 1 ? "Administrator" : "User"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
