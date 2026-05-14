"use client";

import { useMemo } from "react";
import { mockTesterProfiles } from "@/lib/mock-data";
import { BadgeCheck, Briefcase, DollarSign, Pencil, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TesterProfilePage() {
  const profile = mockTesterProfiles[0];
  const initials =
    profile.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "TD";

  const stats = useMemo(
    () => [
      { icon: <Users className="text-[#8b5cf6]" size={18} />, value: "12", label: "Tests Completed" },
      { icon: <Star className="text-[#8b5cf6]" size={18} />, value: String(profile.qualityScore ?? 4.9), label: "Quality Score" },
      { icon: <Briefcase className="text-[#8b5cf6]" size={18} />, value: String(profile.projectsTested ?? 8), label: "Posts Made" },
      { icon: <DollarSign className="text-[#8b5cf6]" size={18} />, value: `$${profile.hourlyRate ?? 25}/hr`, label: "Compensation" },
    ],
    [profile.hourlyRate, profile.projectsTested, profile.qualityScore],
  );

  const tags = (profile.tags ?? profile.skills ?? []).slice(0, 6);
  const experience = [
    { org: "Meridian", sub: "Beta Testing", weeks: "5 weeks" },
    { org: "Nexus CRM", sub: "Problem Validation", weeks: "2 weeks" },
    { org: "FreshBasket", sub: "Concept Prototyping", weeks: "3 weeks" },
  ];

  const posts = [
    {
      title:
        "Real-time transaction data is blazing fast. Bank-level trust signals need immediate attention.",
      body:
        "Tested E2E spend management tool. Data refresh speeds were impressive and consistent. Trust badges and permissions felt unclear — buried three clicks deep, and no “factory setup” option.",
      meta: "42",
    },
    {
      title:
        "AI-generated insights are impressive, but the chart builder needs serious work.",
      body:
        "The AI summary at the top of every dashboard is genuinely useful. But it can’t read paid spend well and export flows are brittle. Drag-and-drop broke on Firefox; column headers were cryptic; and I lost my work twice.",
      meta: "89",
    },
  ];

  return (
    <div className="space-y-6">
      {/* top band */}
      <div className="relative overflow-hidden rounded-3xl border border-[#dcd4ef] bg-[#f3f0f7] shadow-sm ring-1 ring-[#e8dff6]/80">
        <div className="h-28 bg-[linear-gradient(180deg,rgba(252,231,131,0.55)_0%,rgba(232,223,246,0.95)_45%,rgba(255,255,255,0)_100%)]" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 rounded-full bg-[#3d1454] text-white flex items-center justify-center text-xl font-extrabold ring-4 ring-white">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {profile.name}
                  </h1>
                  <BadgeCheck className="text-[#8b5cf6]" size={18} />
                  <span className="text-sm text-slate-600">He/Him</span>
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Recently beta-tested @{" "}
                  <span className="text-slate-900 font-medium">
                    {profile.previousCompany ?? "Meridian Capital"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs border border-slate-200 bg-slate-100">
                    {profile.domain ?? "B2B SaaS"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs border border-slate-200 bg-slate-100">
                    AI Powered
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium hover:bg-black/5 transition">
                <Pencil size={16} />
                Edit
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8b5cf6] text-white text-sm font-medium hover:bg-[#7c3aed] transition">
                Invite to Testing
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-slate-900">
                  {s.icon}
                  <div className="text-lg font-extrabold">{s.value}</div>
                </div>
                <div className="mt-1 text-xs text-slate-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold text-slate-900">About Me</div>
          <div className="mt-3 text-sm text-slate-600 leading-relaxed">
            {profile.bio ??
              "Currently pursuing a Master’s in Human–Computer Interaction. I apply qualitative testing sessions to uncover behavior and identify friction points that hinder emotional connection with a product."}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-slate-900">Recent posts</div>
            <button className="text-sm text-slate-600 hover:text-slate-900 transition">
              See all →
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            {posts.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5"
              >
                <div className="font-semibold text-slate-900">{p.title}</div>
                <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {p.body}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-600">{p.meta} likes</div>
                  <button className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium hover:bg-black/5 transition">
                    Go to post →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-extrabold text-slate-900">Previous experience</div>
          <button className="text-sm text-slate-600 hover:text-slate-900 transition">
            See all →
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {experience.map((e) => (
            <div
              key={e.org}
              className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 truncate">{e.org}</div>
                <div className="text-xs text-slate-600">{e.sub}</div>
              </div>
              <div className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs">
                {e.weeks}
              </div>
            </div>
          ))}
        </div>

        {tags.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className={cn(
                  "px-3 py-1 rounded-full text-xs border",
                  "border-slate-200 bg-slate-100 text-slate-900"
                )}
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

