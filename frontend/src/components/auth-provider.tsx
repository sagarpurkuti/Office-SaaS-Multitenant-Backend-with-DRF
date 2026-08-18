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
import { loginRequest, logoutRequest } from "@/lib/api";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  isPlatformAdmin,
  setSession,
} from "@/lib/auth-storage";
import { platformApi } from "@/lib/platform-api";
import type { User } from "@/lib/types";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      return;
    }
    try {
      const me = await platformApi.me();
      if (!isPlatformAdmin(me)) {
        clearSession();
        setUser(null);
        return;
      }
      setSession(getAccessToken() || "", getRefreshToken() || "", me);
      setUser(me);
    } catch {
      clearSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored || !isPlatformAdmin(stored) || !getAccessToken()) {
      clearSession();
      setLoading(false);
      return;
    }
    setUser(stored);
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginRequest(email, password);
      if (!isPlatformAdmin(data.user)) {
        throw new Error(
          "Only platform SUPER_ADMIN accounts can access SaaS Manager.",
        );
      }
      setSession(data.access, data.refresh, data.user);
      setUser(data.user);
      router.replace("/");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    clearSession();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshUser }),
    [user, loading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
