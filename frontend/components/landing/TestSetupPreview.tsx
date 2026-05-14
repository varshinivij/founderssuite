"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Eye, FileCheck, Star, X } from "lucide-react";
import { MatchCircle } from "@/components/shared/MatchCircle";

function formatUSD(amount: number) {
  return `$${amount.toFixed(0)}`;
}

type DemoPhase = "form" | "cards" | "fuse";

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

function companyFromTitle(title: string) {
  const t = title.trim();
  if (!t) return "AudioNova";
  const first = t.split(/[\s,—–-]+/)[0];
  return first?.replace(/[^a-zA-Z0-9]/g, "") || "AudioNova";
}

export function TestSetupPreview() {
  const reduceMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<DemoPhase>("form");
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("FinTech");
  const [stage, setStage] = useState("Seed Stage");
  const [comp, setComp] = useState<"commission" | "flat">("commission");
  const [budget, setBudget] = useState(63);

  const dur = reduceMotion ? "duration-150" : "duration-700";
  const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

  const company = useMemo(() => companyFromTitle(title), [title]);

  const helper = useMemo(() => {
    return {
      title: "Define a test once — matched testers respond with structured feedback.",
      comp:
        comp === "flat"
          ? "Faster completion, less churn."
          : "Aligns incentives when outcomes matter.",
      budget: "Higher budgets usually improve match quality.",
    };
  }, [comp]);

  const matchPctInt = Math.max(84, Math.min(98, Math.round(78 + budget / 6)));
  const matchScore = matchPctInt / 100;

  const caption = useMemo(() => {
    if (phase === "form") {
      return "AI ranks testers from your domain, incentives, and ratings.";
    }
    if (phase === "cards") {
      return "You choose who to invite — skip or dig in on any suggestion.";
    }
    return "After rounds, get summaries and insights from testers and threads.";
  }, [phase]);

  useEffect(() => {
    if (phase !== "cards") return;
    const ms = reduceMotion ? 500 : 3400;
    const id = window.setTimeout(() => setPhase("fuse"), ms);
    return () => window.clearTimeout(id);
  }, [phase, reduceMotion]);

  const canFindMatches = title.trim().length >= 4;

  return (
    <section className="relative overflow-x-hidden px-6 py-16 md:py-20">
      <div className="mx-auto flex max-w-[640px] flex-col items-center gap-4">
        <div className="relative w-full min-h-[min(50vh,420px)] sm:min-h-[400px]">
          <div className="w-full rounded-xl border border-violet-200/90 bg-gradient-to-b from-violet-50/60 via-white to-white p-4 shadow-[0_14px_44px_rgba(91,33,182,0.14)] ring-1 ring-violet-500/15 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 border-l-[3px] border-[#8b5cf6] pl-3">
                <div className="text-lg font-bold leading-tight text-slate-900">Test Setup</div>
                <div className="mt-0.5 text-xs leading-snug text-slate-600">
                  {helper.title}
                </div>
              </div>
              <div className="hidden shrink-0 rounded-full border border-violet-300/90 bg-violet-100 px-2 py-1 text-[10px] font-semibold text-violet-900 shadow-sm sm:block">
                Live demo
              </div>
            </div>

            <div className="mt-3 text-[9px] font-semibold uppercase tracking-widest text-violet-700">
              TEST DETAILS
            </div>
            <div className="mt-1">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AudioNova Onboarding — Validation"
                className="h-9 w-full rounded-md border border-violet-100 bg-white px-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/25"
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-violet-700">
                  Domain
                </div>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="h-9 w-full rounded-md border border-violet-100 bg-white px-2.5 text-sm text-slate-900 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/25"
                >
                  <option>SaaS</option>
                  <option>FinTech</option>
                  <option>HealthTech</option>
                  <option>Consumer</option>
                </select>
              </div>
              <div>
                <div className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-violet-700">
                  Stage
                </div>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="h-9 w-full rounded-md border border-violet-100 bg-white px-2.5 text-sm text-slate-900 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/25"
                >
                  <option>Idea</option>
                  <option>Pre-seed</option>
                  <option>Seed Stage</option>
                  <option>Series A</option>
                </select>
              </div>
            </div>

            <div className="mt-3 text-[9px] font-semibold uppercase tracking-widest text-violet-700">
              COMPENSATION
            </div>
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                onClick={() => setComp("commission")}
                className={`h-9 flex-1 rounded-md text-xs font-medium transition ${
                  comp === "commission"
                    ? "border border-violet-400 bg-violet-100 text-violet-950 shadow-sm ring-1 ring-violet-300/40"
                    : "border border-violet-100 text-slate-600 hover:border-violet-200 hover:bg-violet-50/60"
                }`}
              >
                Commission
              </button>
              <button
                type="button"
                onClick={() => setComp("flat")}
                className={`h-9 flex-1 rounded-md text-xs font-medium transition ${
                  comp === "flat"
                    ? "bg-[#8b5cf6] text-white shadow-md shadow-violet-500/25 hover:bg-[#7c3aed]"
                    : "border border-violet-100 text-slate-600 hover:border-violet-200 hover:bg-violet-50/60"
                }`}
              >
                Flat Rate
              </button>
            </div>
            <div className="mt-1 text-[10px] leading-snug text-slate-500">{helper.comp}</div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="text-[9px] font-semibold uppercase tracking-widest text-violet-700">
                BUDGET
              </div>
              <div className="text-sm font-semibold text-slate-900">{formatUSD(budget)}</div>
            </div>
            <div className="mt-1">
              <input
                type="range"
                min={10}
                max={120}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="h-1.5 w-full accent-[#8b5cf6]"
              />
              <div className="mt-0.5 text-[10px] text-slate-500">{helper.budget}</div>
            </div>

            <div className="mt-3 rounded-lg border border-violet-200/80 bg-violet-50/50 px-3 py-2 ring-1 ring-violet-500/10">
              <div className="text-[9px] font-semibold uppercase tracking-widest text-violet-700">
                Summary
              </div>
              <div className="mt-1 text-xs leading-snug text-slate-800">
                {title.trim().length ? title.trim() : "Untitled test"}{" "}
                <span className="text-slate-400">•</span>{" "}
                <span className="text-slate-600">{domain}</span>{" "}
                <span className="text-slate-400">•</span>{" "}
                <span className="text-slate-600">{stage}</span>{" "}
                <span className="text-slate-400">•</span>{" "}
                <span className="text-slate-600">
                  {comp === "flat" ? "Flat rate" : "Commission"}
                </span>{" "}
                <span className="text-slate-400">•</span>{" "}
                <span className="text-slate-600">{formatUSD(budget)} budget</span>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={!canFindMatches || phase !== "form"}
                onClick={() => setPhase("cards")}
                className="w-full rounded-full bg-[#e8c9a0] px-5 py-2 text-sm font-semibold text-[#1a0b2e] shadow-[0_0_20px_rgba(232,201,160,0.35)] ring-2 ring-[#8b5cf6]/20 transition hover:bg-[#f2a58e] disabled:pointer-events-none disabled:opacity-40 sm:w-auto"
              >
                Find matches
              </button>
              {phase === "form" ? (
                <span className="text-[10px] text-slate-500">
                  Title (4+ chars) to run demo.
                </span>
              ) : null}
            </div>
          </div>

          <div
            className={`absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-violet-200/90 bg-violet-50/30 shadow-[inset_0_0_100px_rgba(139,92,246,0.14)] backdrop-blur-md transition-opacity ${dur} ${ease} ${
              phase === "form" ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <button
              type="button"
              onClick={() => setPhase("form")}
              className={`absolute right-2 top-2 z-40 rounded-full border border-violet-200 bg-white/95 px-3 py-1 text-[11px] font-medium text-violet-900 shadow-sm backdrop-blur-sm transition hover:border-violet-400 hover:bg-violet-50 ${
                phase === "form" ? "pointer-events-none" : ""
              }`}
            >
              Reset
            </button>
            <div className="relative flex h-full min-h-[260px] w-full max-w-[400px] flex-col items-center justify-center px-3 pt-8">
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all ${dur} ${ease} ${
                  phase === "cards"
                    ? "opacity-100 scale-100 blur-0"
                    : phase === "fuse"
                      ? "pointer-events-none translate-y-3 scale-[0.92] opacity-0 blur-[4px]"
                      : "pointer-events-none scale-[0.97] opacity-0"
                }`}
              >
                <div className="relative mx-auto flex min-h-[220px] w-full max-w-[360px] flex-col items-center justify-center pb-0">
                  <div className="relative z-0 w-full max-w-[270px] rotate-[-2deg] rounded-xl border border-[#c4b5fd]/60 bg-[#ded4f2] p-3 text-[#2d1b4e] shadow-md">
                    <span className="inline-block rounded-full bg-[#c4b5fd] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#2d1b4e]">
                      Founder
                    </span>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f2a58e] to-[#e8c9a0] text-xs font-bold text-[#1a0b2e] ring-1 ring-white/80">
                        MR
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#1a0b2e]">Morgan R.</div>
                        <div className="text-[10px] text-[#584566]">You · {stage}</div>
                      </div>
                    </div>
                    <dl className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[9px] uppercase tracking-wider text-[#584566]">
                      <div className="rounded-md bg-white/50 py-1.5">
                        <dt>Tests</dt>
                        <dd className="mt-0.5 text-xs font-bold text-[#1a0b2e]">8</dd>
                      </div>
                      <div className="rounded-md bg-white/50 py-1.5">
                        <dt>Pay</dt>
                        <dd className="mt-0.5 text-xs font-bold text-[#1a0b2e]">{formatUSD(budget)}</dd>
                      </div>
                      <div className="rounded-md bg-white/50 py-1.5">
                        <dt>Interest</dt>
                        <dd className="mt-0.5 text-[10px] font-bold leading-tight text-[#1a0b2e]">
                          {domain}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="relative z-10 -mt-3 w-full max-w-[300px] rotate-[1deg] rounded-xl border border-[#2a2a2a] bg-[#14101c] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
                    <span className="inline-block rounded-full bg-[#e8c9a0] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#1a0b2e]">
                      Tester
                    </span>
                    <div className="mt-2 flex items-start gap-2">
                      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3d1454] text-xs font-bold text-white ring-2 ring-[#8b5cf6] shadow-[0_0_16px_rgba(139,92,246,0.4)]">
                        JD
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white">John Doe</div>
                        <div className="text-[10px] leading-snug text-[#a8a9ad]">
                          Beta @ {company}
                        </div>
                        <div className="mt-1 inline-block rounded-full border border-[#f2a58e]/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#f7d9c4]">
                          Top voice
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-center">
                        <Star className="mx-auto h-3 w-3 fill-[#e8c9a0] text-[#e8c9a0]" />
                        <div className="mt-0.5 text-sm font-bold text-white">4.9</div>
                        <div className="text-[9px] uppercase tracking-wide text-[#a8a9ad]">
                          Quality
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-center">
                        <FileCheck className="mx-auto h-3 w-3 text-[#c084fc]" />
                        <div className="mt-0.5 text-sm font-bold text-white">11</div>
                        <div className="text-[9px] uppercase tracking-wide text-[#a8a9ad]">
                          Products
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-center">
                        <div className="text-sm font-bold text-[#f7d9c4]">$25/hr</div>
                        <div className="text-[9px] uppercase tracking-wide text-[#a8a9ad]">
                          Pay
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full border border-white/25 px-2 py-1 text-[10px] font-medium text-white hover:bg-white/5"
                      >
                        <Eye className="h-3 w-3" />
                        Profile
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-0.5 rounded-full border border-white/20 px-2 py-1 text-[10px] text-[#a8a9ad] hover:text-white"
                      >
                        <X className="h-3 w-3" />
                        Skip
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-0.5 rounded-full bg-[#e8c9a0] px-2 py-1 text-[10px] font-semibold text-[#1a0b2e] shadow-[0_0_12px_rgba(232,201,160,0.35)]"
                      >
                        <Check className="h-3 w-3" />
                        Invite
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all ${dur} ${ease} ${
                  phase === "fuse" ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                }`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.22)_0%,transparent_65%)]" />
                <div className="relative rounded-full bg-[#1a0b2e]/90 p-4 shadow-[0_0_56px_rgba(167,139,250,0.45)] ring-2 ring-[#8b5cf6]/50">
                  <MatchCircle
                    score={matchScore}
                    size={120}
                    progressStroke="#c084fc"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPhase("form")}
                  className="relative mt-4 text-xs font-medium text-violet-700 underline-offset-4 hover:text-violet-900 hover:underline"
                >
                  Run again
                </button>
              </div>
            </div>
          </div>
        </div>

        <p
          className={`w-full text-center text-[11px] leading-snug text-slate-500 transition-opacity ${dur}`}
        >
          {caption}
        </p>
      </div>
    </section>
  );
}
