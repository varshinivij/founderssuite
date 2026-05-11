"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { mockMatches } from "@/lib/mock-data";
import { useForms } from "@/hooks/useForms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Match } from "@/types";

export default function FounderFormDetailPage() {
  const params = useParams<{ formId: string }>();
  const formId = params?.formId ?? "";
  const { data, isLoading } = useForms();
  const form = useMemo(() => (data ?? []).find((f) => f.id === formId), [data, formId]);

  const submissions = useMemo(
    () => mockMatches.filter((m) => m.formId === formId && m.status === "submitted"),
    [formId]
  );

  const [open, setOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="rounded-3xl bg-white border border-black/10 p-10 text-center text-[#6b7280]">
        Form not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0a0a0f]">
          {form.title}
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          {form.stage ?? "—"} • ${form.compensation ?? 0} • {submissions.length} submissions
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-white border border-black/10 rounded-full p-1">
          <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-[#3d1454] data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="submissions" className="rounded-full data-[state=active]:bg-[#3d1454] data-[state=active]:text-white">
            Submissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="bg-white border border-black/10 rounded-2xl p-6">
            <div className="text-sm font-semibold text-[#0a0a0f]">Description</div>
            <div className="mt-2 text-sm text-[#6b7280]">{form.description}</div>
          </div>
          <div className="bg-white border border-black/10 rounded-2xl p-6">
            <div className="text-sm font-semibold text-[#0a0a0f]">Target profile</div>
            <div className="mt-2 text-sm text-[#6b7280]">{form.targetProfile}</div>
          </div>
          <div className="bg-white border border-black/10 rounded-2xl p-6">
            <div className="text-sm font-semibold text-[#0a0a0f]">Questions</div>
            <div className="mt-3 space-y-2">
              {form.questions.map((q) => (
                <div
                  key={q.id}
                  className="flex items-start justify-between gap-3 border border-black/10 rounded-xl p-4 bg-[#fafafa]"
                >
                  <div className="text-sm text-[#0a0a0f]">{q.question}</div>
                  <Badge className="bg-[#f3f4f6] border border-black/10 text-[#6b7280]">
                    {q.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="mt-4 space-y-3">
          {submissions.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-black/10 rounded-2xl p-5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.10)] transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-[#0a0a0f]">{m.tester?.name ?? "Tester"}</div>
                  <div className="text-sm text-[#6b7280]">
                    Submitted: {m.submittedAt?.slice(0, 10) ?? "—"} • Score:{" "}
                    {Math.round(m.score * 100)}%
                  </div>
                </div>
                <button
                  className="text-sm bg-[#3d1454] text-white px-4 py-2 rounded-full hover:bg-[#2d1b4e] transition font-semibold"
                  onClick={() => {
                    setActiveMatch(m);
                    setOpen(true);
                  }}
                >
                  View answers
                </button>
              </div>
            </div>
          ))}
          {!submissions.length ? (
            <div className="rounded-3xl bg-white border border-black/10 p-10 text-center text-[#6b7280]">
              No submissions yet.
            </div>
          ) : null}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border border-black/10 text-[#0a0a0f]">
          <DialogHeader>
            <DialogTitle>Submitted answers</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {form.questions.map((q) => (
              <div key={q.id} className="border border-black/10 rounded-xl p-4 bg-[#fafafa]">
                <div className="text-sm font-semibold">{q.question}</div>
                <div className="mt-1 text-sm text-[#6b7280]">
                  {activeMatch?.agentAnswers?.[q.id] ?? "—"}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

