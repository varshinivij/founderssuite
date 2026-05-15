"use client";

import { DollarSign, FlaskConical, Star } from "lucide-react";
import type { Match } from "@/types";
import { MatchCircle } from "@/components/shared/MatchCircle";

export function MatchCard({
  match,
  onPass,
  onInvite,
}: {
  match: Match;
  onPass: () => void;
  onInvite: () => void;
}) {
  const tester = match.tester;
  const score = match.score;

  const initials =
    tester?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "T";

  return (
    <div
      className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5 flex flex-col gap-4
                 hover:border-[#3f3f46] hover:shadow-[0_12px_32px_rgba(139,92,246,0.1)]
                 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#3d1454] border-2 border-[#8b5cf6] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">{initials}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold text-base">
                {tester?.name ?? "Tester"}
              </span>
              {tester?.isTopVoice ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f7d9c4] text-[#1a1a2e] tracking-wide">
                  TOP VOICE THIS WEEK
                </span>
              ) : null}
            </div>
            <p className="text-[#a8a9ad] text-xs mt-0.5">
              {tester?.previousCompany
                ? `Previously beta tested @ ${tester.previousCompany}`
                : tester?.domain ?? ""}
            </p>
          </div>
        </div>
        <MatchCircle score={score} size={76} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#1a1a2e] rounded-lg py-2 px-1">
          <div className="flex items-center justify-center gap-1 text-yellow-400 mb-0.5">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-white font-bold text-sm">
              {tester?.qualityScore?.toFixed?.(1) ?? tester?.qualityScore ?? "—"}
            </span>
          </div>
          <p className="text-[#a8a9ad] text-[10px]">Quality Score</p>
        </div>
        <div className="bg-[#1a1a2e] rounded-lg py-2 px-1">
          <div className="flex items-center justify-center gap-1 text-[#a78bfa] mb-0.5">
            <FlaskConical size={12} />
            <span className="text-white font-bold text-sm">
              {tester?.projectsTested ?? "—"}
            </span>
          </div>
          <p className="text-[#a8a9ad] text-[10px]">Products Tested</p>
        </div>
        <div className="bg-[#1a1a2e] rounded-lg py-2 px-1">
          <div className="flex items-center justify-center gap-1 text-[#a78bfa] mb-0.5">
            <DollarSign size={12} />
            <span className="text-white font-bold text-sm">
              ${tester?.hourlyRate ?? "—"}/hr
            </span>
          </div>
          <p className="text-[#a8a9ad] text-[10px]">Compensation</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(tester?.tags ?? tester?.skills ?? []).slice(0, 6).map((tag) => (
          <span
            key={tag}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#2d1b4e] text-[#a78bfa] border border-[#3d2463]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button className="text-[#a78bfa] text-sm border border-[#3f3f46] px-3 py-1.5 rounded-lg hover:bg-[#2d1b4e] transition">
          View Profile
        </button>
        <button
          onClick={onPass}
          className="flex-1 text-sm border border-[#3f3f46] text-[#a8a9ad] py-1.5 rounded-lg hover:border-red-500 hover:text-red-400 transition"
        >
          Pass
        </button>
        <button
          onClick={onInvite}
          className="flex-1 text-sm bg-[#8b5cf6] text-white py-1.5 rounded-lg hover:bg-[#7c3aed] transition font-medium"
        >
          Invite
        </button>
      </div>
    </div>
  );
}

