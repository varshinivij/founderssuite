"use client";

import { useMemo, useState } from "react";

type PayoutMode = "completion" | "weekly" | "manual";

export default function FounderCommissionPage() {
  const [comp, setComp] = useState<"commission" | "flat">("commission");
  const [budget, setBudget] = useState(35);
  const [mode, setMode] = useState<PayoutMode>("completion");
  const [autoConvert, setAutoConvert] = useState(true);

  const modeCopy = useMemo(() => {
    if (mode === "completion") {
      return {
        title: "Upon Task Completion",
        body: "Payout triggers automatically as soon as a tester marks all assigned tasks complete.",
      };
    }
    if (mode === "weekly") {
      return {
        title: "Weekly Payouts",
        body: "All eligible payouts are batched and released every Monday. Testers wait up to 7 days after completion.",
      };
    }
    return {
      title: "Manual Release",
      body: "You approve every payout individually from the testers tab. Maximum control, required active management.",
    };
  }, [mode]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Compensation Preferences
        </h1>
      </div>

      <div className="rounded-3xl bg-white border border-black/10 p-6 md:p-8">
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setComp("commission")}
              className={`h-12 rounded-full border text-sm font-semibold transition ${
                comp === "commission"
                  ? "bg-[#3d1454] text-white border-[#3d1454]"
                  : "bg-white text-[#0a0a0f] border-black/15 hover:bg-black/5"
              }`}
            >
              Commission
            </button>
            <button
              onClick={() => setComp("flat")}
              className={`h-12 rounded-full border text-sm font-semibold transition ${
                comp === "flat"
                  ? "bg-[#3d1454] text-white border-[#3d1454]"
                  : "bg-white text-[#0a0a0f] border-black/15 hover:bg-black/5"
              }`}
            >
              Flat Rate
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
                BUDGET CONSTRAINT
              </div>
              <div className="text-sm font-semibold text-[#0a0a0f]">${budget}</div>
            </div>
            <div className="mt-3">
              <input
                type="range"
                min={10}
                max={120}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-[#8b5cf6]"
              />
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
              PAYMENT SCHEDULE
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  { k: "completion", t: "Upon Task Completion" },
                  { k: "weekly", t: "Weekly Payouts" },
                  { k: "manual", t: "Manual Release" },
                ] as const
              ).map((m) => {
                const active = mode === m.k;
                return (
                  <button
                    key={m.k}
                    onClick={() => setMode(m.k)}
                    className={`text-left rounded-2xl border p-5 transition ${
                      active
                        ? "border-[#8b5cf6]/40 bg-[#8b5cf6]/10"
                        : "border-black/10 bg-white hover:bg-black/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                          active ? "border-[#8b5cf6]" : "border-black/20"
                        }`}
                      >
                        {active ? (
                          <div className="h-3 w-3 rounded-full bg-[#8b5cf6]" />
                        ) : null}
                      </div>
                      <div className="font-semibold text-[#0a0a0f]">{m.t}</div>
                    </div>
                    {active ? (
                      <div className="mt-3 text-sm text-[#6b7280] leading-relaxed">
                        {modeCopy.body}
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-[#6b7280] leading-relaxed">
                        {m.k === "completion"
                          ? "Payout triggers automatically as soon as a tester marks all assigned tasks complete."
                          : m.k === "weekly"
                            ? "All eligible payouts are batched and released every Monday. Testers wait up to 7 days after completion."
                            : "You approve every payout individually from the testers tab. Maximum control, required active management."}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
              CURRENCY
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
              <div className="h-12 rounded-full border border-black/10 bg-white px-5 flex items-center justify-between">
                <div className="text-sm font-semibold text-[#0a0a0f]">
                  USD – US Dollar
                </div>
                <div className="text-[#6b7280]">▾</div>
              </div>

              <button
                onClick={() => setAutoConvert((v) => !v)}
                className="h-12 rounded-full border border-black/10 bg-white px-5 flex items-center justify-between gap-6"
              >
                <div className="text-sm font-semibold text-[#0a0a0f]">Auto-convert</div>
                <div
                  className={`h-7 w-12 rounded-full p-1 transition ${
                    autoConvert ? "bg-[#3d1454]" : "bg-black/15"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white transition ${
                      autoConvert ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

