"use client";

import { useEffect, useState } from "react";
import { getMatchesByUser, submitFeedback } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "sonner";
import type { Match } from "@/types";

const TAG_MAP: Record<string, string> = {
  submitted: "SUBMITTED",
  accepted: "ACCEPTED",
  rejected: "REJECTED",
  pending: "PENDING",
};

export default function FounderFeedbackPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMatchesByUser(user?.id ?? "demo")
      .then((all) => setMatches(all.filter((m) => m.status === "submitted" || m.status === "accepted" || m.status === "rejected")))
      .catch(() => setMatches([]))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  async function handleFeedback(matchId: string, outcome: "accepted" | "rejected") {
    try {
      await submitFeedback(matchId, outcome);
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, status: outcome } : m))
      );
      toast.success(outcome === "accepted" ? "Accepted" : "Rejected");
    } catch {
      toast.error("Failed to record feedback");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Feedback Submissions
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          {isLoading ? "Loading…" : `${matches.length} total`}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-3xl bg-white border border-black/10 p-10 text-center text-[#6b7280]">
          No feedback yet. Matches will appear here once your agents submit to forms.
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-black/10 overflow-hidden">
          {matches.map((m, idx) => {
            const answers = m.agentAnswers ?? {};
            const firstAnswer = Object.values(answers)[0] ?? null;
            return (
              <div
                key={m.id}
                className={`px-6 py-6 ${idx === 0 ? "" : "border-t border-black/10"}`}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="h-10 w-10 rounded-full bg-[#ede9fe] text-[#3d1454] flex items-center justify-center font-extrabold text-sm">
                        {(m.tester?.name ?? "T")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-[#0a0a0f]">
                          {m.tester?.name ?? "Tester"}
                        </div>
                        <div className="mt-1 inline-flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[11px] border border-black/10 bg-[#f3f4f6] text-[#6b7280] font-semibold">
                            {TAG_MAP[m.status] ?? m.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-[#6b7280]">
                            {m.form?.title ?? m.formId}
                          </span>
                        </div>
                      </div>
                    </div>

                    {firstAnswer && (
                      <div className="mt-4 text-sm text-[#6b7280] leading-relaxed max-w-3xl">
                        {firstAnswer}
                      </div>
                    )}

                    {m.status === "submitted" && (
                      <div className="mt-4 flex gap-2">
                        <button
                          className="px-4 py-1.5 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
                          onClick={() => handleFeedback(m.id, "accepted")}
                        >
                          Accept
                        </button>
                        <button
                          className="px-4 py-1.5 rounded-full border border-black/10 bg-white text-sm font-semibold hover:bg-black/5 transition"
                          onClick={() => handleFeedback(m.id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-xs text-[#6b7280] font-semibold">MATCH SCORE</div>
                    <div className="mt-2 text-xl font-extrabold text-[#3d1454]">
                      {Math.round(m.score * 100)}%
                    </div>
                    <div className="mt-1 text-xs text-[#6b7280]">
                      {m.submittedAt?.slice(0, 10) ?? "—"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
