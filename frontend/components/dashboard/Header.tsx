"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, LayoutGrid, Users, MessageSquare, DollarSign, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const role = user?.role ?? "founder";
  const counts = { manage: 42, feedback: 31 };
  const nav =
    role === "founder"
      ? [
          { href: "/founder/dashboard", label: "Overview", icon: <LayoutGrid /> },
          { href: "/founder/forms", label: "Manage Testers", icon: <Users />, badge: counts.manage },
          { href: "/founder/feedback", label: "Feedback", icon: <MessageSquare />, badge: counts.feedback },
          { href: "/founder/commission", label: "Commission", icon: <DollarSign /> },
          { href: "/founder/settings", label: "Settings", icon: <Settings /> },
        ]
      : [
          { href: "/community", label: "Community", icon: <MessageSquare /> },
          { href: "/tester/matches", label: "Matches", icon: <LayoutGrid /> },
          { href: "/tester/profile", label: "Profile", icon: <Users /> },
        ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-[220px]">
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={onOpenMobileNav}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="FoundersSuite logo" width={28} height={28} priority />
            <span className="font-extrabold tracking-tight text-[#0a0a0f]">FoundersSuite</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
          {nav.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium transition border whitespace-nowrap",
                  active
                    ? "bg-[#3d1454] text-white border-[#3d1454]"
                    : "bg-transparent text-[#0a0a0f] border-transparent hover:bg-black/5"
                )}
              >
                <span className="[&_svg]:size-4">{item.icon}</span>
                <span>{item.label}</span>
                {"badge" in item && item.badge ? (
                  <span className={cn(
                    "ml-1 inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded-full text-[11px] font-semibold",
                    active ? "bg-white/15 text-white" : "bg-black/5 text-[#3d1454]"
                  )}>
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 min-w-[220px] justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-black/5 border border-transparent transition">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#3d1454] text-white">
                  {(user?.name?.[0] ?? "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold leading-4 text-[#0a0a0f]">
                  {user?.name ?? "User"}
                </div>
                <div className="text-xs text-[#6b7280] capitalize">{user?.role ?? ""}</div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-black/10 text-[#0a0a0f]">
              <DropdownMenuItem>
                <Link
                  className="w-full"
                  href={user?.role === "founder" ? "/founder/profile" : "/tester/profile"}
                >
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  className="w-full"
                  href={user?.role === "founder" ? "/founder/settings" : "/tester/settings"}
                >
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => logout()}
                className="text-[#8b5cf6] focus:text-[#8b5cf6]"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

