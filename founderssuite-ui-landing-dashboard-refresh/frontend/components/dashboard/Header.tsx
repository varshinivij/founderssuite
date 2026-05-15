"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Menu, LayoutGrid, Users, DollarSign, Settings,
  Video, BrainCircuit, Network, ChevronDown, Bot, MessageSquare,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const role = user?.role ?? "founder";

  const founderNav = [
    { href: "/founder/dashboard", label: "Dashboard",  icon: <LayoutGrid /> },
    { href: "/founder/forms",     label: "My Forms",   icon: <Users /> },
    { href: "/agents",            label: "AI Agents",  icon: <Bot /> },
    { href: "/founder/commission",label: "Commission", icon: <DollarSign /> },
    { href: "/founder/settings",  label: "Settings",   icon: <Settings /> },
  ];

  const testerNav = [
    { href: "/tester/feed",    label: "Feed",      icon: <LayoutGrid /> },
    { href: "/tester/matches", label: "Matches",   icon: <LayoutGrid /> },
    { href: "/community",      label: "Community", icon: <MessageSquare /> },
    { href: "/tester/profile", label: "Profile",   icon: <Users /> },
    { href: "/tester/settings",label: "Settings",  icon: <Settings /> },
  ];

  const nav = role === "founder" ? founderNav : testerNav;

  const interviewLinks = [
    { href: "/meeting",   label: "Interview Room",     icon: <Video /> },
    { href: "/simulator", label: "AI Simulator",       icon: <BrainCircuit /> },
    { href: "/insights",  label: "Interview Insights", icon: <Network /> },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <Button variant="ghost" className="md:hidden" onClick={onOpenMobileNav} aria-label="Open navigation">
            <Menu />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="FoundersSuite" width={28} height={28} priority />
            <span className="font-extrabold tracking-tight text-[#0a0a0f]">FoundersSuite</span>
          </Link>
        </div>

        {/* Main nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
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
              </Link>
            );
          })}

          {/* Interview Suite dropdown — founders only */}
          {role === "founder" && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium transition border whitespace-nowrap bg-transparent text-[#0a0a0f] border-transparent hover:bg-black/5 outline-none">
                <span className="[&_svg]:size-4"><Video /></span>
                <span>Interview Suite</span>
                <span className="[&_svg]:size-3 opacity-50"><ChevronDown /></span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-black/10 text-[#0a0a0f] min-w-[180px]">
                {interviewLinks.map((link) => (
                  <DropdownMenuItem key={link.href}>
                    <Link href={link.href} className="flex items-center gap-2 w-full">
                      <span className="[&_svg]:size-4 text-[#8b5cf6]">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* User menu */}
        <div className="flex items-center gap-2 min-w-[180px] justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-black/5 border border-transparent transition">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#3d1454] text-white">
                  {(user?.name?.[0] ?? "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold leading-4 text-[#0a0a0f]">{user?.name ?? "User"}</div>
                <div className="text-xs text-[#6b7280] capitalize">{user?.role ?? ""}</div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-black/10 text-[#0a0a0f]">
              <DropdownMenuItem>
                <Link className="w-full" href={role === "founder" ? "/founder/profile" : "/tester/profile"}>
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link className="w-full" href={role === "founder" ? "/founder/settings" : "/tester/settings"}>
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => logout()} className="text-[#8b5cf6] focus:text-[#8b5cf6]">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
