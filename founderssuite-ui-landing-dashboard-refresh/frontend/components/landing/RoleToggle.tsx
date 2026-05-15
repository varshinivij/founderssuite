"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function RoleToggle({
  value,
  onChange,
}: {
  value: "founder" | "tester";
  onChange: (v: "founder" | "tester") => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as "founder" | "tester")}>
      <TabsList className="rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-sm">
        <TabsTrigger
          value="founder"
          className="rounded-full px-4 py-2 text-sm text-purple-100/80 data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white data-[state=active]:shadow-[0_12px_32px_rgba(139,92,246,0.35)]"
        >
          I&apos;m a Founder
        </TabsTrigger>
        <TabsTrigger
          value="tester"
          className="rounded-full px-4 py-2 text-sm text-purple-100/80 data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white data-[state=active]:shadow-[0_12px_32px_rgba(139,92,246,0.35)]"
        >
          I&apos;m a Tester
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

