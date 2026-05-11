"use client";

import { useMemo, useState } from "react";

export default function FounderDashboardPage() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const series = useMemo(
    () => [
      { day: "Day 1", value: 38 },
      { day: "Day 2", value: 52 },
      { day: "Day 3", value: 47 },
      { day: "Day 4", value: 61 },
      { day: "Day 5", value: 58 },
      { day: "Day 6", value: 72 },
      { day: "Day 7", value: 69 },
      { day: "Day 8", value: 84 },
      { day: "Day 9", value: 96 },
      { day: "Day 10", value: 79 },
    ],
    []
  );

  const max = useMemo(() => Math.max(...series.map((s) => s.value)), [series]);
  const ticks = useMemo(() => {
    // nice-ish ticks for a small KPI chart
    const top = Math.ceil(max / 10) * 10;
    return [top, Math.round(top * 0.66), Math.round(top * 0.33), 0];
  }, [max]);

  const chartHeightPx = 160;

  return (
    <div className="space-y-6">
      <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
        GROWTH
      </div>

      <div className="rounded-3xl bg-white border border-black/10 p-6">
        <div className="flex items-center gap-2">
          <div className="text-lg font-extrabold">Engagement Growth</div>
        </div>

        <div className="mt-6">
          <div className="relative">
            {/* y-axis */}
            <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-[11px] text-[#6b7280]">
              {ticks.map((t) => (
                <div key={t} className="leading-none">
                  {t}
                </div>
              ))}
            </div>

            <div className="ml-10" style={{ height: chartHeightPx }}>
              {/* grid lines */}
              <div className="absolute left-10 right-0 top-0 bottom-6 pointer-events-none">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-black/5"
                    style={{ top: `${(i / 3) * 100}%` }}
                  />
                ))}
              </div>

              <div
                className="grid grid-cols-10 gap-3 items-end pb-6 relative"
                style={{ height: chartHeightPx }}
              >
                {series.map((p, i) => {
                  const barHeight = Math.max(
                    6,
                    Math.round((p.value / Math.max(ticks[0], 1)) * (chartHeightPx - 24))
                  );
                  const active = hoverIndex === i;
                  return (
                    <div
                      key={p.day}
                      className="flex flex-col items-center gap-2 relative"
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => setHoverIndex(null)}
                    >
                      {active ? (
                        <div className="absolute -top-2 -translate-y-full px-3 py-1 rounded-full bg-white border border-black/10 text-[11px] text-[#0a0a0f] shadow-[0_12px_32px_rgba(0,0,0,0.08)] whitespace-nowrap">
                          {p.day}: <span className="font-semibold">{p.value}</span>
                        </div>
                      ) : null}

                      <div
                        className="w-full rounded-t-2xl rounded-b-md bg-[#ede9fe] border border-black/5 transition"
                        style={{
                          height: `${barHeight}px`,
                          background: active ? "#d9d6fe" : "#ede9fe",
                        }}
                      />
                      <div className="text-[11px] text-[#6b7280]">{p.day.replace("Day ", "")}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
              SCHEDULE
            </div>
            <div className="mt-4 space-y-3">
              {[
                { date: "MAR 28", title: "Phase 1 Kickoff", sub: "42 testers" },
                { date: "MAR 30", title: "Phase 1 Review", sub: "Sync findings with team" },
                { date: "APR 1", title: "Begin Phase 2", sub: "Iterations and usability round 2" },
                { date: "APR 4", title: "Phase 2 Report", sub: "Deliver finalized report" },
              ].map((r) => (
                <div key={r.title} className="flex items-start gap-4">
                  <div className="w-14 rounded-2xl bg-[#ede9fe] border border-black/10 py-3 text-center">
                    <div className="text-[10px] font-semibold text-[#6b7280]">
                      {r.date.split(" ")[0]}
                    </div>
                    <div className="text-lg font-extrabold text-[#3d1454]">
                      {r.date.split(" ")[1]}
                    </div>
                  </div>
                  <div>
                    <div className="font-extrabold text-[#0a0a0f]">{r.title}</div>
                    <div className="text-sm text-[#6b7280]">{r.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
              WORKFLOW AUTOMATION
            </div>
            <div className="mt-4 space-y-5">
              {[
                { label: "Task Completion", value: 88 },
                { label: "Tester Retention", value: 73 },
                { label: "Target Audience Compatibility", value: 81 },
                { label: "Customer Satisfaction", value: 67 },
                { label: "Average Rating", value: 82, suffix: "4.1 / 5" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-[#0a0a0f]">{m.label}</div>
                    <div className="text-sm text-[#6b7280]">
                      {m.suffix ?? `${m.value}%`}
                    </div>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-black/10 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-[linear-gradient(90deg,#f7d9c4,#d4a5a5)]"
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

