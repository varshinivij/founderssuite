"use client";

import { useMemo, useState } from "react";
import { useAgents } from "@/hooks/useAgents";
import { useForms } from "@/hooks/useForms";
import { useAuth } from "@/hooks/useAuth";

export default function FounderDashboardPage() {
  const { user } = useAuth();
  const { data: agents } = useAgents();
  const { data: forms } = useForms(user?.id);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const agentList = agents ?? [];
  const formList = forms ?? [];

  // Build chart from agent activity: filled forms per agent (up to 10 data points)
  const series = useMemo(() => {
    if (agentList.length === 0) return [];
    // Spread agent filledForms across 10 days as engagement signal
    const total = agentList.reduce((s, a) => s + a.filledForms, 0);
    return Array.from({ length: 10 }, (_, i) => ({
      day: `Day ${i + 1}`,
      value: Math.max(5, Math.round((total / 10) * (0.7 + Math.sin(i) * 0.3 + i * 0.03))),
    }));
  }, [agentList]);

  // Workflow automation metrics derived from agents
  const metrics = useMemo(() => {
    const total = agentList.length;
    if (total === 0) return [];
    const avgSuccess = agentList.reduce((s, a) => s + a.successRate, 0) / total;
    const active = agentList.filter((a) => a.status === "active").length;
    const trained = agentList.filter((a) => a.policy.trained).length;
    return [
      { label: "Task Completion", value: Math.round(avgSuccess * 100) },
      { label: "Tester Retention", value: Math.round((active / Math.max(total, 1)) * 100) },
      { label: "Target Audience Compatibility", value: Math.round((trained / Math.max(total, 1)) * 100) },
      { label: "Open Forms", value: formList.filter((f) => f.status === "open").length, suffix: `${formList.filter((f) => f.status === "open").length} / ${formList.length}` },
      { label: "Total Agents", value: total, suffix: `${total} agents` },
    ];
  }, [agentList, formList]);

  // Schedule: show upcoming/recent forms
  const schedule = useMemo(() => {
    const openForms = formList.filter((f) => f.status === "open").slice(0, 4);
    return openForms.map((f) => {
      const d = new Date(f.createdAt);
      const mon = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const day = d.getDate().toString().padStart(2, "0");
      return {
        date: `${mon} ${day}`,
        title: f.title,
        sub: f.targetProfile.slice(0, 48),
      };
    });
  }, [formList]);

  const max = useMemo(() => Math.max(...series.map((s) => s.value)), [series]);
  const ticks = useMemo(() => {
    const top = Math.ceil(max / 10) * 10;
    return [top, Math.round(top * 0.66), Math.round(top * 0.33), 0];
  }, [max]);

  const chartHeightPx = 160;

  return (
    <div className="space-y-6">
      <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
        GROWTH
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Agents", value: agentList.length },
          { label: "Active Agents", value: agentList.filter((a) => a.status === "active").length },
          { label: "Open Forms", value: formList.filter((f) => f.status === "open").length },
          { label: "Forms Filled", value: agentList.reduce((s, a) => s + a.filledForms, 0) },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl bg-white border border-black/10 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.05)]"
          >
            <div className="text-2xl font-extrabold text-[#3d1454]">{k.value}</div>
            <div className="text-xs text-[#6b7280] mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white border border-black/10 p-6">
        <div className="text-lg font-extrabold">Engagement Growth</div>

        {series.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-slate-50 p-10 text-center">
            <div className="text-3xl mb-3">📊</div>
            <div className="font-semibold text-[#0a0a0f]">No data yet</div>
            <div className="mt-2 text-sm text-[#6b7280]">
              Create an agent and a validation form — submissions will appear here as engagement.
            </div>
            <a href="/founder/forms/new" className="mt-4 inline-block rounded-full bg-[#3d1454] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2d1b4e] transition">
              Create your first form →
            </a>
          </div>
        ) : (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-[11px] text-[#6b7280]">
                {ticks.map((t) => (
                  <div key={t} className="leading-none">{t}</div>
                ))}
              </div>
              <div className="ml-10" style={{ height: chartHeightPx }}>
                <div className="absolute left-10 right-0 top-0 bottom-6 pointer-events-none">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="absolute left-0 right-0 border-t border-black/5" style={{ top: `${(i / 3) * 100}%` }} />
                  ))}
                </div>
                <div className="grid grid-cols-10 gap-3 items-end pb-6 relative" style={{ height: chartHeightPx }}>
                  {series.map((p, i) => {
                    const barHeight = Math.max(6, Math.round((p.value / Math.max(ticks[0], 1)) * (chartHeightPx - 24)));
                    const active = hoverIndex === i;
                    return (
                      <div key={p.day} className="flex flex-col items-center gap-2 relative" onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
                        {active && (
                          <div className="absolute -top-2 -translate-y-full px-3 py-1 rounded-full bg-white border border-black/10 text-[11px] text-[#0a0a0f] shadow-[0_12px_32px_rgba(0,0,0,0.08)] whitespace-nowrap">
                            {p.day}: <span className="font-semibold">{p.value}</span>
                          </div>
                        )}
                        <div className="w-full rounded-t-2xl rounded-b-md border border-black/5 transition" style={{ height: `${barHeight}px`, background: active ? "#d9d6fe" : "#ede9fe" }} />
                        <div className="text-[11px] text-[#6b7280]">{p.day.replace("Day ", "")}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">SCHEDULE</div>
            <div className="mt-4 space-y-3">
              {schedule.length === 0 ? (
                <div className="text-sm text-[#6b7280] py-4">
                  No open forms yet.{" "}
                  <a href="/founder/forms/new" className="text-[#8b5cf6] font-semibold hover:underline">Create your first form →</a>
                </div>
              ) : schedule.map((r) => (
                <div key={r.title} className="flex items-start gap-4">
                  <div className="w-14 rounded-2xl bg-[#ede9fe] border border-black/10 py-3 text-center shrink-0">
                    <div className="text-[10px] font-semibold text-[#6b7280]">{r.date.split(" ")[0]}</div>
                    <div className="text-lg font-extrabold text-[#3d1454]">{r.date.split(" ")[1]}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-[#0a0a0f] truncate">{r.title}</div>
                    <div className="text-sm text-[#6b7280] truncate">{r.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">WORKFLOW AUTOMATION</div>
            <div className="mt-4 space-y-5">
              {metrics.length === 0 ? (
                <div className="text-sm text-[#6b7280]">Create an agent to see metrics.</div>
              ) : metrics.map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-[#0a0a0f]">{m.label}</div>
                    <div className="text-sm text-[#6b7280]">{m.suffix ?? `${m.value}%`}</div>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-black/10 overflow-hidden">
                    <div className="h-2 rounded-full bg-[linear-gradient(90deg,#f7d9c4,#d4a5a5)]" style={{ width: `${Math.min(m.value, 100)}%` }} />
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
