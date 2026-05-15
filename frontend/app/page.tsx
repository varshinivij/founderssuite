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
 * Hero-only wash (top of page): deep purple through mid tones, then a short OKLCH
 * ramp to white at the bottom of this block — not applied to the rest of the page.
 */
const LANDING_HERO_GRADIENT = [
  "linear-gradient(in oklch 180deg,",
  "#1e0f2e 0%,",
  "#211032 8%,",
  "#281441 18%,",
  "#341a58 30%,",
  "#42236d 42%,",
  "#50317c 52%,",
  "#6a5598 64%,",
  "#8a7eb6 74%,",
  "#beb8e1 84%,",
  "#ebe4f4 92%,",
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
    <main className="relative z-0 min-h-screen overflow-x-hidden bg-white text-slate-800 antialiased">
      {/* Purple → white only behind header + hero; below this is plain white */}
      <div
        className="relative overflow-hidden text-white"
        style={{
          backgroundImage: LANDING_HERO_GRADIENT,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.022] mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
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
          <LandingHeader role={role} onRoleChange={onRoleChange} />
          <HeroSectionV2 role={role} />
        </div>
      </div>

      <div className="relative z-10 bg-white">
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
