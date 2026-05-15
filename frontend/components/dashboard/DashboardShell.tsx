"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role ?? "founder";

  useEffect(() => {
    if (isLoading || !user || !pathname) return;
    if (user.role !== "tester") return;
    if (pathname === "/community" || pathname.startsWith("/community/")) {
      const suffix = pathname === "/community" ? "" : pathname.slice("/community".length);
      router.replace(`/tester/community${suffix}`);
    }
  }, [isLoading, user, pathname, router]);

  const isAllowed = useMemo(() => {
    if (!pathname) return true;
    if (pathname.startsWith("/community") && role === "founder") return false;
    if (pathname.startsWith("/founder")) return role === "founder";
    if (pathname.startsWith("/tester")) return role === "tester";
    return true;
  }, [pathname, role]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-900">
        <div className="text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  if (!isAllowed) {
    router.replace(role === "founder" ? "/founder/dashboard" : "/tester/matches");
    return null;
  }

  /** Tester + community: one flat white canvas (no frosted inset panel). */
  const flatShell =
    (pathname?.startsWith("/community") ?? false) || (pathname?.startsWith("/tester") ?? false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header onOpenMobileNav={() => setMobileOpen(true)} />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-6 py-6">
          <Sidebar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />
          <main className="min-w-0">
            <div
              className={cn(
                flatShell
                  ? "rounded-none border-0 bg-transparent p-0 shadow-none"
                  : "rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm md:p-6",
              )}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

