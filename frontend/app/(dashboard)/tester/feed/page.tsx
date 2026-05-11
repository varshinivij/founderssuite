"use client";

import { useMemo, useState } from "react";
import { mockMatches } from "@/lib/mock-data";
import { CompanyCard } from "@/components/tester/CompanyCard";

export default function TesterFeedPage() {
  const initial = useMemo(
    () =>
      mockMatches
        .map((m) => ({ form: m.form, score: m.score }))
        .filter((x) => Boolean(x.form)),
    []
  );
  const [forms, setForms] = useState(initial);

  const current = forms[0]?.form;
  const currentScore = forms[0]?.score ?? 0.85;
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

