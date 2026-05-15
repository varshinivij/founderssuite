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
import type {
  FounderSignupProfile,
  TesterSignupProfile,
  User,
  UserRole,
} from "@/types";
import { createUser } from "@/lib/api";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  signup: (params: {
    email: string;
    name: string;
    role: UserRole;
    password: string;
    founderSignup?: FounderSignupProfile;
    testerSignup?: TesterSignupProfile;
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

  const login = useCallback(async (params: { email: string; password: string }) => {
    // Simple local login: only logs in an existing stored user.
    const existing = readStoredUser();
    if (existing?.email === params.email) {
      setUser(existing);
      return;
    }
    throw new Error("No local user found. Please sign up first.");
  }, []);

  const signup = useCallback(
    async (params: {
      email: string;
      name: string;
      role: UserRole;
      password: string;
      founderSignup?: FounderSignupProfile;
      testerSignup?: TesterSignupProfile;
    }) => {
      const created = await createUser({
        email: params.email,
        name: params.name,
        role: params.role,
        founderSignup: params.founderSignup,
        testerSignup: params.testerSignup,
      });
      setUser(created);
      writeStoredUser(created);
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

