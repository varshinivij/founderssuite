import { useEffect, useMemo, useState } from "react";
import { Check, Eye, FileCheck, Star, X } from "lucide-react";
import { MatchCircle } from "../shared/MatchCircle";

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
  const [domain, setDomain] = useState("");
  const [stage, setStage] = useState("Seed Stage");
  const [comp, setComp] = useState<"commission" | "flat">("commission");
  const [budget, setBudget] = useState(63);

  const dur = reduceMotion ? "duration-150" : "duration-700";
  const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

  const company = useMemo(() => companyFromTitle(title), [title]);

  const matchPctInt = Math.max(84, Math.min(98, Math.round(78 + budget / 6)));
  const matchScore = matchPctInt / 100;

  const caption = useMemo(() => {
    if (phase === "form") return "";
    if (phase === "cards") return "Choose testers to invite.";
    return "Match quality from your setup.";
  }, [phase]);

  useEffect(() => {
    if (phase !== "cards") return;
    const ms = reduceMotion ? 500 : 3400;
    const id = window.setTimeout(() => setPhase("fuse"), ms);
    return () => window.clearTimeout(id);
  }, [phase, reduceMotion]);

  const canFindMatches = title.trim().length >= 4;

  return (
    <section id="setup" className="relative scroll-mt-32 overflow-x-hidden px-6 py-16 md:py-24">
      <div className="mx-auto mb-10 max-w-[640px] text-center">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">How it works</div>
        <h2 className="text-[2rem] font-extrabold leading-tight tracking-tight text-slate-900 md:text-[2.4rem]">
          Set up a test in minutes
        </h2>
        <p className="mx-auto mt-3 max-w-[480px] text-base text-slate-500">
          Define your domain, testers, and budget — we handle the matching.
        </p>
      </div>
      <div className="mx-auto flex max-w-[640px] flex-col items-center gap-4">
        <div className="relative w-full min-h-[min(50vh,420px)] sm:min-h-[400px]">
          <div className="w-full rounded-2xl border border-violet-200/90 bg-white p-5 shadow-[0_10px_36px_rgba(91,33,182,0.08)] ring-1 ring-violet-500/10">
            <div className="text-lg font-bold leading-tight text-slate-900">Test Setup</div>

            <div className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Test details
            </div>
            <div className="mt-2 space-y-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AudioNova Onboarding — Validation"
                className="h-11 w-full rounded-full border border-violet-200/90 bg-violet-50/40 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300/30"
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="h-11 w-full cursor-pointer appearance-none rounded-full border border-violet-200/90 bg-violet-50/40 bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat px-4 pr-9 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300/30"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                >
                  <option value="">Domain</option>
                  <option>SaaS</option>
                  <option>FinTech</option>
                  <option>HealthTech</option>
                  <option>Consumer</option>
                </select>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="h-11 w-full cursor-pointer appearance-none rounded-full border border-violet-200/90 bg-violet-50/40 bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat px-4 pr-9 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300/30"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                >
                  <option>Idea</option>
                  <option>Pre-seed</option>
                  <option>Seed Stage</option>
                  <option>Series A</option>
                </select>
              </div>
            </div>

            <div className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Compensation
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setComp("commission")}
                className={`h-11 flex-1 rounded-full text-sm font-medium transition ${
                  comp === "commission"
                    ? "border-2 border-violet-400 bg-white text-slate-900 shadow-sm"
                    : "border border-transparent bg-violet-50/50 text-slate-600 hover:bg-violet-50"
                }`}
              >
                Commission
              </button>
              <button
                type="button"
                onClick={() => setComp("flat")}
                className={`h-11 flex-1 rounded-full text-sm font-medium transition ${
                  comp === "flat"
                    ? "border-2 border-violet-400 bg-white text-slate-900 shadow-sm"
                    : "border border-transparent bg-violet-50/50 text-slate-600 hover:bg-violet-50"
                }`}
              >
                Flat Rate
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Budget constraint
              </div>
              <div className="text-sm font-semibold tabular-nums text-slate-900">{formatUSD(budget)}</div>
            </div>
            <div className="mt-2">
              <input
                type="range"
                min={10}
                max={120}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-violet-500"
              />
            </div>

            <div className="mt-6">
              <button
                type="button"
                disabled={!canFindMatches || phase !== "form"}
                onClick={() => setPhase("cards")}
                className="h-11 w-full rounded-full bg-[#8b5cf6] px-5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-[#7c3aed] disabled:pointer-events-none disabled:opacity-40"
              >
                Find matches
              </button>
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
                          {domain || "—"}
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

        {caption ? (
          <p
            className={`w-full text-center text-[11px] leading-snug text-slate-500 transition-opacity ${dur}`}
          >
            {caption}
          </p>
        ) : null}
      </div>
    </section>
  );
}
