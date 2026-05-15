"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  getFormSubmissions,
  closeForm,
  getPendingTesters,
  inviteTester,
  declineTester,
  type PendingTester,
} from "@/lib/api";
import { useForms } from "@/hooks/useForms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Match } from "@/types";

const POLL_INTERVAL = 5000;

export default function FounderFormDetailPage() {
  const params = useParams<{ formId: string }>();
  const formId = params?.formId ?? "";
  const { data, isLoading, refetch } = useForms();
  const form = useMemo(() => (data ?? []).find((f) => f.id === formId), [data, formId]);

  const [submissions, setSubmissions] = useState<Match[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [pendingTesters, setPendingTesters] = useState<PendingTester[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function loadSubmissions() {
    return getFormSubmissions(formId)
      .then((subs) => setSubmissions(subs.filter((s) => s.status === "submitted")))
      .catch(() => {});
  }

  useEffect(() => {
    if (!formId) return;

    setSubsLoading(true);
    loadSubmissions().finally(() => setSubsLoading(false));

    setPendingLoading(true);
    getPendingTesters(formId)
      .then(setPendingTesters)
      .catch(() => setPendingTesters([]))
      .finally(() => setPendingLoading(false));

    // Live poll for new submissions
    pollRef.current = setInterval(loadSubmissions, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  async function handleCloseForm() {
    try {
      await closeForm(formId);
      toast.success("Form closed");
      refetch?.();
    } catch {
      toast.error("Failed to close form");
    }
  }

  async function handleInvite(matchId: string) {
    setActioning(matchId);
    try {
      await inviteTester(matchId);
      setPendingTesters((prev) => prev.filter((t) => t.matchId !== matchId));
      toast.success("Invite sent — tester will see this in their feed");
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setActioning(null);
    }
  }

  async function handleDecline(matchId: string) {
    setActioning(matchId);
    try {
      await declineTester(matchId);
      setPendingTesters((prev) => prev.filter((t) => t.matchId !== matchId));
    } catch {
      toast.error("Failed to decline tester");
    } finally {
      setActioning(null);
    }
  }

  // Determine if a match is from a human tester or AI agent — human testers
  // are invited first (status was "invited") before becoming "submitted".
  // We use the agent ID prefix to distinguish: agent_h* = human.
  function isHuman(match: Match) {
    return match.agentId?.startsWith("agent_h");
  }

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

  const currentTester = pendingTesters[0];
  const aiSubmissions = submissions.filter((m) => !isHuman(m));
  const humanSubmissions = submissions.filter((m) => isHuman(m));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0a0a0f]">
            {form.title}
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            {form.stage ?? "—"} • ${form.compensation ?? 0} •{" "}
            <span className="font-semibold text-[#3d1454]">
              {subsLoading ? "…" : submissions.length} submission{submissions.length !== 1 ? "s" : ""}
            </span>
            {" "}
            <span className="text-[10px] uppercase tracking-widest text-[#6b5f80]">
              · live
            </span>
          </p>
        </div>
        {form.status === "open" && (
          <Button
            variant="outline"
            className="border-black/10 text-[#0a0a0f] hover:bg-black/5"
            onClick={handleCloseForm}
          >
            Close form
          </Button>
        )}
      </div>

      <Tabs defaultValue="submissions">
        <TabsList className="bg-white border border-black/10 rounded-full p-1">
          <TabsTrigger value="submissions" className="rounded-full data-[state=active]:bg-[#3d1454] data-[state=active]:text-white">
            Submissions ({submissions.length})
          </TabsTrigger>
          <TabsTrigger value="testers" className="rounded-full data-[state=active]:bg-[#3d1454] data-[state=active]:text-white">
            Invite Testers {pendingTesters.length > 0 && `(${pendingTesters.length})`}
          </TabsTrigger>
          <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-[#3d1454] data-[state=active]:text-white">
            Overview
          </TabsTrigger>
        </TabsList>

        {/* ── All Submissions — AI + human ── */}
        <TabsContent value="submissions" className="mt-4 space-y-4">
          {subsLoading ? (
            <CardSkeleton />
          ) : submissions.length === 0 ? (
            <div className="rounded-3xl bg-white border border-black/10 p-10 text-center text-[#6b7280]">
              <div className="text-3xl mb-3">⏳</div>
              <div className="font-semibold text-[#0a0a0f]">Waiting for submissions</div>
              <div className="mt-2 text-sm">
                AI agents matching your form will auto-submit within seconds of form creation.
                Human testers appear in the Invite Testers tab — invite them and they fill the form manually.
              </div>
            </div>
          ) : (
            <>
              {/* Human tester submissions first */}
              {humanSubmissions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#3d1454]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">
                      Human testers ({humanSubmissions.length})
                    </span>
                  </div>
                  {humanSubmissions.map((m) => (
                    <SubmissionCard key={m.id} match={m} label="Human" labelColor="bg-[#3d1454]"
                      onView={() => { setActiveMatch(m); setOpen(true); }} />
                  ))}
                </div>
              )}

              {/* AI agent submissions */}
              {aiSubmissions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#7c3aed]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">
                      AI agents ({aiSubmissions.length})
                    </span>
                  </div>
                  {aiSubmissions.map((m) => (
                    <SubmissionCard key={m.id} match={m} label="AI Agent" labelColor="bg-[#7c3aed]"
                      onView={() => { setActiveMatch(m); setOpen(true); }} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ── Tinder-style tester queue ── */}
        <TabsContent value="testers" className="mt-4">
          {pendingLoading ? (
            <CardSkeleton />
          ) : !currentTester ? (
            <div className="rounded-3xl bg-white border border-black/10 p-10 text-center text-[#6b7280]">
              <div className="text-3xl mb-3">🎉</div>
              <div className="font-semibold text-[#0a0a0f]">No testers in queue</div>
              <div className="mt-2 text-sm">
                Human testers who match this form will appear here. Once you invite them they'll see
                the form in their feed and can fill it manually.
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-[#6b7280]">
                {pendingTesters.length} tester{pendingTesters.length !== 1 ? "s" : ""} matched — invite or pass
              </p>

              <div className="w-full max-w-lg rounded-3xl border border-[#dcd4ef] bg-[#f3f0f7] p-6 shadow-[0_14px_48px_rgba(45,27,78,0.1)]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#c9b8e8] bg-[#e8dff6] text-lg font-extrabold text-[#2d1b4e]">
                    {(currentTester.tester?.name ?? "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-extrabold text-[#2d1b4e] text-lg">
                      {currentTester.tester?.name ?? "Anonymous Tester"}
                    </div>
                    <div className="text-sm text-[#6b5f80]">
                      {currentTester.tester?.domain} • {currentTester.tester?.projectsTested} forms filled
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-2xl font-extrabold text-[#3d1454]">
                      {Math.round(currentTester.score * 100)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-[#6b5f80]">match</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-[#dcd4ef] p-4 mb-4">
                  <div className="text-[11px] uppercase tracking-widest font-semibold text-[#6b5f80] mb-1">Background</div>
                  <p className="text-sm text-[#2d1b4e] leading-relaxed">
                    {currentTester.tester?.bio || "No bio available."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {(currentTester.tester?.skills ?? []).slice(0, 5).map((s) => (
                    <span key={s} className="rounded-full border border-[#c4b5fd] bg-[#f7f4fc] px-3 py-1 text-xs font-medium text-[#4c1d95]">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    disabled={actioning === currentTester.matchId}
                    onClick={() => handleDecline(currentTester.matchId)}
                    className="flex-1 rounded-full border border-[#f0b4b8] bg-white py-3 text-sm font-semibold text-[#2d1b4e] hover:bg-[#fff5f5] transition disabled:opacity-50"
                  >
                    ✕ Pass
                  </button>
                  <button
                    disabled={actioning === currentTester.matchId}
                    onClick={() => handleInvite(currentTester.matchId)}
                    className="flex-1 rounded-full bg-[#3d1454] py-3 text-sm font-semibold text-white hover:bg-[#2d1b4e] transition disabled:opacity-50"
                  >
                    ✓ Send Invite
                  </button>
                </div>
              </div>

              {pendingTesters.length > 1 && (
                <p className="text-xs text-[#6b7280]">+{pendingTesters.length - 1} more in queue</p>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Overview tab ── */}
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
                <div key={q.id} className="flex items-start justify-between gap-3 border border-black/10 rounded-xl p-4 bg-[#fafafa]">
                  <div className="text-sm text-[#0a0a0f]">{q.question}</div>
                  <Badge className="bg-[#f3f4f6] border border-black/10 text-[#6b7280]">{q.type}</Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border border-black/10 text-[#0a0a0f]">
          <DialogHeader>
            <DialogTitle>
              {activeMatch?.tester?.name ?? "Submission"} — answers
            </DialogTitle>
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

function SubmissionCard({
  match, label, labelColor, onView,
}: {
  match: Match;
  label: string;
  labelColor: string;
  onView: () => void;
}) {
  return (
    <div className="bg-white border border-black/10 rounded-2xl p-5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.08)] transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0a0a0f]">{match.tester?.name ?? "Agent"}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide ${labelColor}`}>
              {label}
            </span>
          </div>
          <div className="text-sm text-[#6b7280] mt-0.5">
            {match.submittedAt?.slice(0, 10) ?? "—"} • {Math.round(match.score * 100)}% match
          </div>
        </div>
        <button
          className="text-sm bg-[#3d1454] text-white px-4 py-2 rounded-full hover:bg-[#2d1b4e] transition font-semibold shrink-0"
          onClick={onView}
        >
          View answers
        </button>
      </div>
    </div>
  );
}
