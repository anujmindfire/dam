import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <Header />
      <main
        className="flex-1 p-8 transition-all duration-300 ease-in-out"
        style={{ marginLeft: "var(--sidebar-width)", marginTop: "var(--header-height)" }}
      >
        <div>{children}</div>
      </main>
    </div>
  );
};

export default Layout;
