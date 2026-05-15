"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileCheck, Star } from "lucide-react";
import { mockMatches } from "@/lib/mock-data";
import { pravatarUrl } from "@/lib/landing-pravatar";
import { MatchCircle } from "@/components/shared/MatchCircle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function FounderMatchDetailPage() {
  const params = useParams<{ matchId: string }>();
  const router = useRouter();
  const matchId = params?.matchId ?? "";

  const match = useMemo(() => mockMatches.find((m) => m.id === matchId), [matchId]);
  const [inviteStatus, setInviteStatus] = useState<"pending" | "invited" | "passed">("pending");

  if (!match?.tester) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-600">
        Match not found.
      </div>
    );
  }

  const t = match.tester;
  const initials =
    t.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "T";
  const headshot = t.pravatarImgId ? pravatarUrl(t.pravatarImgId, 160) : null;
  const matchPct = Math.round(match.score * 100);
  const tags = t.tags ?? t.skills ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar className="h-16 w-16 border border-[#dcd4ef] shadow-sm">
            {headshot ? <AvatarImage src={headshot} alt="" className="object-cover" /> : null}
            <AvatarFallback className="bg-[#ede9f7] text-lg font-extrabold text-[#4c1d95]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">{t.name}</h1>
              {t.isTopVoice ? (
                <Badge className="border-amber-200 bg-amber-50 text-amber-950">Top voice this week</Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {t.previousCompany ? `Previously beta tested @ ${t.previousCompany}` : t.professionalHeadline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.livedExperience}</p>
            <p className="mt-5 text-sm text-slate-600">
              <span className="font-extrabold tabular-nums text-slate-900">{t.totalTestingHours}</span>{" "}
              total testing hours
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-3">
          <div className="rounded-full bg-[#2d1b4e] p-3 shadow-lg ring-2 ring-[#f4d43a]/50 ring-offset-2 ring-offset-white">
            <MatchCircle
              score={matchPct / 100}
              size={112}
              progressStroke="#f4d43a"
              trackStroke="#4a3563"
              inactiveFill="rgba(45, 27, 78, 0.45)"
            />
          </div>
          <Badge className="border border-slate-200 bg-slate-100 capitalize text-slate-700">{match.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Star className="h-4 w-4 fill-violet-200 text-violet-700" />
            Quality score
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{t.qualityScore.toFixed(1)}</div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileCheck className="h-4 w-4 text-violet-700" />
            Products tested
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{t.projectsTested}</div>
        </div>
      </div>

      {match.form ? (
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Suggested study</div>
          <div className="mt-1 text-base font-semibold text-violet-900">{match.form.title}</div>
          <p className="mt-2 text-sm text-slate-600">{match.form.description}</p>
        </div>
      ) : null}

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

      {inviteStatus === "pending" ? (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="flex-1 min-w-[140px] border-slate-200 font-semibold text-slate-800 hover:bg-slate-50"
            onClick={() => setInviteStatus("passed")}
          >
            ✕ Pass
          </Button>
          <Button
            className="flex-1 min-w-[140px] bg-gradient-to-r from-amber-200 to-amber-100 font-semibold text-slate-900 hover:brightness-[1.02]"
            onClick={() => setInviteStatus("invited")}
          >
            ✓ Invite
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-slate-50 p-4 text-sm text-slate-700">
          {inviteStatus === "invited"
            ? "Invite queued (mock). The tester would receive your study link next."
            : "Marked as passed for this queue (mock)."}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href="/founder/matches"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
        >
          Back to matches
        </Link>
        <Button variant="ghost" className="text-slate-600" onClick={() => router.back()}>
          Previous page
        </Button>
      </div>
    </div>
  );
}
