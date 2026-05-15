import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

type QuestionDraft = { question: string; type: "text" | "multiChoice" | "rating"; options?: string };

const STAGE_OPTIONS = ["Pre-Seed", "Seed", "Series A", "Series B"] as const;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

async function createForm(data: {
  founderId: string;
  title: string;
  description: string;
  targetProfile: string;
  questions: { question: string; type: string; required: boolean; options?: string[] | undefined }[];
}): Promise<{ matchesTriggered: number }> {
  const res = await fetch(`${API_BASE_URL}/forms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<{ matchesTriggered: number }>;
}

export default function NewForm() {
  const navigate = useNavigate();
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
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      title.length > 0 &&
      description.length >= 10 &&
      targetProfile.length > 0 &&
      questions.every((q) => q.question.length > 0),
    [title, description, targetProfile, questions],
  );

  const inputCls =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300/30";
  const labelCls = "block text-sm font-medium text-slate-700";
  const selectCls =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300/30";

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const resp = await createForm({
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create form");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          New form
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Build a validation form. On submit, matching agents will be triggered.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_4px_24px_rgba(91,33,182,0.06)] space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="title" className={labelCls}>Title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AudioNova Onboarding Validation"
              className={inputCls}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="desc" className={labelCls}>Description</label>
            <input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you want to validate and why"
              className={inputCls}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="tp" className={labelCls}>Target profile</label>
            <input
              id="tp"
              value={targetProfile}
              onChange={(e) => setTargetProfile(e.target.value)}
              placeholder="e.g. Clinical ops professionals with EHR experience"
              className={inputCls}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="stage" className={labelCls}>Stage</label>
            <select
              id="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className={selectCls}
            >
              {STAGE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="comp" className={labelCls}>Compensation ($)</label>
            <input
              id="comp"
              type="number"
              value={compensation}
              onChange={(e) => setCompensation(e.target.value)}
              placeholder="75"
              className={inputCls}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Questions</div>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() =>
                setQuestions((q) => [...q, { question: "", type: "text" }])
              }
            >
              Add question
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_120px]">
                <input
                  value={q.question}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, question: e.target.value } : x))
                    )
                  }
                  placeholder="Question text"
                  className={inputCls}
                />
                <select
                  value={q.type}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((x, i) =>
                        i === idx ? { ...x, type: e.target.value as QuestionDraft["type"] } : x
                      )
                    )
                  }
                  className={selectCls}
                >
                  <option value="text">Text</option>
                  <option value="multiChoice">Multi-choice</option>
                  <option value="rating">Rating</option>
                </select>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-40"
                  onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== idx))}
                  disabled={questions.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Form created! Matching <span className="font-semibold">{result.matchesTriggered}</span> agents…
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7c3aed] disabled:pointer-events-none disabled:opacity-40"
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Creating…" : "Create form"}
          </button>
        </div>
      </div>
    </div>
  );
}
