import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

type UserRole = "founder" | "tester";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type FounderSignupParams = {
  role: "founder";
  email: string;
  password: string;
  name: string;
  company: string;
  industry: string;
  location: string;
  shortBio: string;
  socialUrl?: string;
};

export type TesterSignupParams = {
  role: "tester";
  email: string;
  password: string;
  name: string;
  shortBio: string;
  industries: string[];
};

type SignupParams = FounderSignupParams | TesterSignupParams;

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (params: { email: string; password: string }) => Promise<{ role: UserRole }>;
  signup: (params: SignupParams) => Promise<{ needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

// Race DB query against a timeout — never hangs the UI
async function loadProfile(authUserId: string): Promise<AuthUser | null> {
  try {
    const query = supabase
      .from("users")
      .select("id, email, name, role")
      .eq("id", authUserId)
      .maybeSingle()
      .then(({ data, error }) => (error || !data ? null : {
        id: data.id as string,
        email: data.email as string,
        name: data.name as string,
        role: data.role as UserRole,
      }));

    const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 3000));
    return await Promise.race([query, timeout]);
  } catch {
    return null;
  }
}

// Build a user object directly from Supabase Auth session data (no DB needed)
function userFromSession(session: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } }): AuthUser {
  const u = session.user;
  return {
    id: u.id,
    email: u.email ?? "",
    name: String(u.user_metadata?.name ?? u.email ?? ""),
    role: (u.user_metadata?.role ?? "founder") as UserRole,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hard failsafe — clear stale local session and unblock UI after 4s
    const fallback = setTimeout(() => {
      supabase.auth.signOut({ scope: "local" }).catch(() => {});
      setIsLoading(false);
    }, 4000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "INITIAL_SESSION") {
        if (session?.user) {
          // Try DB first, fall back to session data so the app never gets stuck
          const profile = await loadProfile(session.user.id);
          setUser(profile ?? userFromSession(session));
        }
        clearTimeout(fallback);
        setIsLoading(false);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        if (session?.user) {
          const profile = await loadProfile(session.user.id);
          // Only update if profile found — never wipe user state with null
          if (profile) setUser(profile);
        }
        return;
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        return;
      }
    });

    return () => {
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async ({ email, password }: { email: string; password: string }): Promise<{ role: UserRole }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Login failed — please try again.");

    // Don't block on the DB — set user from session immediately
    const sessionUser = userFromSession(data);
    setUser(sessionUser);

    // Try to get the real role from DB in background (3s timeout)
    loadProfile(data.user.id).then(profile => {
      if (profile) setUser(profile);
    });

    return { role: sessionUser.role };
  }, []);

  const signup = useCallback(async (params: SignupParams): Promise<{ needsEmailConfirmation: boolean }> => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        emailRedirectTo: redirectTo,
        data: { name: params.name, role: params.role },
      },
    });
    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Signup failed — please try again.");

    const userId = authData.user.id;

    const { error: userErr } = await supabase.from("users").upsert({
      id: userId,
      email: params.email,
      name: params.name,
      role: params.role,
    }, { onConflict: "id" });
    if (userErr) throw new Error(userErr.message);

    if (params.role === "founder") {
      const { error: fpErr } = await supabase.from("founder_profiles").upsert({
        id: userId,
        company_name: params.company,
        company_description: params.shortBio,
        industry_tags: params.industry ? [params.industry] : [],
      }, { onConflict: "id" });
      if (fpErr) throw new Error(fpErr.message);
    } else {
      const { error: tpErr } = await supabase.from("tester_profiles").upsert({
        id: userId,
        bio: params.shortBio,
        industry_interests: params.industries,
      }, { onConflict: "id" });
      if (tpErr) throw new Error(tpErr.message);
    }

    if (authData.session) {
      setUser({ id: userId, email: params.email, name: params.name, role: params.role });
      return { needsEmailConfirmation: false };
    }

    return { needsEmailConfirmation: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, signup, logout }),
    [user, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
