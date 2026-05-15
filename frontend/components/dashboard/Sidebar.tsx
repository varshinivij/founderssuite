"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  FileText,
  Gauge,
  LayoutGrid,
  Settings,
  Users,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type NavItem = { href: string; label: string; icon: React.ReactNode };

export function Sidebar({
  mobileOpen,
  onMobileOpenChange,
}: {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role ?? "founder";

  const nav: NavItem[] =
    role === "founder"
      ? [
          { href: "/founder/dashboard", label: "Dashboard", icon: <LayoutGrid /> },
          { href: "/founder/matches", label: "Matches", icon: <Gauge /> },
          { href: "/founder/forms/new", label: "New study", icon: <FileText /> },
          { href: "/founder/profile", label: "Profile", icon: <Users /> },
          { href: "/founder/settings", label: "Settings", icon: <Settings /> },
          { href: "/agents", label: "AI Agents", icon: <Bot /> },
        ]
      : [
          { href: "/tester/community", label: "Community", icon: <MessageSquare /> },
          { href: "/tester/matches", label: "Matches", icon: <Gauge /> },
          { href: "/tester/profile", label: "Profile", icon: <Users /> },
          { href: "/tester/settings", label: "Settings", icon: <Settings /> },
          { href: "/agents", label: "AI Agents", icon: <Bot /> },
        ];

  const content = (
    <aside className="rounded-xl bg-bg-accent border border-divider shadow-card p-4 h-fit md:sticky md:top-20">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold tracking-tight">Navigation</div>
        <Button
          variant="ghost"
          className="md:hidden"
          onClick={() => onMobileOpenChange(false)}
        >
          Close
        </Button>
      </div>
      <Separator className="my-4 bg-divider" />
      <nav className="space-y-1">
        {nav.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onMobileOpenChange(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition cursor-pointer border-l-2",
                active
                  ? "bg-[#3d1454] text-white border-l-[#8b5cf6]"
                  : "text-[#a8a9ad] border-l-transparent hover:bg-[#1a1a2e] hover:text-white"
              )}
            >
              <span className="[&_svg]:size-4">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );

  // Only show this navigation as a mobile drawer.
  // Desktop navigation lives in the top header tabs.
  if (!mobileOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => onMobileOpenChange(false)}
      />
      <div className="absolute left-0 top-0 bottom-0 w-[86%] max-w-xs p-4">
        {content}
      </div>
    </div>
  );
}

