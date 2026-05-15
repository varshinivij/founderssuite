"use client";

import { useEffect, useMemo, useState } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSectionV2 } from "@/components/landing/HeroSectionV2";
import { TestSetupPreview } from "@/components/landing/TestSetupPreview";
import { ValidationFlowPreview } from "@/components/landing/ValidationFlowPreview";
import { SocialProof } from "@/components/landing/SocialProof";
import { CommunityStats } from "@/components/landing/CommunityStats";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";

const ROLE_STORAGE_KEY = "fs_landing_role";

/**
 * Deep purple hero, then many close lavender stops so the wash into white
 * eases in without a visible “step” (stops strictly increase in vh).
 */
const LANDING_PAGE_GRADIENT = [
  "linear-gradient(180deg,",
  "#1e0f2e 0%,",
  "#1f0f30 4vh,",
  "#211032 8vh,",
  "#241238 13vh,",
  "#281441 18vh,",
  "#2c1649 24vh,",
  "#301851 31vh,",
  "#341a58 38vh,",
  "#381d5f 46vh,",
  "#3c1f65 54vh,",
  "#3f2169 62vh,",
  "#42236d 70vh,",
  "#452671 78vh,",
  "#472874 86vh,",
  "#4a2a76 92vh,",
  "#4c2c78 96vh,",
  "#4e2e7a 99vh,",
  "#50317c 100vh,",
  "#53357f 101.5vh,",
  "#573b84 103vh,",
  "#5c4289 105vh,",
  "#624b90 107vh,",
  "#6a5598 110vh,",
  "#7361a1 113vh,",
  "#7e6fab 117vh,",
  "#8a7eb6 121vh,",
  "#9990c3 126vh,",
  "#aaa3d2 132vh,",
  "#beb8e1 139vh,",
  "#d4cfea 147vh,",
  "#e8e1f4 156vh,",
  "#f4eef9 166vh,",
  "#faf6fc 176vh,",
  "#fdfbfd 184vh,",
  "#ffffff 194vh,",
  "#ffffff 100%",
  ")",
].join(" ");

export default function LandingPage() {
  const [role, setRole] = useState<"founder" | "tester">("founder");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ROLE_STORAGE_KEY);
      if (saved === "founder" || saved === "tester") setRole(saved);
    } catch {
      // ignore
    }
  }, []);

  const onRoleChange = useMemo(
    () => (r: "founder" | "tester") => {
      setRole(r);
      try {
        window.localStorage.setItem(ROLE_STORAGE_KEY, r);
      } catch {
        // ignore
      }
    },
    [],
  );

  return (
    <main
      className="relative z-0 min-h-screen overflow-x-hidden text-slate-800 antialiased"
      style={{ background: LANDING_PAGE_GRADIENT }}
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 h-[min(90vh,820px)] w-[min(140vw,960px)] -translate-x-1/2 rounded-full bg-[#8b5cf6]/22 blur-[110px]"
          aria-hidden
        />
        <div
          className="absolute -right-24 top-[14rem] h-[360px] w-[360px] rounded-full bg-[#c4b5fd]/28 blur-[95px]"
          aria-hidden
        />
        <div
          className="absolute -left-28 top-[20rem] h-[400px] w-[400px] rounded-full bg-[#6d28d9]/12 blur-[100px]"
          aria-hidden
        />
      </div>

      <div className="relative z-10">
        <div className="text-white">
          <LandingHeader role={role} onRoleChange={onRoleChange} />
          <HeroSectionV2 role={role} />
        </div>
        <TestSetupPreview />
        <ValidationFlowPreview />
        <SocialProof />
        <CommunityStats />
        <PricingSection />
        <FAQSection />
      </div>
    </main>
  );
}
