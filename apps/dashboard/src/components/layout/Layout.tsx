import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import type { LayoutProps } from "../../types/index";

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-[#020617]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={toggleSidebar} />
        <main
          className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out"
          style={{
            marginTop: "var(--header-height)",
            marginLeft: "0",
          }}
        >
          <div className="max-w-[1600px] mx-auto lg:ml-[calc(var(--sidebar-width)+20px)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
