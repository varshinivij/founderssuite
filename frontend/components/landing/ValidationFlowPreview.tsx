"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bug,
  Calendar,
  Check,
  ChevronRight,
  Monitor,
  Smartphone,
} from "lucide-react";

const tabs = ["Problem Validation", "Concept Prototyping", "Beta Testing"] as const;

type ConceptFrame = "phone" | "desktop";

export function ValidationFlowPreview() {
  const [active, setActive] = useState<(typeof tabs)[number]>("Problem Validation");
  const [selected, setSelected] = useState(0);
  const [problemStep, setProblemStep] = useState(0);
  const [problemSaved, setProblemSaved] = useState(false);
  const [protoScore, setProtoScore] = useState(72);
  const [conceptFrame, setConceptFrame] = useState<ConceptFrame>("phone");
  const [hotspot, setHotspot] = useState<"hero" | "cta" | "nav">("cta");
  const [betaSeverity, setBetaSeverity] = useState<"minor" | "major" | "critical">("major");
  const [reproDone, setReproDone] = useState<boolean[]>([false, false, false]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSelected(0);
    setProblemStep(0);
    setProblemSaved(false);
    setReproDone([false, false, false]);
    setToast(null);
  }, [active]);

  const problemScreens = useMemo(
    () => [
      {
        label: "EARLY-STAGE ASSESSMENT",
        title: "Help us understand your grocery habits",
        sub: "How difficult is it for you to find fresh, organic produce locally?",
        options: [
          "Very easy — I find quality options easily",
          "Somewhat difficult — I find it, but the selection is limited",
          "Very difficult — I rarely find what I need",
          "I don't purchase fresh produce often",
        ],
        footer: { read: "2 min read", pct: "8%" },
        cta: "Next →",
      },
      {
        label: "FOLLOW-UP",
        title: "What would most improve your last shopping trip?",
        sub: "Pick the lever you’d pull first — we use this to cluster qualitative themes.",
        options: [
          "Better store inventory visibility",
          "Delivery windows that match my schedule",
          "Price transparency on organic SKUs",
          "Nothing — the experience is fine",
        ],
        footer: { read: "1 min read", pct: "24%" },
        cta: "Submit answer",
      },
    ],
    [],
  );

  const model = useMemo(() => {
    if (active === "Problem Validation") {
      return problemScreens[Math.min(problemStep, problemScreens.length - 1)]!;
    }
    if (active === "Concept Prototyping") {
      return {
        label: "CONCEPT PROTOTYPE",
        title: "React to this onboarding concept",
        sub: "Would you expect this flow to help you reach value quickly?",
        options: [
          "Yes — this is clear and I know what to do next",
          "Somewhat — I’d need one more example to understand it",
          "No — I’m not sure what success looks like",
          "I’d abandon this flow and try something else",
        ],
        footer: { read: "3 min read", pct: "21%" },
        cta: "Save feedback",
      };
    }
    return {
      label: "BETA TEST REPORT",
      title: "Report an issue from a beta session",
      sub: "What best describes the impact?",
      options: [
        "Minor — confusing but I can still complete the task",
        "Major — slows me down or blocks part of the workflow",
        "Critical — I can’t complete the task",
        "Not a bug — it’s expected behavior",
      ],
      footer: { read: "4 min read", pct: "46%" },
      cta: "Submit report",
    };
  }, [active, problemStep, problemScreens]);

  const completionPct = useMemo(() => {
    if (active === "Problem Validation") {
      return problemSaved ? 100 : problemStep === 0 ? 8 + selected * 4 : 28 + selected * 6;
    }
    if (active === "Concept Prototyping") {
      return Math.min(96, 18 + Math.round(protoScore * 0.35) + selected * 5);
    }
    const r = reproDone.filter(Boolean).length;
    return Math.min(98, 40 + (betaSeverity === "critical" ? 30 : betaSeverity === "major" ? 20 : 10) + r * 8);
  }, [active, selected, protoScore, betaSeverity, reproDone, problemStep, problemSaved]);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function onFooterCta() {
    if (active === "Problem Validation") {
      if (problemStep === 0) {
        setProblemStep(1);
        setSelected(0);
        flash("Progress saved");
        return;
      }
      setProblemSaved(true);
      flash("Response recorded");
      window.setTimeout(() => {
        setProblemStep(0);
        setProblemSaved(false);
        setSelected(0);
      }, 1800);
      return;
    }
    if (active === "Concept Prototyping") {
      flash("Prototype feedback saved");
      return;
    }
    flash("Report queued for triage");
  }

  const severityTint =
    betaSeverity === "critical"
      ? "border-red-500/40 bg-red-500/10"
      : betaSeverity === "major"
        ? "border-amber-500/40 bg-amber-500/10"
        : "border-emerald-500/35 bg-emerald-500/10";

  return (
    <section className="relative overflow-x-hidden">
      <div className="mx-auto max-w-[1100px] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[800px]">
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map((t) => {
              const isActive = t === active;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActive(t)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-[#8b5cf6] bg-[#8b5cf6] text-white shadow-md shadow-violet-500/25"
                      : "border-violet-200/90 bg-violet-50/70 text-violet-950/80 shadow-sm hover:border-violet-300 hover:bg-violet-100/80 hover:text-violet-950"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div className="relative mt-8 overflow-hidden rounded-2xl border border-violet-200/90 bg-gradient-to-b from-violet-50/50 via-white to-white shadow-[0_16px_48px_rgba(91,33,182,0.15)] ring-1 ring-violet-500/12">
            {toast ? (
              <div className="absolute right-4 top-4 z-20 animate-in fade-in zoom-in-95 duration-200 rounded-full border border-violet-300 bg-violet-100 px-4 py-1.5 text-xs font-semibold text-violet-950 shadow-lg shadow-violet-500/20">
                {toast}
              </div>
            ) : null}

            <div className="border-b border-violet-100 bg-violet-50/85 px-6 py-5">
              {active === "Problem Validation" ? (
                <div className="mb-3 flex items-center gap-2">
                  {[0, 1].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          problemSaved
                            ? "bg-emerald-500/20 text-emerald-300"
                            : problemStep > s
                              ? "bg-[#8b5cf6] text-white"
                              : problemStep === s
                                ? "border border-[#8b5cf6] text-violet-700"
                                : "border border-violet-200/80 text-violet-800/70"
                        }`}
                      >
                        {problemSaved && s === 1 ? <Check className="h-3.5 w-3.5" /> : s + 1}
                      </div>
                      {s === 0 ? (
                        <ChevronRight className="h-4 w-4 text-violet-300" />
                      ) : null}
                    </div>
                  ))}
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-violet-700">
                    Guided response
                  </span>
                </div>
              ) : null}

              <div className="text-xs font-semibold tracking-widest text-violet-700">
                {model.label}
              </div>
              <div className="mt-2 text-lg font-extrabold text-slate-900">
                {active === "Problem Validation" && problemSaved
                  ? "Thanks — that’s enough for a first pass match."
                  : model.title}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {active === "Problem Validation" && problemSaved
                  ? "Founders see this as structured signals, not a wall of unstructured text."
                  : model.sub}
              </div>
              {active === "Problem Validation" ? (
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-violet-200/90 ring-1 ring-violet-300/30">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] transition-all duration-500"
                    style={{ width: `${problemSaved ? 100 : problemStep === 0 ? 42 : 78}%` }}
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-3 px-6 py-5">
              {active === "Concept Prototyping" ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs font-semibold uppercase tracking-widest text-violet-700">
                      Interactive mockup
                    </div>
                    <div className="flex rounded-full border border-violet-200 bg-violet-100/80 p-0.5 shadow-inner shadow-violet-200/50">
                      <button
                        type="button"
                        onClick={() => setConceptFrame("phone")}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition ${
                          conceptFrame === "phone"
                            ? "bg-[#8b5cf6] text-white"
                            : "text-violet-900/70 hover:bg-violet-50/80 hover:text-violet-950"
                        }`}
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        Phone
                      </button>
                      <button
                        type="button"
                        onClick={() => setConceptFrame("desktop")}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition ${
                          conceptFrame === "desktop"
                            ? "bg-[#8b5cf6] text-white"
                            : "text-violet-900/70 hover:bg-violet-50/80 hover:text-violet-950"
                        }`}
                      >
                        <Monitor className="h-3.5 w-3.5" />
                        Desktop
                      </button>
                    </div>
                  </div>

                  {conceptFrame === "phone" ? (
                    <div className="mx-auto flex max-w-[260px] justify-center">
                      <div className="w-full rounded-[2rem] border-[6px] border-violet-400/50 bg-gradient-to-b from-violet-200/40 to-violet-300/30 p-1.5 shadow-[0_20px_50px_rgba(91,33,182,0.35)] ring-2 ring-violet-500/20">
                        <div className="overflow-hidden rounded-[1.35rem] bg-[#0f0f14]">
                          <div className="flex h-5 justify-center">
                            <div className="h-3.5 w-16 rounded-b-xl bg-black/90" />
                          </div>
                          <div className="space-y-3 px-4 pb-5 pt-1">
                            <div className="flex items-center justify-between text-[10px] text-[#a8a9ad]">
                              <span>9:41</span>
                              <span className="flex items-center gap-0.5">
                                <span className="h-2 w-3 rounded-[1px] bg-white/30" />
                                <span className="text-[9px]">5G</span>
                              </span>
                            </div>
                            <div className="text-center text-xs font-semibold text-white">
                              Connect your calendar
                            </div>
                            <div className="flex justify-center gap-1.5">
                              {[0, 1, 2].map((i) => (
                                <div
                                  key={i}
                                  className={`h-1 w-7 rounded-full ${i === 1 ? "bg-[#8b5cf6]" : "bg-white/12"}`}
                                />
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setHotspot("hero")}
                              className={`relative w-full overflow-hidden rounded-xl border transition ${
                                hotspot === "hero"
                                  ? "border-[#8b5cf6]/60 ring-2 ring-[#8b5cf6]/25"
                                  : "border-white/10 hover:border-white/20"
                              }`}
                            >
                              <div className="h-24 bg-gradient-to-br from-[#3d1454] via-[#1a1a2e] to-[#0a0a0f]" />
                              <span className="absolute left-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-white/90">
                                Hero
                              </span>
                            </button>
                            <div className="space-y-1.5">
                              <div className="h-2 w-full rounded bg-white/10" />
                              <div className="h-2 w-4/5 rounded bg-white/10" />
                              <div className="h-2 w-3/5 rounded bg-white/10" />
                            </div>
                            <button
                              type="button"
                              onClick={() => setHotspot("cta")}
                              className={`w-full rounded-lg py-2.5 text-xs font-semibold transition ${
                                hotspot === "cta"
                                  ? "bg-[#a78bfa] text-[#1a0b2e] ring-2 ring-[#c084fc]/40"
                                  : "bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
                              }`}
                            >
                              Continue
                            </button>
                            <p className="text-center text-[10px] text-[#a8a9ad]">
                              Tap blocks to mimic a tester focus map.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border-2 border-violet-300/70 bg-[#0f0f14] shadow-[0_12px_40px_rgba(91,33,182,0.2)] ring-1 ring-violet-400/25">
                      <div className="flex items-center gap-2 border-b border-white/10 bg-[#111111] px-3 py-2">
                        <div className="flex gap-1">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                        </div>
                        <div className="ml-2 flex-1 truncate rounded-md bg-white/5 px-2 py-1 text-[10px] text-[#a8a9ad]">
                          app.founderssuite.test / onboarding / v3
                        </div>
                      </div>
                      <div className="grid gap-0 md:grid-cols-[140px_1fr]">
                        <div className="hidden border-r border-white/10 bg-[#111111] p-3 md:block">
                          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#a8a9ad]">
                            Frames
                          </div>
                          <button
                            type="button"
                            onClick={() => setHotspot("nav")}
                            className={`mb-2 w-full rounded-lg border px-2 py-2 text-left text-[10px] transition ${
                              hotspot === "nav"
                                ? "border-[#8b5cf6]/50 bg-[#8b5cf6]/15 text-white"
                                : "border-white/10 text-[#a8a9ad] hover:border-white/20"
                            }`}
                          >
                            Sidebar v3
                          </button>
                          <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-[9px] text-[#a8a9ad]">
                            Comments sync to the founder dashboard.
                          </div>
                        </div>
                        <div className="space-y-3 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-white">
                                Onboarding — desktop
                              </div>
                              <div className="mt-1 text-xs text-[#a8a9ad]">
                                Figma handoff · 6 screens
                              </div>
                            </div>
                            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-[#a8a9ad]">
                              Preview
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setHotspot("hero")}
                              className={`rounded-lg border p-3 text-left transition ${
                                hotspot === "hero"
                                  ? "border-[#8b5cf6]/50 bg-[#8b5cf6]/10"
                                  : "border-white/10 bg-[#111111] hover:border-white/20"
                              }`}
                            >
                              <div className="mb-2 h-16 rounded-md bg-gradient-to-br from-[#3d1454] to-[#111]" />
                              <div className="h-1.5 w-full rounded bg-white/10" />
                              <div className="mt-1 h-1.5 w-2/3 rounded bg-white/10" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setHotspot("cta")}
                              className={`rounded-lg border p-3 text-left transition ${
                                hotspot === "cta"
                                  ? "border-[#8b5cf6]/50 bg-[#8b5cf6]/10"
                                  : "border-white/10 bg-[#111111] hover:border-white/20"
                              }`}
                            >
                              <div className="mb-2 flex h-16 items-end justify-center rounded-md border border-dashed border-white/15 bg-white/[0.03]">
                                <div className="mb-2 h-7 w-24 rounded-md bg-[#8b5cf6]/80" />
                              </div>
                              <div className="text-[10px] text-[#a8a9ad]">Primary CTA</div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-violet-200/90 bg-gradient-to-br from-violet-100/70 via-violet-50/80 to-white p-4 shadow-sm ring-1 ring-violet-500/10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-widest text-violet-800">
                          Clarity score
                        </div>
                        <div className="mt-1 text-[11px] text-slate-600">
                          Simulated aggregate from prototype walkthroughs.
                        </div>
                      </div>
                      <div className="text-lg font-bold text-slate-900">{protoScore}%</div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={protoScore}
                      onChange={(e) => setProtoScore(Number(e.target.value))}
                      className="mt-3 w-full accent-[#8b5cf6]"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(
                        [
                          { id: "hero" as const, label: "Hero readable" },
                          { id: "cta" as const, label: "CTA obvious" },
                          { id: "nav" as const, label: "Nav discoverable" },
                        ] as const
                      ).map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => setHotspot(chip.id)}
                          className={`rounded-full border px-3 py-1 text-[11px] transition ${
                            hotspot === chip.id
                              ? "border-[#8b5cf6]/50 bg-violet-100 text-violet-900"
                              : "border-violet-100 text-violet-900/70 hover:border-violet-300 hover:bg-violet-50/80"
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {active === "Problem Validation" && problemSaved ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-900">
                  <Check className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                  Response captured. In production, the next tester prompt would load
                  automatically.
                </div>
              ) : active === "Beta Testing" ? (
                <div className="space-y-4">
                  <div className={`rounded-xl border p-4 ${severityTint}`}>
                    <div className="flex items-start gap-3">
                      <Bug className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                          Session snapshot
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">
                          Build 402 · iOS 18 · Session{" "}
                          <span className="font-mono text-violet-700">7f2a9c</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-600">
                          <span className="rounded-full border border-violet-200 bg-violet-50/90 px-2 py-0.5 text-violet-950">
                            Screen recording attached
                          </span>
                          <span className="rounded-full border border-violet-200 bg-violet-50/90 px-2 py-0.5 text-violet-950">
                            3-device matrix
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-200/80 bg-violet-50/50 p-4 ring-1 ring-violet-500/10">
                    <div className="text-xs font-semibold uppercase tracking-widest text-violet-800">
                      Repro checklist
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600">
                      Testers tick steps — founders get a reproducible trail, not vibes.
                    </p>
                    <ul className="mt-3 space-y-2">
                      {[
                        "Open Settings → Notifications",
                        "Toggle “Digest” off then on within 2s",
                        "Return to home — badge count should clear",
                      ].map((step, i) => (
                        <li key={step}>
                          <button
                            type="button"
                            onClick={() =>
                              setReproDone((prev) => {
                                const next = [...prev];
                                next[i] = !next[i];
                                return next;
                              })
                            }
                            className="flex w-full items-start gap-3 rounded-lg border border-violet-100 bg-white px-3 py-2.5 text-left text-sm text-slate-800 transition hover:border-violet-300 hover:shadow-sm hover:shadow-violet-500/10"
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                reproDone[i]
                                  ? "border-[#8b5cf6] bg-violet-50"
                                  : "border-slate-300"
                              }`}
                            >
                              {reproDone[i] ? (
                                <Check className="h-3 w-3 text-violet-600" />
                              ) : null}
                            </span>
                            <span className={reproDone[i] ? "text-slate-400 line-through" : ""}>
                              {i + 1}. {step}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-violet-200/70 bg-white p-4 shadow-sm ring-1 ring-violet-500/10">
                    <div className="text-xs font-semibold uppercase tracking-widest text-violet-800">
                      Auto-summary
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">
                      Severity: <span className="capitalize">{betaSeverity}</span>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <div className="flex gap-2 rounded-lg border border-violet-100 bg-violet-50/60 p-2">
                        <div className="h-14 w-20 shrink-0 rounded-md bg-gradient-to-br from-violet-300 to-violet-500" />
                        <div className="min-w-0 text-[10px] text-slate-600">
                          <div className="font-medium text-slate-900">before_checkout.png</div>
                          <div>Captured at crash boundary</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50/60 p-2">
                        <Calendar className="h-8 w-8 shrink-0 text-violet-600" />
                        <div className="text-[10px] text-slate-600">
                          <div className="font-medium text-slate-900">Timeline</div>
                          <div>First seen 2m 14s into session</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-600">
                      Structured payloads route to the right founder channel — no inbox archaeology.
                    </div>
                  </div>
                </div>
              ) : null}

              {!(active === "Problem Validation" && problemSaved) ? (
                <>
                  {model.options.map((label, idx) => {
                    const isSelected = idx === selected;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setSelected(idx);
                          if (active === "Beta Testing") {
                            if (idx === 0) setBetaSeverity("minor");
                            if (idx === 1) setBetaSeverity("major");
                            if (idx === 2) setBetaSeverity("critical");
                          }
                        }}
                        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                          isSelected
                            ? "border-[#8b5cf6]/50 bg-violet-100 shadow-sm ring-1 ring-violet-300/40"
                            : "border-violet-100 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
                            isSelected ? "border-[#8b5cf6]" : "border-violet-200"
                          }`}
                        >
                          {isSelected ? (
                            <div className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
                          ) : null}
                        </div>
                        <div className="text-sm text-slate-800">{label}</div>
                      </button>
                    );
                  })}
                </>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-violet-100 bg-gradient-to-r from-violet-50/90 via-white to-violet-50/50 px-6 py-4">
              <div className="flex items-center gap-3 text-xs font-medium text-violet-950/70">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-violet-400 shadow-sm shadow-violet-500/25" />
                <span>{model.footer.read}</span>
                <span>•</span>
                <span>{completionPct}% completion</span>
              </div>
              <button
                type="button"
                onClick={onFooterCta}
                disabled={active === "Problem Validation" && problemSaved}
                className="rounded-full bg-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/30 transition hover:bg-[#7c3aed] disabled:pointer-events-none disabled:opacity-40"
              >
                {active === "Problem Validation" && problemSaved
                  ? "Done"
                  : model.cta}
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-violet-900/55">
            Each mode is a live-feel preview — switch tabs to explore problem validation, concept
            prototyping with device mockups, and beta triage flows. Nothing is submitted.
          </p>
        </div>
      </div>
    </section>
  );
}
