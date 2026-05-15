"use client";

import { useEffect, useMemo, useState } from "react";
import { DollarSign, FileCheck, Star } from "lucide-react";
import { getMatchesByUser, submitTesterAnswers } from "@/lib/api";
import { MatchCircle } from "@/components/shared/MatchCircle";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Match } from "@/types";

export default function TesterMatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filling, setFilling] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    getMatchesByUser(user?.id ?? "demo")
      .then(setMatches)
      .catch(() => setMatches([]))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const invited = useMemo(() => matches.filter((m) => m.status === "invited" && m.form), [matches]);
  const pending = useMemo(() => matches.filter((m) => m.status === "pending" && m.form), [matches]);

  async function handleSubmit(matchId: string) {
    const formAnswers = answers[matchId] ?? {};
    setSubmitting(matchId);
    try {
      await submitTesterAnswers(matchId, formAnswers);
      setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, status: "submitted" } : m));
      setFilling(null);
      toast.success("Feedback submitted! The founder will see your answers.");
    } catch {
      toast.error("Failed to submit — please try again");
    } finally {
      setSubmitting(null);
    }
  }

  function setAnswer(matchId: string, qId: string, val: string) {
    setAnswers((prev) => ({ ...prev, [matchId]: { ...(prev[matchId] ?? {}), [qId]: val } }));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Your matches</h1>
        <p className="mt-1 text-sm text-slate-600">
          Founder invites and AI-matched opportunities in one place.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
          Loading…
        </div>
      ) : (
        <>
          {/* ── Invited by founder ── */}
          {invited.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#3d1454]" />
                <h2 className="font-extrabold text-[#0a0a0f]">
                  Invited by founder ({invited.length})
                </h2>
              </div>
              <p className="text-sm text-[#6b7280] -mt-2">
                A founder reviewed your profile and sent you an invite. Accept and fill the form to get paid.
              </p>

              {invited.map((m) => (
                <div key={m.id} className="rounded-3xl border border-[#dcd4ef] bg-[#f3f0f7] overflow-hidden">
                  {/* Header */}
                  <div className="p-6 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-extrabold text-[#2d1b4e] text-lg">{m.form!.title}</div>
                      <div className="text-sm text-[#6b5f80] mt-0.5">{m.form!.targetProfile}</div>
                      <div className="mt-1 text-xs font-semibold text-[#3d1454]">
                        {Math.round(m.score * 100)}% match
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-full bg-[#3d1454] px-3 py-1 text-xs font-bold text-white">
                        Invited
                      </span>
                      {filling !== m.id && (
                        <button
                          onClick={() => setFilling(m.id)}
                          className="rounded-full bg-[#3d1454] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d1b4e] transition"
                        >
                          Accept & Fill
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline form — shown when accepted */}
                  {filling === m.id && (
                    <div className="border-t border-[#dcd4ef] px-6 pb-6 pt-4 space-y-4 bg-white">
                      <div className="text-sm font-semibold text-[#2d1b4e]">{m.form!.description}</div>
                      <div className="space-y-4">
                        {m.form!.questions.map((q) => (
                          <div key={q.id} className="space-y-2">
                            <label className="text-sm font-semibold text-[#2d1b4e]">
                              {q.question}
                              {q.required && <span className="text-[#b95465] ml-1">*</span>}
                            </label>
                            {q.type === "rating" ? (
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <button
                                    key={n}
                                    onClick={() => setAnswer(m.id, q.id, String(n))}
                                    className={`h-10 w-10 rounded-full border text-sm font-bold transition ${
                                      answers[m.id]?.[q.id] === String(n)
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
                                    onClick={() => setAnswer(m.id, q.id, opt)}
                                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                                      answers[m.id]?.[q.id] === opt
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
                                rows={3}
                                value={answers[m.id]?.[q.id] ?? ""}
                                onChange={(e) => setAnswer(m.id, q.id, e.target.value)}
                                placeholder="Your answer…"
                                className="w-full rounded-xl border border-[#dcd4ef] bg-white px-3 py-2 text-sm text-[#2d1b4e] placeholder:text-[#9b8cb0] focus:outline-none focus:ring-2 focus:ring-[#3d1454]/30"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setFilling(null)}
                          className="flex-1 rounded-full border border-[#dcd4ef] bg-white py-3 text-sm font-semibold text-[#2d1b4e] hover:bg-[#f7f4fc] transition"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={submitting === m.id}
                          onClick={() => handleSubmit(m.id)}
                          className="flex-1 rounded-full bg-[#3d1454] py-3 text-sm font-semibold text-white hover:bg-[#2d1b4e] transition disabled:opacity-50"
                        >
                          {submitting === m.id ? "Submitting…" : "Submit feedback"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── AI-matched pending opportunities ── */}
          <div className="space-y-4">
            {invited.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#6b7280]" />
                <h2 className="font-extrabold text-[#0a0a0f]">AI matched ({pending.length})</h2>
              </div>
            )}

            {pending.length === 0 && invited.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#dcd4ef] bg-[#f3f0f7] p-10 text-center text-sm text-[#5c4d75]">
                No matches yet. Your agent will auto-match when a founder creates a relevant form.
              </div>
            )}

            {pending.map((m) => (
              <div
                key={m.id}
                className="overflow-hidden rounded-3xl border border-[#dcd4ef] bg-[#f3f0f7] shadow-[0_12px_40px_rgba(45,27,78,0.08)]"
              >
                <div className="grid grid-cols-1 items-center gap-6 p-6 lg:grid-cols-[1fr_160px]">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#c9b8e8] bg-[#e8dff6] text-xs font-extrabold text-[#2d1b4e]">
                        {(m.form?.title ?? "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-[#2d1b4e]">{m.form?.title}</div>
                        <div className="text-sm text-[#5c4d75]">{m.form?.targetProfile}</div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        { label: "Match", node: <><Star className="h-3.5 w-3.5 fill-[#c4b5fd] text-[#6d28d9]" /><span className="text-lg font-extrabold text-[#2d1b4e]">{Math.round(m.score * 100)}%</span></> },
                        { label: "Questions", node: <><FileCheck className="h-3.5 w-3.5 text-[#6d28d9]" /><span className="text-sm font-extrabold text-[#2d1b4e]">{m.form?.questions?.length ?? 0}</span></> },
                        { label: "Status", node: <><DollarSign className="h-3.5 w-3.5 text-[#6d28d9]" /><span className="text-sm font-extrabold text-[#2d1b4e] capitalize">{m.status}</span></> },
                      ].map((s) => (
                        <div key={s.label} className="rounded-2xl border border-[#d4c4ec] bg-[#e6dff1] px-2 py-3 text-center shadow-sm">
                          <div className="mb-1 flex items-center justify-center gap-1">{s.node}</div>
                          <div className="text-[10px] font-medium uppercase tracking-wide text-[#5c4d75]">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-full bg-[#2d1b4e] p-3 shadow-[0_12px_40px_rgba(45,27,78,0.3)]">
                      <MatchCircle score={m.score} size={88} progressStroke="#f4d43a" trackStroke="#4a3563" inactiveFill="rgba(45,27,78,0.45)" />
                    </div>
                    <span className="text-xs text-[#6b7280] text-center">Waiting for founder invite</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
