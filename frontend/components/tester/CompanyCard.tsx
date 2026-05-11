"use client";

import { MatchCircle } from "@/components/shared/MatchCircle";
import type { ValidationForm } from "@/types";

export interface CompanyCardProps {
  form: ValidationForm;
  score: number;
  onPass: () => void;
  onInterested: () => void;
  currentIndex: number;
  total: number;
}

export function CompanyCard({
  form,
  score,
  onPass,
  onInterested,
  currentIndex,
  total,
}: CompanyCardProps) {
  const initials = (form.title || "Co").slice(0, 2).toUpperCase();

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_40px_rgba(15,23,42,0.07)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-violet-50">
              <span className="text-sm font-bold text-violet-900">{initials}</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">{form.title}</h2>
              <p className="text-sm text-slate-600">
                {form.stage ?? "Seed"} • ${form.compensation ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="shrink-0 rounded-full bg-slate-900 p-2 ring-2 ring-violet-200/60">
          <MatchCircle score={score} size={76} progressStroke="#c084fc" />
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-slate-600">{form.description}</p>

      <div className="mb-6 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-800">
          What they&apos;re looking for
        </p>
        <p className="text-sm text-slate-800">{form.targetProfile}</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPass}
          className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Pass
        </button>
        <button
          type="button"
          onClick={onInterested}
          className="flex-1 rounded-xl bg-[#8b5cf6] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7c3aed]"
        >
          Interested
        </button>
      </div>

      <div className="mt-3 text-center text-xs text-slate-500">
        Card {currentIndex} of {total}
      </div>
    </div>
  );
}
