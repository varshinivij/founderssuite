/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User, UserRole } from "@/types";
import { createUser, loginUser } from "@/lib/api";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  login: (params: { email: string; password: string; role?: UserRole }) => Promise<void>;
  signup: (params: {
    email: string;
    name: string;
    role: UserRole;
    password: string;
  }) => Promise<void>;
  logout: () => void;
};

const AUTH_STORAGE_KEY = "founderssuite.auth.user";

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function writeStoredUser(user: User | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    writeStoredUser(null);
  }, []);

  const login = useCallback(async (params: { email: string; password: string; role?: UserRole }) => {
    // Check localStorage cache first — but if role is explicitly provided, override it
    const existing = readStoredUser();
    if (existing?.email === params.email && !params.role) {
      setUser(existing);
      return;
    }
    const user = await loginUser(params.email, undefined, params.role ?? existing?.role ?? "founder");
    setUser(user);
    writeStoredUser(user);
  }, []);

  const signup = useCallback(
    async (params: { email: string; name: string; role: UserRole; password: string }) => {
      // loginUser finds or creates the user by email; createUser() also works but may collide.
      const created = await loginUser(params.email, params.name);
      // Attach the chosen role (backend doesn't store role — it's client-side only)
      const withRole: User = { ...created, role: params.role };
      setUser(withRole);
      writeStoredUser(withRole);
    },
    []
  );

  const value = useMemo<AuthState>(
    () => ({ user, isLoading, login, signup, logout }),
    [user, isLoading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}

