"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Box,
  Clock,
  Cpu,
  Eye,
  FileCheck,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";
import { mockMatches, mockFounderProfile } from "@/lib/mock-data";
import { pravatarUrl } from "@/lib/landing-pravatar";
import { MatchCircle } from "@/components/shared/MatchCircle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FounderMatchesPage() {
  const [filter, setFilter] = useState("All Matches");
  const [domain, setDomain] = useState("All Domains");
  const [sort, setSort] = useState("Match Score");

  const contextStrip = useMemo(
    () => ({
      product: mockFounderProfile.companyName,
      domain: mockFounderProfile.industryTags.join(" · "),
      capacity: "12 beta seats / month",
      matching: "Onboarding · AI features · Integrations",
    }),
    []
  );

  const rows = useMemo(() => {
    const withTester = mockMatches.filter((m) => m.tester);

    const statusFiltered = withTester.filter((m) => {
      if (filter === "All Matches") return true;
      if (filter === "Pending") return m.status === "pending";
      if (filter === "Accepted") return m.status === "accepted";
      return true;
    });

    const domainFiltered =
      domain === "All Domains"
        ? statusFiltered
        : statusFiltered.filter((m) => {
            const t = m.tester!;
            return t.domain === domain || (t.industryInterests?.includes(domain) ?? false);
          });

    const mapped = domainFiltered.map((m) => {
      const t = m.tester!;
      const initials =
        t.name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() ?? "T";
      const prev = t.previousCompany
        ? `Previously beta tested @ ${t.previousCompany}`
        : t.professionalHeadline ?? t.livedExperience.slice(0, 72);
      const baseTags = t.tags ?? t.skills ?? [];
      const extra = [t.domain, t.timezone ? `${t.timezone}` : null].filter(Boolean) as string[];
      const tags = [...new Set([...baseTags, ...extra])].slice(0, 8);
      return {
        id: m.id,
        formId: m.formId,
        formTitle: m.form?.title ?? "Validation study",
        matchPct: Math.round(m.score * 100),
        createdAt: m.createdAt,
        tester: t,
        initials,
        prevLine: prev,
        tags,
        quality: t.qualityScore,
        tested: t.projectsTested,
        totalHours: t.totalTestingHours,
      };
    });

    const sorted = [...mapped].sort((a, b) => {
      if (sort === "Quality") return b.quality - a.quality;
      if (sort === "Newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.matchPct - a.matchPct;
    });

    return sorted;
  }, [filter, domain, sort]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          Your tester matches
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
          Connect with testers whose experience lines up with what your product needs for beta
          validation, interviews, and structured feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[#dcd4ef] bg-gradient-to-r from-[#f4effc] via-[#faf7ff] to-[#f0e9fb] p-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 lg:p-5">
        {[
          {
            k: "Product",
            v: contextStrip.product,
            icon: <Box className="h-4 w-4 text-[#6d28d9]" aria-hidden />,
          },
          {
            k: "Domain",
            v: contextStrip.domain,
            icon: <Cpu className="h-4 w-4 text-[#6d28d9]" aria-hidden />,
          },
          {
            k: "Capacity",
            v: contextStrip.capacity,
            icon: <UsersRound className="h-4 w-4 text-[#6d28d9]" aria-hidden />,
          },
          {
            k: "Matching",
            v: contextStrip.matching,
            icon: <Sparkles className="h-4 w-4 text-[#6d28d9]" aria-hidden />,
          },
        ].map((cell) => (
          <div key={cell.k} className="flex gap-3 rounded-xl bg-white/70 p-3 shadow-sm ring-1 ring-[#e8dff6]/80">
            <div className="mt-0.5 shrink-0">{cell.icon}</div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6b5f80]">{cell.k}</div>
              <div className="mt-0.5 text-sm font-semibold leading-snug text-[#2d1b4e]">{cell.v}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6b5f80]">Filter</div>
          <div className="mt-2 flex h-11 items-center justify-between rounded-full border border-[#dcd4ef] bg-[#f7f4fc] px-4">
            <div className="text-sm font-medium text-[#2d1b4e]">{filter}</div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-[55%] bg-transparent text-sm text-[#5c4d75] outline-none"
            >
              <option>All Matches</option>
              <option>Pending</option>
              <option>Accepted</option>
            </select>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6b5f80]">Domain</div>
          <div className="mt-2 flex h-11 items-center justify-between rounded-full border border-[#dcd4ef] bg-[#f7f4fc] px-4">
            <div className="text-sm font-medium text-[#2d1b4e]">{domain}</div>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="max-w-[55%] bg-transparent text-sm text-[#5c4d75] outline-none"
            >
              <option>All Domains</option>
              <option>MedTech</option>
              <option>SaaS</option>
              <option>FinTech</option>
              <option>EdTech</option>
              <option>VehicleTech</option>
            </select>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6b5f80]">Sort</div>
          <div className="mt-2 flex h-11 items-center justify-between rounded-full border border-[#dcd4ef] bg-[#f7f4fc] px-4">
            <div className="text-sm font-medium text-[#2d1b4e]">{sort}</div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="max-w-[55%] bg-transparent text-sm text-[#5c4d75] outline-none"
            >
              <option>Match Score</option>
              <option>Newest</option>
              <option>Quality</option>
            </select>
          </div>
        </div>
      </div>

      <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#6b5f80]">
        {rows.length} matches in queue
      </div>

      <div className="space-y-5">
        {rows.map((r) => {
          const headshot = r.tester.pravatarImgId
            ? pravatarUrl(r.tester.pravatarImgId, 128)
            : null;
          return (
            <div
              key={r.id}
              className="overflow-hidden rounded-3xl border border-[#dcd4ef] bg-[#f3f0f7] shadow-[0_12px_40px_rgba(45,27,78,0.08)] ring-1 ring-[#e8dff6]/80"
            >
              <div className="grid grid-cols-1 items-center gap-6 p-6 lg:grid-cols-[1fr_200px]">
                <div>
                  <div className="flex flex-wrap items-start gap-3">
                    <Avatar className="h-12 w-12 border border-[#dcd4ef] shadow-sm">
                      {headshot ? (
                        <AvatarImage src={headshot} alt="" className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-[#ede9f7] text-sm font-extrabold text-[#4c1d95]">
                        {r.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-[#2d1b4e]">{r.tester.name}</span>
                        {r.tester.isTopVoice ? (
                          <span className="rounded-full border border-amber-200/90 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                            Top voice this week
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 text-sm text-[#5c4d75]">{r.prevLine}</div>
                      <div className="mt-1 text-xs text-[#7c6a94]">
                        Study: <span className="font-medium text-[#4b3a66]">{r.formTitle}</span>
                        <span className="text-[#7c6a94]"> · </span>
                        <span className="font-medium text-[#4b3a66]">{r.tester.domain}</span>
                        {r.tester.testingTypes?.length ? (
                          <>
                            <span className="text-[#7c6a94]"> · </span>
                            {r.tester.testingTypes.join(", ")}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                    {[
                      {
                        label: "Quality score",
                        node: (
                          <>
                            <Star className="h-3.5 w-3.5 fill-[#c4b5fd] text-[#6d28d9]" />
                            <span className="text-lg font-extrabold text-[#2d1b4e]">
                              {r.quality.toFixed(1)}
                            </span>
                          </>
                        ),
                      },
                      {
                        label: "Products tested",
                        node: (
                          <>
                            <FileCheck className="h-3.5 w-3.5 text-[#6d28d9]" />
                            <span className="text-lg font-extrabold text-[#2d1b4e]">{r.tested}</span>
                          </>
                        ),
                      },
                      {
                        label: "Total hours",
                        node: (
                          <>
                            <Clock className="h-3.5 w-3.5 text-[#6d28d9]" />
                            <span className="text-lg font-extrabold text-[#2d1b4e]">{r.totalHours}</span>
                          </>
                        ),
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="rounded-2xl border border-[#d4c4ec] bg-[#e6dff1] px-2 py-3 text-center shadow-sm sm:px-3"
                      >
                        <div className="mb-1 flex items-center justify-center gap-1">{m.node}</div>
                        <div className="text-[10px] font-medium uppercase tracking-wide text-[#5c4d75]">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {r.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-[#c4b5fd] bg-[#f7f4fc] px-3 py-1 text-xs font-medium text-[#4c1d95]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/founder/matches/${r.id}`}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-[#8b5cf6] bg-white px-4 py-2 text-sm font-semibold text-[#5b21b6] shadow-sm transition hover:bg-[#faf8ff]"
                    >
                      <Eye className="h-4 w-4" aria-hidden />
                      View profile
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-[#2d1b4e] p-3 shadow-[0_12px_40px_rgba(45,27,78,0.3)] ring-2 ring-[#f4d43a]/50 ring-offset-2 ring-offset-[#f3f0f7]">
                    <MatchCircle
                      score={r.matchPct / 100}
                      size={104}
                      progressStroke="#f4d43a"
                      trackStroke="#4a3563"
                      inactiveFill="rgba(45, 27, 78, 0.45)"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-[#f0b4b8] bg-white px-5 py-2 text-sm font-semibold text-[#2d1b4e] transition hover:bg-[#fff5f5]"
                    >
                      ✕ Pass
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-[#d4a574]/50 bg-gradient-to-r from-[#fef6c3] via-[#fce8a6] to-[#e8c9a0] px-5 py-2 text-sm font-semibold text-[#2d1b4e] shadow-[0_6px_20px_rgba(234,179,8,0.22)] transition hover:brightness-[1.03]"
                    >
                      ✓ Invite
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">
        Organization context reflects your active program ({mockFounderProfile.companyName}). Invites route through
        your study queue (mock UI).
      </p>
    </div>
  );
}
