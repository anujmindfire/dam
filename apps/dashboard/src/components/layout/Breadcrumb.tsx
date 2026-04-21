import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";

const Breadcrumb: React.FC = () => {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter((part) => part);

  return (
    <nav className="text-[var(--text-color)] flex items-center leading-none text-sm font-medium">
      <Link to="/" className="hover:text-[var(--primary)] transition-all flex items-center">
        <Home size={16} />
      </Link>
      {parts.length > 0 && <span className="mx-2 text-gray-400">/</span>}
      {parts.map((part, index) => {
        const url = `/${parts.slice(0, index + 1).join("/")}`;
        const name = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
        const isLast = index === parts.length - 1;

        return (
          <span key={url} className="flex items-center">
            {isLast ? (
              <span className="text-gray-500 font-semibold">{name}</span>
            ) : (
              <>
                <Link to={url} className="hover:text-[var(--primary)] transition-colors">
                  {name}
                </Link>
                <span className="mx-2 text-gray-400">/</span>
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
