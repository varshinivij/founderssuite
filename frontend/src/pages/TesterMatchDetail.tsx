import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchMatch, updateMatchStatus } from "../lib/matches";
import type { TesterMatch, MatchStatus } from "../lib/matches";
import { getTesterCompanyProfile } from "../lib/testerCompanyProfiles";
import { TesterCompanyLogoMark } from "../components/tester/TesterCompanyLogoMark";

export default function TesterMatchDetail() {
  const params = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const matchId = params.matchId ?? "";

  const [match, setMatch] = useState<TesterMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<MatchStatus>("pending");

  useEffect(() => {
    fetchMatch(matchId)
      .then((m) => {
        setMatch(m);
        if (m) setStatus(m.status);
      })
      .finally(() => setLoading(false));
  }, [matchId]);

  async function handleAction(next: "accepted" | "rejected") {
    await updateMatchStatus(matchId, next);
    setStatus(next);
    setMatch((m) => (m ? { ...m, status: next } : m));
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">Loading match…</div>
    );
  }

  if (!match) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-600">
        Match not found.
      </div>
    );
  }

  const brand = getTesterCompanyProfile(match.formId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <TesterCompanyLogoMark
            emoji={brand?.logoEmoji ?? "🏢"}
            label={brand?.logoLabel ?? match.formTitle.slice(0, 2).toUpperCase()}
            size="row"
          />
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              {match.formTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {brand?.displayName ? (
                <>
                  <span className="font-medium text-slate-800">{brand.displayName}</span>
                  <span className="text-slate-400"> · </span>
                </>
              ) : null}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
          {status}
        </span>
      </div>

      {match.formDescription ? (
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Description</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-600">{match.formDescription}</div>
        </div>
      ) : null}

      {match.formTargetProfile ? (
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Target profile</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-600">{match.formTargetProfile}</div>
        </div>
      ) : null}

      {status === "pending" ? (
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-lg bg-[#8b5cf6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7c3aed]"
            onClick={() => handleAction("accepted")}
          >
            Accept invitation
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            onClick={() => handleAction("rejected")}
          >
            Decline
          </button>
        </div>
      ) : status === "accepted" ? (
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
            Accepted
          </span>
          <div className="mt-2 text-sm text-slate-600">You have accepted this invitation.</div>
        </div>
      ) : null}

      <div>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
}
