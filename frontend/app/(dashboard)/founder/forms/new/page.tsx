"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createForm } from "@/lib/api";
import { toast } from "sonner";

type QuestionDraft = { question: string; type: "text" | "multiChoice" | "rating"; options?: string };

export default function NewFormPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetProfile, setTargetProfile] = useState("");
  const [stage, setStage] = useState("Seed");
  const [compensation, setCompensation] = useState("75");
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { question: "Describe your experience relevant to this role.", type: "text" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ matchesTriggered: number } | null>(null);

  const canSubmit = useMemo(
    () => title.length > 0 && description.length >= 10 && targetProfile.length > 0 && questions.every((q) => q.question.length > 0),
    [title, description, targetProfile, questions]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          New form
        </h1>
        <p className="mt-1 text-sm text-neutral-text-gray">
          Build a validation form. On submit, matching agents will be triggered.
        </p>
      </div>

      <Card className="bg-bg-accent border-divider shadow-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tp">Target profile</Label>
            <Input id="tp" value={targetProfile} onChange={(e) => setTargetProfile(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Stage</Label>
            <Select value={stage} onValueChange={(v) => setStage(v ?? stage)}>
              <SelectTrigger className="bg-bg-card/40 border-divider text-white">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent className="bg-bg-accent border-divider text-white">
                {["Pre-Seed", "Seed", "Series A", "Series B"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comp">Compensation</Label>
            <Input id="comp" value={compensation} onChange={(e) => setCompensation(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Questions</div>
            <Button
              variant="outline"
              className="border-border text-white hover:bg-purple-deep/40"
              onClick={() =>
                setQuestions((q) => [...q, { question: "", type: "text" }])
              }
            >
              Add question
            </Button>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_200px_120px] gap-3">
                <Input
                  value={q.question}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, question: e.target.value } : x))
                    )
                  }
                  placeholder="Question text"
                />
                <Select
                  value={q.type}
                  onValueChange={(v) =>
                    setQuestions((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, type: v as QuestionDraft["type"] } : x))
                    )
                  }
                >
                  <SelectTrigger className="bg-bg-card/40 border-divider text-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-accent border-divider text-white">
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="multiChoice">Multi-choice</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="border-border text-white hover:bg-red-500/15 hover:border-red-500/40"
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
          <div className="rounded-lg border border-divider bg-bg-card/40 p-4 text-sm">
            Form created! Matching <span className="font-semibold">{result.matchesTriggered}</span> agents…
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            className="border-border text-white hover:bg-purple-deep/40"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            className="bg-purple hover:bg-purple-mid"
            disabled={!canSubmit || isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const resp = await createForm({
                  // Backend expects UUID; we can use a stable dummy founder UUID until real auth is wired.
                  founderId: "00000000-0000-0000-0000-000000000001",
                  title,
                  description,
                  targetProfile,
                  questions: questions.map((x) => ({
                    question: x.question,
                    type: x.type,
                    required: true,
                    options: undefined,
                  })),
                });
                setResult({ matchesTriggered: resp.matchesTriggered });
                toast.success("Form created", {
                  description: `Matching ${resp.matchesTriggered} agents…`,
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? "Creating…" : "Create form"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

