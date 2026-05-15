import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { FileCheck, Star } from "lucide-react";
import { fetchMatch, setMatchStatus } from "../lib/matches";
import type { TesterMatch } from "../lib/matches";
import { MatchCircle } from "../components/shared/MatchCircle";

const pravatarUrl = (imgId: number, size = 128) =>
  `https://i.pravatar.cc/${size}?img=${imgId}`;

export default function FounderMatchDetail() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const [match, setMatch] = useState<TesterMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteStatus, setInviteStatus] = useState<"pending" | "invited" | "passed">("pending");

  useEffect(() => {
    if (!matchId) return;
    fetchMatch(matchId)
      .then((m) => {
        setMatch(m);
        if (m?.status === "accepted") setInviteStatus("invited");
        if (m?.status === "rejected") setInviteStatus("passed");
      })
      .finally(() => setLoading(false));
  }, [matchId]);

  async function handleAction(next: "accepted" | "rejected") {
    if (!matchId) return;
    await setMatchStatus(matchId, next);
    setInviteStatus(next === "accepted" ? "invited" : "passed");
    setMatch((m) => (m ? { ...m, status: next } : m));
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading match…</div>;
  }

  if (!match) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-600">
        Match not found.
      </div>
    );
  }

  const initials = match.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const headshot = match.pravatarImgId ? pravatarUrl(match.pravatarImgId, 160) : null;
  const tags = match.skills ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {/* Avatar */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[#dcd4ef] shadow-sm">
            {headshot ? (
              <img
                src={headshot}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#ede9f7] text-lg font-extrabold text-[#4c1d95]">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                {match.name}
              </h1>
              {match.isTopVoice ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-950">
                  Top voice this week
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">{match.headline}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{match.livedExperience}</p>
            <p className="mt-5 text-sm text-slate-600">
              <span className="font-extrabold tabular-nums text-slate-900">{match.totalHours}</span>{" "}
              total testing hours
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3">
          <div className="rounded-full bg-[#2d1b4e] p-3 shadow-lg ring-2 ring-[#f4d43a]/50 ring-offset-2 ring-offset-white">
            <MatchCircle
              score={match.matchScore / 100}
              size={112}
              progressStroke="#f4d43a"
              trackStroke="#4a3563"
              inactiveFill="rgba(45, 27, 78, 0.45)"
            />
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm capitalize text-slate-700">
            {match.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Star className="h-4 w-4 fill-violet-200 text-violet-700" />
            Quality score
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {match.qualityScore.toFixed(1)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileCheck className="h-4 w-4 text-violet-700" />
            Products tested
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {match.projectsTested}
          </div>
        </div>
      </div>

      {match.formTitle ? (
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Suggested study</div>
          <div className="mt-1 text-base font-semibold text-violet-900">{match.formTitle}</div>
          {match.formDescription ? (
            <p className="mt-2 text-sm text-slate-600">{match.formDescription}</p>
          ) : null}
        </div>
      ) : null}

      {tags.length > 0 && (
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Focus areas</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-900"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {inviteStatus === "pending" ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleAction("rejected")}
            className="flex-1 min-w-[140px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            ✕ Pass
          </button>
          <button
            type="button"
            onClick={() => handleAction("accepted")}
            className="flex-1 min-w-[140px] rounded-lg bg-gradient-to-r from-amber-200 to-amber-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:brightness-[1.02]"
          >
            ✓ Invite
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-slate-50 p-4 text-sm text-slate-700">
          {inviteStatus === "invited"
            ? "Invite sent. The tester will receive your study link."
            : "Marked as passed for this queue."}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          to="/founder/matches"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
        >
          Back to matches
        </Link>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-10 items-center rounded-md px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Previous page
        </button>
      </div>
    </div>
  );
}
