import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserProps, AuthContextTypeProps } from "../types";
import { authService } from "../services";
import { decodeToken } from "../utils/jwt";

const AuthContext = createContext<AuthContextTypeProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name || "User",
          roleId: decoded.roleId,
        });
      }
    }
    setLoading(false);
  }, []);

  const login = (data: any) => {
    const { accessToken, refreshToken, userId, ...rest } = data;
    setUser({
      id: userId,
      email: rest.email,
      name: rest.name,
      roleId: rest.roleId,
      ...rest,
    });
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      throw error;
    } finally {
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
