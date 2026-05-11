"use client";

import { useMemo, useState } from "react";
import { mockMatches } from "@/lib/mock-data";

export default function TesterMatchesPage() {
  const [filter, setFilter] = useState("All Matches");
  const [domain, setDomain] = useState("All Domains");
  const [sort, setSort] = useState("Match Score");

  const rows = useMemo(() => {
    const base = mockMatches
      .filter((m) => m.status === "pending" || m.status === "accepted")
      .map((m, idx) => ({
        id: m.id,
        company: m.form?.title ?? ["FreshBasket", "HealthTrack", "EduLearn"][idx % 3],
        subtitle: m.form?.stage ?? ["Website Beta Test", "Mobile App User Testing", "Interactive Learning Feedback"][idx % 3],
        matchPct: Math.round(m.score * 100),
        minScore: (m.tester?.qualityScore ?? 4.0) as number,
        stage: m.form?.stage ?? ["Pre", "Post", "Seed"][idx % 3],
        rate: `$${m.tester?.hourlyRate ?? [32, 45, 28][idx % 3]}/hr`,
        payType: idx % 2 === 0 ? "Flat Rate" : "Hourly",
        tags: ["Problem Validation", "Concept Prototyping", "Beta Testing", "UX", "US, UK"].slice(0, 4),
        status: m.status,
      }));

    return base;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Your founder matches
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Connect with founders based on the posts you create. Founders who match with you send invitations on your end.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold">
            Filter
          </div>
          <div className="mt-2 h-11 rounded-full border border-slate-200 bg-white px-4 flex items-center justify-between">
            <div className="text-sm font-medium text-slate-900">{filter}</div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-sm text-slate-600 outline-none"
            >
              <option>All Matches</option>
              <option>Pending</option>
              <option>Accepted</option>
            </select>
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold">
            Domain
          </div>
          <div className="mt-2 h-11 rounded-full border border-slate-200 bg-white px-4 flex items-center justify-between">
            <div className="text-sm font-medium text-slate-900">{domain}</div>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="bg-transparent text-sm text-slate-600 outline-none"
            >
              <option>All Domains</option>
              <option>FinTech</option>
              <option>SaaS</option>
              <option>HealthTech</option>
            </select>
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold">
            Sort
          </div>
          <div className="mt-2 h-11 rounded-full border border-slate-200 bg-white px-4 flex items-center justify-between">
            <div className="text-sm font-medium text-slate-900">{sort}</div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-sm text-slate-600 outline-none"
            >
              <option>Match Score</option>
              <option>Newest</option>
              <option>Compensation</option>
            </select>
          </div>
        </div>
      </div>

      <div className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold">
        {rows.length} matches in queue
      </div>

      <div className="space-y-5">
        {rows.slice(0, 3).map((r) => (
          <div
            key={r.id}
            className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm"
          >
            <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6 items-center">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-extrabold text-violet-900">
                    {r.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900">{r.company}</div>
                    <div className="text-sm text-slate-600">{r.subtitle}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: "Min. Score", value: `★ ${r.minScore.toFixed(1)}` },
                    { label: "Launch Stage", value: r.stage },
                    { label: r.payType, value: r.rate },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="rounded-2xl border border-violet-100 bg-violet-50/80 p-4"
                    >
                      <div className="text-lg font-extrabold text-violet-900">
                        {m.value}
                      </div>
                      <div className="text-xs text-slate-600">{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-semibold hover:bg-black/5 transition">
                    View Company Profile
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="h-28 w-28 rounded-full bg-[#2d1b4e] text-white flex items-center justify-center border-[6px] border-[#c084fc]/30 shadow-[0_20px_60px_rgba(61,20,84,0.18)]">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold">{r.matchPct}%</div>
                    <div className="text-sm opacity-80 -mt-1">Match</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-5 py-2 rounded-full border border-slate-200 bg-white text-sm font-semibold hover:bg-black/5 transition">
                    ✕ Decline
                  </button>
                  <button className="px-5 py-2 rounded-full bg-[#f7d9c4] text-slate-900 text-sm font-semibold border border-slate-200 hover:bg-[#f2cdb7] transition">
                    ✓ Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

