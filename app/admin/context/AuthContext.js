"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { canAccessPath, getPostLoginPath } from "@/lib/adminModules";
import { usePermissions } from "./usePermissions";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get("/api/auth/me");
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      const u = await refreshUser();
      if (cancelled) return;

      if (!u) {
        router.replace("/admin/login");
      } else if (!canAccessPath(pathname, u)) {
        router.replace(getPostLoginPath(u));
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoginPage, pathname, refreshUser, router]);

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {});
    } catch {
      /* ignore */
    }
    setUser(null);
    router.replace("/admin/login");
  };

  const perms = usePermissions(user);

  return (
    <AuthContext.Provider
      value={{ user, loading, refreshUser, logout, setUser, ...perms }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
