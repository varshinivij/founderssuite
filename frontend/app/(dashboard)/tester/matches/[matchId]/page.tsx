"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockMatches } from "@/lib/mock-data";
import { getTesterCompanyProfile } from "@/lib/tester-company-profiles";
import { TesterCompanyLogoMark } from "@/components/tester/TesterCompanyLogoMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TesterMatchDetailPage() {
  const params = useParams<{ matchId: string }>();
  const router = useRouter();
  const matchId = params?.matchId ?? "";

  const match = useMemo(() => mockMatches.find((m) => m.id === matchId), [matchId]);
  const [status, setStatus] = useState(match?.status ?? "pending");

  if (!match?.form) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-600">
        Match not found.
      </div>
    );
  }

  const form = match.form;
  const brand = getTesterCompanyProfile(match.formId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <TesterCompanyLogoMark
            emoji={brand?.logoEmoji ?? "🏢"}
            label={brand?.logoLabel ?? form.title.slice(0, 2).toUpperCase()}
            size="row"
          />
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              {form.title}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {brand?.displayName ? (
                <>
                  <span className="font-medium text-slate-800">{brand.displayName}</span>
                  <span className="text-slate-400"> · </span>
                </>
              ) : null}
              {form.stage ?? "—"} • ${form.compensation ?? 0}
            </p>
          </div>
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
            onClick={() => setStatus("accepted")}
          >
            Accept invitation
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-slate-200 font-semibold text-slate-800 hover:bg-slate-50"
            onClick={() => setStatus("rejected")}
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
