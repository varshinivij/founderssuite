"use client";

import Image from "next/image";
import { RoleToggle } from "@/components/landing/RoleToggle";

export function LandingHeader({
  role,
  onRoleChange,
}: {
  role: "founder" | "tester";
  onRoleChange: (r: "founder" | "tester") => void;
}) {
  return (
    <header className="w-full">
      <div className="max-w-[1100px] mx-auto px-6 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="FoundersSuite logo"
            width={44}
            height={44}
            priority
            className="drop-shadow-[0_18px_50px_rgba(139,92,246,0.20)]"
          />
          <div className="text-white font-extrabold tracking-tight">FoundersSuite</div>
        </div>
        <RoleToggle value={role} onChange={onRoleChange} />
      </div>
    </header>
  );
}

