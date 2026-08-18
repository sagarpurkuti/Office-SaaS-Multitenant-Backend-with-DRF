"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { tenantBff } from "../api/client";
import { TENANT_ROUTES } from "../config";
import type { TenantUser } from "../types";
import { ApiError } from "@/shared/api/errors";

type TenantAuthState = {
  user: TenantUser | null;
  tenantHost: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const TenantAuthContext = createContext<TenantAuthState | null>(null);

export function TenantAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TenantUser | null>(null);
  const [tenantHost, setTenantHost] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadSession = useCallback(async () => {
    try {
      const session = await tenantBff.session();
      setUser(session.user);
      setTenantHost(session.tenantHost);
    } catch {
      setUser(null);
      setTenantHost(null);
    }
  }, []);

  useEffect(() => {
    loadSession().finally(() => setLoading(false));
  }, [loadSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await tenantBff.login(email, password);
      setUser(session.user);
      setTenantHost(session.tenantHost);
      router.replace(TENANT_ROUTES.home);
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await tenantBff.logout();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        // ignore network errors on logout
      }
    }
    setUser(null);
    setTenantHost(null);
    router.replace(TENANT_ROUTES.login);
  }, [router]);

  const value = useMemo(
    () => ({ user, tenantHost, loading, login, logout }),
    [user, tenantHost, loading, login, logout],
  );

  return (
    <TenantAuthContext.Provider value={value}>{children}</TenantAuthContext.Provider>
  );
}

export function useTenantAuth() {
  const ctx = useContext(TenantAuthContext);
  if (!ctx) {
    throw new Error("useTenantAuth must be used within TenantAuthProvider");
  }
  return ctx;
}
