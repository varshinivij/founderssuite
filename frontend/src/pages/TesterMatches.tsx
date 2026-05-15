import { Link } from "react-router";
import { useEffect, useState } from "react";
import { FileCheck, Star } from "lucide-react";
import { fetchTesterMatches, updateMatchStatus } from "../lib/matches";
import type { TesterMatch } from "../lib/matches";
import { getTesterCompanyProfile } from "../lib/testerCompanyProfiles";
import { MatchCircle } from "../components/shared/MatchCircle";
import { TesterCompanyLogoMark } from "../components/tester/TesterCompanyLogoMark";

export default function TesterMatches() {
  const [filter, setFilter] = useState("All Matches");
  const [domain, setDomain] = useState("All Domains");
  const [sort, setSort] = useState("Match Score");
  const [matches, setMatches] = useState<TesterMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTesterMatches()
      .then(setMatches)
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(matchId: string, status: "accepted" | "rejected") {
    await updateMatchStatus(matchId, status);
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status } : m)));
  }

  const rows = matches
    .filter((m) => {
      if (filter === "Pending") return m.status === "pending";
      if (filter === "Accepted") return m.status === "accepted";
      return m.status === "pending" || m.status === "accepted";
    })
    .map((m, idx) => {
      const formId = m.formId ?? `form_${(idx % 6) + 1}`;
      const brand = getTesterCompanyProfile(formId);
      return {
        id: m.id,
        formId,
        company: brand?.displayName ?? m.formTitle ?? "Company",
        logoEmoji: brand?.logoEmoji ?? "🏢",
        logoLabel: brand?.logoLabel ?? (m.formTitle ?? "Co").slice(0, 2).toUpperCase(),
        subtitle: ["Website Beta Test", "Mobile App User Testing", "Interactive Learning Feedback"][idx % 3],
        matchPct: m.matchScore,
        minScore: m.qualityScore ?? 4.0,
        stage: ["Pre", "Post", "Seed"][idx % 3],
        tags: ["Problem Validation", "Concept Prototyping", "Beta Testing", "UX", "US, UK"].slice(0, 4),
        status: m.status,
      };
    })
    .sort((a, b) => {
      if (sort === "Newest") return 0;
      if (sort === "Company") return a.company.localeCompare(b.company);
      return b.matchPct - a.matchPct;
    });

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
        {[
          { label: "Filter", value: filter, setValue: setFilter, options: ["All Matches", "Pending", "Accepted"] },
          { label: "Domain", value: domain, setValue: setDomain, options: ["All Domains", "FinTech", "SaaS", "HealthTech"] },
          { label: "Sort", value: sort, setValue: setSort, options: ["Match Score", "Newest", "Company"] },
        ].map(({ label, value, setValue, options }) => (
          <div key={label}>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6b5f80]">{label}</div>
            <div className="mt-2 flex h-11 items-center justify-between rounded-full border border-[#dcd4ef] bg-[#f7f4fc] px-4">
              <div className="text-sm font-medium text-[#2d1b4e]">{value}</div>
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-transparent text-sm text-[#5c4d75] outline-none"
              >
                {options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6b5f80]">
        {loading ? "Loading…" : `${rows.length} matches in queue`}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading matches…</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">No matches found.</div>
      ) : (
        <div className="space-y-5">
          {rows.map((r) => (
            <div
              key={r.id}
              className="overflow-hidden rounded-3xl border border-[#dcd4ef] bg-[#f3f0f7] shadow-[0_12px_40px_rgba(45,27,78,0.08)] ring-1 ring-[#e8dff6]/80"
            >
              <div className="grid grid-cols-1 items-center gap-6 p-6 lg:grid-cols-[1fr_200px]">
                <div>
                  <div className="flex items-center gap-3">
                    <TesterCompanyLogoMark emoji={r.logoEmoji} label={r.logoLabel} size="compact" />
                    <div>
                      <div className="font-extrabold text-[#2d1b4e]">{r.company}</div>
                      <div className="text-sm text-[#5c4d75]">{r.subtitle}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      {
                        label: "Quality score",
                        node: (
                          <>
                            <Star className="h-3.5 w-3.5 fill-[#c4b5fd] text-[#6d28d9]" />
                            <span className="text-lg font-extrabold text-[#2d1b4e]">{r.minScore.toFixed(1)}</span>
                          </>
                        ),
                      },
                      {
                        label: "Launch stage",
                        node: (
                          <>
                            <FileCheck className="h-3.5 w-3.5 text-[#6d28d9]" />
                            <span className="text-sm font-extrabold leading-tight text-[#2d1b4e]">{r.stage}</span>
                          </>
                        ),
                      },
                    ].map((m) => (
                      <div key={m.label} className="rounded-2xl border border-[#d4c4ec] bg-[#e6dff1] px-2 py-3 text-center shadow-sm sm:px-3">
                        <div className="mb-1 flex items-center justify-center gap-1">{m.node}</div>
                        <div className="text-[10px] font-medium uppercase tracking-wide text-[#5c4d75]">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {r.tags.map((t) => (
                      <span key={t} className="rounded-full border border-[#c4b5fd] bg-[#f7f4fc] px-3 py-1 text-xs font-medium text-[#4c1d95]">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Link
                      to={`/tester/company/${r.formId}`}
                      className="rounded-full border-2 border-[#8b5cf6] bg-white px-4 py-2 text-sm font-semibold text-[#5b21b6] shadow-sm transition hover:bg-[#faf8ff]"
                    >
                      View company profile
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
                  {r.status === "pending" ? (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(r.id, "rejected")}
                        className="rounded-full border border-[#f0b4b8] bg-white px-5 py-2 text-sm font-semibold text-[#2d1b4e] transition hover:bg-[#fff5f5]"
                      >
                        ✕ Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(r.id, "accepted")}
                        className="rounded-full border border-[#d4a574]/50 bg-gradient-to-r from-[#fef6c3] via-[#fce8a6] to-[#e8c9a0] px-5 py-2 text-sm font-semibold text-[#2d1b4e] shadow-[0_6px_20px_rgba(234,179,8,0.22)] transition hover:brightness-[1.03]"
                      >
                        ✓ Accept
                      </button>
                    </div>
                  ) : (
                    <span className="rounded-full bg-[#ede9f7] px-4 py-1.5 text-sm font-semibold capitalize text-[#4c1d95]">
                      {r.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
