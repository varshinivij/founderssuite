"use client";

import Link from "next/link";
import { BadgeCheck, Clock, Star, Zap } from "lucide-react";
import { MatchCircle } from "@/components/shared/MatchCircle";

export function HeroSectionV2({ role }: { role: "founder" | "tester" }) {
  const copy =
    role === "founder"
      ? {
          headlineA: "Market validation,",
          headlineB: "reimagined.",
          subtext:
            "FoundersSuite transforms the exhausting process of market validation into a centralized, transparent, and frictionless system.",
          ctaA: "Join as Founder",
          ctaB: "Login",
          ctaALink: "/signup?role=founder",
          ctaBLink: "/login",
        }
      : {
          headlineA: "Get hired to validate",
          headlineB: "products.",
          subtext:
            "Share your real-world experience. Match with founders who need your insight. Get paid.",
          ctaA: "Join as Tester",
          ctaB: "Login",
          ctaALink: "/signup?role=tester",
          ctaBLink: "/login",
        };

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-24 md:pb-20 md:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-14 items-start lg:items-center">
          <div>
            <h1
              className="text-white font-extrabold tracking-tight"
              style={{ fontSize: 64, lineHeight: 1.1 }}
            >
              {copy.headlineA}
              <br />
              <span className="italic text-[#c084fc]">{copy.headlineB}</span>
            </h1>
            <p className="mt-6 max-w-[420px] text-base text-purple-100/90">
              {copy.subtext}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={copy.ctaALink}
                className="px-6 py-3 rounded-full text-[15px] font-medium bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition"
              >
                {copy.ctaA}
              </Link>
              <Link
                href={copy.ctaBLink}
                className="rounded-full border border-white/35 bg-white/10 px-6 py-3 text-[15px] font-medium text-white backdrop-blur-sm transition hover:border-white/55 hover:bg-white/15"
              >
                {copy.ctaB}
              </Link>
            </div>
          </div>

          {/* Mock stack: shared light pool + soft shadows so cards read as one scene */}
          <div className="relative hidden h-[520px] lg:block">
            <div
              className="pointer-events-none absolute left-1/2 top-[46%] h-[min(100%,440px)] w-[min(100%,440px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.16)_0%,rgba(196,181,253,0.14)_38%,rgba(109,40,217,0.06)_58%,transparent_72%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-4 top-[10%] h-[78%] rounded-[2rem] bg-[radial-gradient(ellipse_85%_55%_at_50%_0%,rgba(255,255,255,0.08),transparent_50%)]"
              aria-hidden
            />

            <div className="absolute right-0 top-0 z-[25] w-[168px] rotate-[4deg] rounded-2xl border border-white/60 bg-white/[0.98] p-4 shadow-[0_28px_56px_-12px_rgba(30,10,55,0.38),0_12px_32px_-8px_rgba(91,33,182,0.2)] backdrop-blur-sm">
              <div className="text-sm font-semibold text-slate-900">Kevin T.</div>
              <div className="mt-1 text-xs text-slate-500">Founder</div>
            </div>

            <div className="absolute left-1/2 top-14 z-20 w-[min(100%,400px)] max-w-[400px] -translate-x-1/2 -rotate-[1.5deg] rounded-2xl border border-white/60 bg-white/[0.98] p-4 shadow-[0_36px_72px_-14px_rgba(30,10,55,0.42),0_18px_44px_-12px_rgba(109,40,217,0.22),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200/80">
                    <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                    Suggested match
                  </span>
                </div>
                <span className="shrink-0 text-[10px] font-medium text-slate-400">Updated 2m ago</span>
              </div>

              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#8b5cf6] bg-gradient-to-br from-[#f5f0ff] to-violet-100 shadow-sm">
                    <span className="text-base font-extrabold tracking-tight text-[#4c1d95]">AB</span>
                    <BadgeCheck
                      className="absolute -bottom-0.5 -right-0.5 size-5 text-[#8b5cf6]"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-base font-bold tracking-tight text-slate-900">
                        Anne B.
                      </span>
                      <span className="rounded bg-slate-900 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-white">
                        Tester
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-slate-600">
                      Staff PM · ex-Stripe · US/EU overlap
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="inline-flex items-center gap-0.5 rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-900">
                        <Zap className="size-2.5 shrink-0" aria-hidden />
                        Top voice
                      </span>
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                        SaaS
                      </span>
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                        B2B
                      </span>
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                        6+ yrs
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative z-10 shrink-0 translate-x-1 -translate-y-0.5 rounded-full bg-slate-900 p-2 shadow-[0_12px_28px_rgba(30,10,55,0.45),0_0_0_1px_rgba(255,255,255,0.12)_inset] ring-2 ring-white/25 ring-offset-2 ring-offset-white/90">
                  <MatchCircle score={0.97} size={78} progressStroke="#c084fc" />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-xl border border-slate-100 bg-slate-50/90 p-2">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5 text-amber-500">
                    <Star className="size-3 fill-amber-400" aria-hidden />
                    <span className="text-sm font-bold tabular-nums text-slate-900">4.9</span>
                  </div>
                  <div className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
                    Quality
                  </div>
                </div>
                <div className="border-x border-slate-200/80 text-center">
                  <div className="text-sm font-bold tabular-nums text-slate-900">31</div>
                  <div className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
                    Tests
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5 text-slate-800">
                    <Clock className="size-3 text-slate-500" aria-hidden />
                    <span className="text-sm font-bold tabular-nums text-slate-900">&lt;2h</span>
                  </div>
                  <div className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
                    Median reply
                  </div>
                </div>
              </div>

              <blockquote className="mt-3 border-l-2 border-violet-300 pl-3 text-[13px] font-medium leading-snug text-slate-700">
                “Crystal-clear briefs — I could answer with real constraints, not generic feedback.”
              </blockquote>
            </div>

            <div className="absolute bottom-10 left-[8%] z-10 w-[min(100%,300px)] max-w-[300px] translate-y-4 rotate-[2.5deg] rounded-2xl border border-white/55 bg-white/[0.96] p-4 shadow-[0_28px_60px_-14px_rgba(30,10,55,0.36),0_14px_36px_-10px_rgba(91,33,182,0.16)] backdrop-blur-sm">
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Recent
              </div>
              <div className="mt-2 h-3 w-2/3 rounded-md bg-slate-200/90" />
              <div className="mt-2 h-3 w-1/2 rounded-md bg-slate-200/90" />
              <div className="mt-4 flex gap-2">
                <div className="h-9 flex-1 rounded-xl border border-slate-200/90 bg-slate-50/90" />
                <div className="h-9 flex-1 rounded-xl border border-violet-200/90 bg-violet-50/90" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

