"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMatch, submitFeedback } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "sonner";
import type { Match } from "@/types";

export default function TesterMatchDetailPage() {
  const params = useParams<{ matchId: string }>();
  const router = useRouter();
  const matchId = params?.matchId ?? "";

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string>("pending");

  useEffect(() => {
    if (!matchId) return;
    getMatch(matchId)
      .then((m) => {
        setMatch(m);
        setStatus(m.status);
      })
      .catch(() => setMatch(null))
      .finally(() => setIsLoading(false));
  }, [matchId]);

  async function handleAccept() {
    if (!match) return;
    try {
      await submitFeedback(match.id, "accepted");
      setStatus("accepted");
      toast.success("Invitation accepted");
    } catch {
      toast.error("Failed to accept");
    }
  }

  async function handleDecline() {
    if (!match) return;
    try {
      await submitFeedback(match.id, "rejected");
      setStatus("rejected");
      toast.success("Invitation declined");
    } catch {
      toast.error("Failed to decline");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!match?.form) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-600">
        Match not found.
      </div>
    );
  }

  const form = match.form;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            {form.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {form.stage ?? "—"} • ${form.compensation ?? 0}
          </p>
        </div>
        <Badge className="border border-slate-200 bg-slate-100 capitalize text-slate-700">
          {status}
        </Badge>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Description</div>
        <div className="mt-2 text-sm leading-relaxed text-slate-600">{form.description}</div>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Questions</div>
        {form.questions.map((q) => (
          <div key={q.id} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
            <div className="text-sm font-semibold text-slate-900">{q.question}</div>
            <div className="mt-1 text-sm text-slate-600">{match.agentAnswers?.[q.id] ?? "—"}</div>
          </div>
        ))}
      </div>

      {status === "pending" ? (
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-[#8b5cf6] font-semibold text-white hover:bg-[#7c3aed]"
            onClick={handleAccept}
          >
            Accept invitation
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-slate-200 font-semibold text-slate-800 hover:bg-slate-50"
            onClick={handleDecline}
          >
            Decline
          </Button>
        </div>
      ) : status === "submitted" ? (
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <Badge className="border border-blue-200 bg-blue-50 text-blue-800">Submitted</Badge>
          <div className="mt-2 text-sm text-slate-600">Answers are read-only.</div>
        </div>
      ) : null}

      <div>
        <Button
          variant="outline"
          className="border-slate-200 text-slate-800 hover:bg-slate-50"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
