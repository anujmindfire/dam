import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import type { LayoutProps } from "../../types/index";

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setCollapsed(true);
    }
  }, [pathname]);

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] relative">
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
      <Sidebar isOpen={!collapsed} onClose={toggleSidebar} />

      <div className="flex flex-col flex-1 h-full overflow-hidden min-w-0">
        <Header collapsed={collapsed} onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
