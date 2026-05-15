"use client";

import { Building2, Hospital } from "lucide-react";

/** Demo copy: B2B marketplace — testers come from enterprise hospital / IDN pools, not B2C gig listings. */
const ACTIVE_ORG_POOL = {
  vertical: "MedTech",
  siteName: "Meridian Regional Medical Center",
  idn: "Meridian Health Integrated Network",
  blurb:
    "FoundersSuite is B2B-first: your validation work pulls from organization-rostered professionals (clinical, ops, and IT) under contract with a hospital or health system—not open consumer testers.",
} as const;

export default function FounderFormsPage() {
  const testers = [
    { name: "Sasha Nomura", email: "s.nomura@meridianhealth.org", status: "IN PROGRESS", tasks: "8/10", score: 4.7, payout: 36 },
    { name: "Kayla Liu", email: "k.liu@meridianhealth.org", status: "COMPLETED", tasks: "10/10", score: 4.2, payout: 38 },
    { name: "Kevin Do", email: "k.do@meridianhealth.org", status: "IN PROGRESS", tasks: "7/10", score: 4.5, payout: 28 },
    { name: "Marcus Reyes", email: "m.reyes@meridianhealth.org", status: "COMPLETED", tasks: "10/10", score: 3.9, payout: 31 },
    { name: "Tara Winters", email: "t.winters@meridianhealth.org", status: "IN PROGRESS", tasks: "4/10", score: 4.9, payout: 30 },
    { name: "Amara Osei", email: "a.osei@meridianhealth.org", status: "IN PROGRESS", tasks: "9/10", score: 4.3, payout: 29 },
    { name: "Dev Kumar", email: "d.kumar@meridianhealth.org", status: "COMPLETED", tasks: "10/10", score: 4.0, payout: 36 },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Manage Testers</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6b7280]">
            Rostered testers from your{" "}
            <span className="font-semibold text-[#3d1454]">active hospital partner pool</span> — enterprise
            MedTech validation, not a public consumer marketplace.
          </p>
          <div className="mt-2 text-sm text-[#6b7280]">
            <span className="font-semibold text-[#8b5cf6]">42</span>{" "}
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7280]">
              onboarded in pool
            </span>
          </div>
        </div>
        <button
          type="button"
          title="Invite another hospital, IDN, or clinical site to share a tester roster"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#3d1454] px-5 py-2.5 font-semibold text-white shadow-[0_18px_60px_rgba(61,20,84,0.25)] transition hover:bg-[#2d1b4e]"
        >
          + Invite organization
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-violet-200/90 bg-gradient-to-br from-violet-50/90 to-white p-4 shadow-sm sm:flex-row sm:items-start sm:gap-4 sm:p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-white text-violet-700 shadow-sm">
          <Hospital className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-700">
              <Building2 className="h-3 w-3" aria-hidden />
              B2B
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-900">
              {ACTIVE_ORG_POOL.vertical} priority
            </span>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your organization target</div>
            <div className="mt-0.5 text-base font-extrabold tracking-tight text-[#2d1b4e]">{ACTIVE_ORG_POOL.siteName}</div>
            <div className="text-sm text-slate-600">{ACTIVE_ORG_POOL.idn}</div>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">{ACTIVE_ORG_POOL.blurb}</p>
          <p className="text-xs leading-snug text-slate-500">
            Individuals below are <span className="font-semibold text-slate-700">badged staff or affiliates</span> of
            this site participating in your study queue — not independent B2C sign-ups.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-4 border-b border-black/10 px-6 py-4 text-[11px] font-semibold uppercase tracking-widest text-[#6b7280]">
          <div>Tester</div>
          <div>Status</div>
          <div>Tasks</div>
          <div>Score</div>
          <div>Payout</div>
        </div>
        {testers.map((t) => (
          <div
            key={t.email}
            className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-4 border-b border-black/10 px-6 py-5 last:border-b-0 items-center"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ede9fe] text-sm font-extrabold text-[#3d1454]">
                {t.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-[#0a0a0f]">{t.name}</div>
                <div className="truncate text-sm text-[#6b7280]">{t.email}</div>
                <div className="mt-1 truncate text-[11px] font-medium text-slate-500">
                  <span className="text-slate-600">{ACTIVE_ORG_POOL.siteName}</span>
                  <span className="text-slate-400"> · </span>
                  <span>enterprise pool</span>
                </div>
              </div>
            </div>

            <div>
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{
                  background: t.status === "COMPLETED" ? "rgba(139,92,246,0.15)" : "rgba(244,114,182,0.15)",
                  color: t.status === "COMPLETED" ? "#3d1454" : "#9f1239",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                {t.status}
              </span>
            </div>

            <div className="text-sm font-semibold text-[#0a0a0f]">{t.tasks}</div>
            <div className="text-sm font-semibold text-[#0a0a0f]">
              <span className="text-[#d4a373]">★</span> {t.score.toFixed(1)}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[#0a0a0f]">${t.payout}</div>
              <button
                type="button"
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-black/5"
              >
                View →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
