"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createForm } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type QuestionDraft = { question: string; type: "text" | "multiChoice" | "rating" };

const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B"];
const Q_TYPES: Array<{ value: QuestionDraft["type"]; label: string }> = [
  { value: "text", label: "Text" },
  { value: "multiChoice", label: "Multi-choice" },
  { value: "rating", label: "Rating" },
];

export default function NewFormPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetProfile, setTargetProfile] = useState("");
  const [stage, setStage] = useState("Seed");
  const [compensation, setCompensation] = useState("75");
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { question: "Describe your experience relevant to this problem.", type: "text" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ matchesTriggered: number } | null>(null);

  const canSubmit = useMemo(
    () =>
      title.length > 0 &&
      description.length >= 10 &&
      targetProfile.length > 0 &&
      questions.every((q) => q.question.length > 0),
    [title, description, targetProfile, questions]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0a0a0f]">
          New validation form
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Build a form — on submit, AI agents that match your target profile will auto-respond.
        </p>
      </div>

      <div className="bg-white border border-black/10 rounded-2xl p-6 space-y-6 shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title" className="text-[#0a0a0f] font-semibold">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Looking for B2B SaaS operators with sales experience"
              className="border-black/10 bg-white text-[#0a0a0f]"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="desc" className="text-[#0a0a0f] font-semibold">Description</Label>
            <Input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you trying to validate?"
              className="border-black/10 bg-white text-[#0a0a0f]"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tp" className="text-[#0a0a0f] font-semibold">Target profile</Label>
            <Input
              id="tp"
              value={targetProfile}
              onChange={(e) => setTargetProfile(e.target.value)}
              placeholder="e.g. Experienced B2B SaaS sellers who've built pipelines from scratch"
              className="border-black/10 bg-white text-[#0a0a0f]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#0a0a0f] font-semibold">Stage</Label>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStage(s)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${
                    stage === s
                      ? "bg-[#3d1454] text-white border-[#3d1454]"
                      : "bg-white border-black/10 text-[#0a0a0f] hover:bg-black/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comp" className="text-[#0a0a0f] font-semibold">
              Compensation <span className="text-[#6b7280] font-normal">(USD)</span>
            </Label>
            <Input
              id="comp"
              type="number"
              value={compensation}
              onChange={(e) => setCompensation(e.target.value)}
              className="border-black/10 bg-white text-[#0a0a0f]"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-[#0a0a0f]">Questions</div>
            <Button
              variant="outline"
              className="border-black/10 text-[#0a0a0f] hover:bg-black/5"
              onClick={() => setQuestions((q) => [...q, { question: "", type: "text" }])}
            >
              + Add question
            </Button>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_160px_100px] gap-3">
                <Input
                  value={q.question}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, question: e.target.value } : x))
                    )
                  }
                  placeholder="Question text"
                  className="border-black/10 bg-white text-[#0a0a0f]"
                />
                <div className="flex h-10 items-center rounded-full border border-black/10 bg-white px-4">
                  <select
                    value={q.type}
                    onChange={(e) =>
                      setQuestions((prev) =>
                        prev.map((x, i) =>
                          i === idx ? { ...x, type: e.target.value as QuestionDraft["type"] } : x
                        )
                      )
                    }
                    className="w-full bg-transparent text-sm text-[#0a0a0f] outline-none"
                  >
                    {Q_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="outline"
                  className="border-black/10 text-[#6b7280] hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== idx))}
                  disabled={questions.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        {result ? (
          <div className="rounded-2xl border border-[#8b5cf6]/20 bg-[#f3f0ff] p-4 text-sm text-[#3d1454]">
            ✓ Form created! Matching triggered for{" "}
            <span className="font-extrabold">{result.matchesTriggered}</span>{" "}
            {result.matchesTriggered === 1 ? "agent" : "agents"}.
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            className="border-black/10 text-[#0a0a0f] hover:bg-black/5"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
            disabled={!canSubmit || isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const resp = await createForm({
                  founderId: user?.id ?? "00000000-0000-0000-0000-000000000001",
                  title,
                  description,
                  targetProfile,
                  questions: questions.map((x) => ({
                    question: x.question,
                    type: x.type,
                    required: true,
                  })),
                });
                setResult({ matchesTriggered: resp.matchesTriggered });
                toast.success("Form created", {
                  description: `${resp.matchesTriggered} agent${resp.matchesTriggered !== 1 ? "s" : ""} matched`,
                });
              } catch (e: unknown) {
                toast.error("Failed to create form", {
                  description: e instanceof Error ? e.message : "Unknown error",
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? "Creating…" : "Create form & match agents"}
          </Button>
        </div>
      </div>
    </div>
  );
}
