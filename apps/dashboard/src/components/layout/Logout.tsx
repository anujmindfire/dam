import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../config/AuthContext";

const Logout: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  if (!user) return null;

  const avatarInitial = user.name?.charAt(0).toUpperCase() || "A";

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-semibold text-sm cursor-pointer shadow-sm hover:scale-105 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
      >
        {avatarInitial}
      </div>

      {isOpen && (
        <div className="absolute right-0 top-10 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-[200]">
          <div className="p-3 border-b border-gray-200">
            <div className="font-bold truncate text-sm text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
          <div className="p-2">
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className={`w-full rounded px-1.5 py-2 text-left text-sm text-gray-700 
                hover:bg-gray-100 transition
                ${isLoading && "opacity-60 cursor-not-allowed"}
              `}
            >
              {isLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logout;
