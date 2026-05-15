import { useState } from "react";
import { CompanyCard } from "../components/tester/CompanyCard";
import type { DemoForm } from "../components/tester/CompanyCard";

const DEMO_FORMS: DemoForm[] = [
  {
    id: "00000000-0000-0000-0000-000000000021",
    title: "Clinical Ops Workflow Validation",
    stage: "Beta",
    description: "Testing our onboarding flow with clinical operations leads.",
  },
  {
    id: "00000000-0000-0000-0000-000000000022",
    title: "RevOps SaaS Beta",
    stage: "Pre-seed",
    description: "Structured feedback sessions for our sales ops dashboard.",
  },
];

export default function TesterFeed() {
  const [forms, setForms] = useState<DemoForm[]>(DEMO_FORMS);

  const current = forms[0];
  const currentScore = 0.85;
  const total = forms.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Your matches
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Swipe through companies that match your experience (mock).
        </p>
      </div>

      {!current ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
          <div className="text-lg font-semibold text-slate-900">No more matches today.</div>
          <div className="mt-2 text-sm text-slate-600">Check back tomorrow.</div>
        </div>
      ) : (
        <div className="flex justify-center">
          <CompanyCard
            form={current}
            score={currentScore}
            currentIndex={1}
            total={total}
            onPass={() => setForms((prev) => prev.slice(1))}
            onInterested={() => setForms((prev) => prev.slice(1))}
          />
        </div>
      )}
    </div>
  );
}
