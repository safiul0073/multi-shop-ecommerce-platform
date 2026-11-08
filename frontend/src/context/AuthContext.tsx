"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { User, Shop, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  primaryShop: Shop | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; message?: string }>;
  logout: () => Promise<void>;
  setPrimaryShop: (shop: Shop) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [primaryShop, setPrimaryShopState] = useState<Shop | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const setPrimaryShop = (shop: Shop) => {
    setPrimaryShopState(shop);
    localStorage.setItem("primary_shop", JSON.stringify(shop));
  };

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    if (!savedToken) {
      setUser(null);
      setRole(null);
      setPrimaryShopState(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      setToken(savedToken);
      const res = await api.get("/auth/me");
      if (res.data.success) {
        const u = res.data.data.user;
        const r = res.data.data.role as UserRole;
        const pShop = res.data.data.primary_shop || (res.data.data.shops?.[0] ?? null);

        setUser(u);
        setRole(r);
        setPrimaryShopState(pShop);
        if (pShop) {
          localStorage.setItem("primary_shop", JSON.stringify(pShop));
        }
      }
    } catch {
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
      setUser(null);
      setRole(null);
      setPrimaryShopState(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser, role: receivedRole, primary_shop } = res.data.data;
        localStorage.setItem("auth_token", receivedToken);
        localStorage.setItem("auth_user", JSON.stringify(receivedUser));
        if (primary_shop) {
          localStorage.setItem("primary_shop", JSON.stringify(primary_shop));
        }

        setToken(receivedToken);
        setUser(receivedUser);
        setRole(receivedRole);
        setPrimaryShopState(primary_shop);

        return { success: true, role: receivedRole as UserRole };
      }
      return { success: false, message: res.data.message || "Login failed" };
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Invalid credentials";
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("primary_shop");
      sessionStorage.removeItem("auth_token");
      setUser(null);
      setRole(null);
      setPrimaryShopState(null);
      setToken(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        primaryShop,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        setPrimaryShop,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
