"use client";

import { useEffect, useState } from "react";
import { CompanyCard } from "@/components/tester/CompanyCard";
import { getMatchesByUser, submitTesterAnswers } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Match, ValidationForm } from "@/types";

type FeedItem = { match: Match; form: ValidationForm; score: number };

export default function TesterFeedPage() {
  const { user } = useAuth();
  const [pendingQueue, setPendingQueue] = useState<FeedItem[]>([]);
  const [invitedMatches, setInvitedMatches] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    getMatchesByUser(user?.id ?? "demo")
      .then((matches) => {
        const withForm = matches.filter((m) => Boolean(m.form));
        setPendingQueue(
          withForm
            .filter((m) => m.status === "pending")
            .map((m) => ({ match: m, form: m.form!, score: m.score }))
        );
        setInvitedMatches(
          withForm
            .filter((m) => m.status === "invited")
            .map((m) => ({ match: m, form: m.form!, score: m.score }))
        );
      })
      .catch(() => { setPendingQueue([]); setInvitedMatches([]); })
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  async function handleSubmit(matchId: string, formId: string) {
    const formAnswers = answers[matchId] ?? {};
    setSubmitting(matchId);
    try {
      await submitTesterAnswers(matchId, formAnswers);
      setInvitedMatches((prev) => prev.filter((i) => i.match.id !== matchId));
      toast.success("Feedback submitted! The founder can now see your answers.");
    } catch {
      toast.error("Failed to submit — please try again");
    } finally {
      setSubmitting(null);
    }
  }

  const currentPending = pendingQueue[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Your matches</h1>
        <p className="mt-1 text-sm text-slate-600">
          Swipe through companies that match your experience.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
          Loading matches…
        </div>
      ) : (
        <>
          {/* ── Invited matches — fill & submit ── */}
          {invitedMatches.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#3d1454]" />
                <h2 className="font-extrabold text-[#0a0a0f]">
                  Invited by founder ({invitedMatches.length})
                </h2>
              </div>
              <p className="text-sm text-[#6b7280] -mt-2">
                These founders reviewed your profile and sent you an invite. Fill in the form to get paid.
              </p>

              {invitedMatches.map(({ match, form, score }) => (
                <div
                  key={match.id}
                  className="rounded-3xl border border-[#dcd4ef] bg-[#f3f0f7] p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-extrabold text-[#2d1b4e] text-lg">{form.title}</div>
                      <div className="text-sm text-[#6b5f80] mt-0.5">{form.targetProfile}</div>
                      <div className="mt-1 text-xs font-semibold text-[#3d1454]">
                        {Math.round(score * 100)}% match
                      </div>
                    </div>
                    <span className="rounded-full bg-[#3d1454] px-3 py-1 text-xs font-bold text-white">
                      Invited
                    </span>
                  </div>

                  <div className="space-y-3">
                    {form.questions.map((q) => (
                      <div key={q.id} className="space-y-1">
                        <label className="text-sm font-semibold text-[#2d1b4e]">
                          {q.question}
                          {q.required && <span className="text-[#b95465] ml-1">*</span>}
                        </label>
                        {q.type === "rating" ? (
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                onClick={() =>
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [match.id]: { ...(prev[match.id] ?? {}), [q.id]: String(n) },
                                  }))
                                }
                                className={`h-9 w-9 rounded-full border text-sm font-bold transition ${
                                  answers[match.id]?.[q.id] === String(n)
                                    ? "bg-[#3d1454] border-[#3d1454] text-white"
                                    : "border-[#dcd4ef] bg-white text-[#2d1b4e] hover:bg-[#e8dff6]"
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        ) : q.type === "multiChoice" && q.options ? (
                          <div className="flex flex-wrap gap-2">
                            {q.options.map((opt) => (
                              <button
                                key={opt}
                                onClick={() =>
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [match.id]: { ...(prev[match.id] ?? {}), [q.id]: opt },
                                  }))
                                }
                                className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                                  answers[match.id]?.[q.id] === opt
                                    ? "bg-[#3d1454] border-[#3d1454] text-white"
                                    : "border-[#dcd4ef] bg-white text-[#2d1b4e] hover:bg-[#e8dff6]"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            rows={2}
                            value={answers[match.id]?.[q.id] ?? ""}
                            onChange={(e) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [match.id]: { ...(prev[match.id] ?? {}), [q.id]: e.target.value },
                              }))
                            }
                            placeholder="Your answer…"
                            className="w-full rounded-xl border border-[#dcd4ef] bg-white px-3 py-2 text-sm text-[#2d1b4e] placeholder:text-[#9b8cb0] focus:outline-none focus:ring-2 focus:ring-[#3d1454]/30"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={submitting === match.id}
                    onClick={() => handleSubmit(match.id, form.id)}
                    className="w-full rounded-full bg-[#3d1454] py-3 text-sm font-semibold text-white hover:bg-[#2d1b4e] transition disabled:opacity-50"
                  >
                    {submitting === match.id ? "Submitting…" : "Submit feedback"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Pending queue — tinder swipe ── */}
          <div className="space-y-4">
            {invitedMatches.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#6b7280]" />
                <h2 className="font-extrabold text-[#0a0a0f]">New matches ({pendingQueue.length})</h2>
              </div>
            )}

            {!currentPending ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
                <div className="text-lg font-semibold text-slate-900">No new matches today.</div>
                <div className="mt-2 text-sm text-slate-600">
                  {invitedMatches.length === 0
                    ? "Create an agent to start matching with founders."
                    : "Check back later for more opportunities."}
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <CompanyCard
                  form={currentPending.form}
                  score={currentPending.score}
                  currentIndex={1}
                  total={pendingQueue.length}
                  onPass={() => setPendingQueue((prev) => prev.slice(1))}
                  onInterested={() => setPendingQueue((prev) => prev.slice(1))}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
