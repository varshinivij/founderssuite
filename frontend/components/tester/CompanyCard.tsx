"use client";

import Link from "next/link";
import { DollarSign, Eye, FileCheck, Star } from "lucide-react";
import { MatchCircle } from "@/components/shared/MatchCircle";
import { getTesterCompanyProfile } from "@/lib/tester-company-profiles";
import type { ValidationForm } from "@/types";

export interface CompanyCardProps {
  form: ValidationForm;
  score: number;
  onPass: () => void;
  onInterested: () => void;
  currentIndex: number;
  total: number;
}

/** Lavender card + gold match ring + yellow–peach CTA (tester feed reference UI). */
export function CompanyCard({
  form,
  score,
  onPass,
  onInterested,
  currentIndex,
  total,
}: CompanyCardProps) {
  const brand = getTesterCompanyProfile(form.id);
  const headline = brand?.displayName ?? form.title;
  const initials = (brand?.logoLabel ?? (form.title || "Co")).slice(0, 2).toUpperCase();
  const qualityDisplay = (4.3 + score * 0.6).toFixed(1);
  const productsHint = 10 + (form.title?.length ?? 0) % 12;
  const tags = [
    form.stage ?? "SaaS",
    "Validation",
    "Remote",
    "Structured feedback",
  ].slice(0, 5);

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-[#dcd4ef] bg-[#f3f0f7] p-6 shadow-[0_14px_48px_rgba(45,27,78,0.1)] ring-1 ring-[#e8dff6]/80">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_min(200px,42%)]">
        <div className="min-w-0 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#c9b8e8] bg-[#e8dff6] shadow-sm">
              <span className="text-sm font-bold tracking-tight text-[#2d1b4e]">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold tracking-tight text-[#2d1b4e] md:text-2xl">{headline}</h2>
              {form.title !== headline ? (
                <p className="mt-0.5 text-[13px] leading-snug text-[#6b5f80]">{form.title}</p>
              ) : null}
              <p className="mt-1 text-sm leading-snug text-[#5c4d75]">
                {form.stage ?? "Seed"} validation • ${form.compensation ?? 0} stipend
                {form.founder?.companyName ? (
                  <>
                    {" "}
                    · <span className="font-medium text-[#2d1b4e]">{form.founder.companyName}</span>
                  </>
                ) : null}
              </p>
              <div className="mt-2 inline-flex items-center rounded-full border border-[#e8a87c] bg-[#fff8f0] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#c45d2a]">
                Rising match
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[#4a3f66]">{form.description}</p>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl border border-[#d4c4ec] bg-[#e6dff1] px-2 py-3 text-center shadow-sm sm:px-3">
              <div className="mb-1 flex items-center justify-center gap-1 text-[#6d28d9]">
                <Star className="h-3.5 w-3.5 fill-[#c4b5fd] text-[#6d28d9]" />
                <span className="text-sm font-extrabold text-[#2d1b4e]">{qualityDisplay}</span>
              </div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#5c4d75]">
                Quality score
              </p>
            </div>
            <div className="rounded-2xl border border-[#d4c4ec] bg-[#e6dff1] px-2 py-3 text-center shadow-sm sm:px-3">
              <div className="mb-1 flex items-center justify-center gap-1 text-[#6d28d9]">
                <FileCheck className="h-3.5 w-3.5" />
                <span className="text-sm font-extrabold text-[#2d1b4e]">{productsHint}</span>
              </div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#5c4d75]">
                Signals
              </p>
            </div>
            <div className="rounded-2xl border border-[#d4c4ec] bg-[#e6dff1] px-2 py-3 text-center shadow-sm sm:px-3">
              <div className="mb-1 flex items-center justify-center gap-1 text-[#6d28d9]">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="text-sm font-extrabold text-[#2d1b4e]">${form.compensation ?? 0}</span>
              </div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#5c4d75]">
                Offer
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d4c4ec] bg-[#ebe4f4]/90 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6d28d9]">
              What they&apos;re looking for
            </p>
            <p className="mt-1 text-sm leading-snug text-[#2d1b4e]">{form.targetProfile}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#c4b5fd] bg-[#f7f4fc] px-3 py-1 text-xs font-medium text-[#4c1d95]"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={`/tester/company/${form.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#8b5cf6] bg-white px-4 py-2.5 text-sm font-semibold text-[#5b21b6] shadow-sm transition hover:bg-[#faf8ff]"
            >
              <Eye className="h-4 w-4 shrink-0" />
              View opportunity
            </Link>
            <button
              type="button"
              onClick={onPass}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-[#f0b4b8] bg-white px-4 py-2.5 text-sm font-semibold text-[#2d1b4e] transition hover:bg-[#fff5f5] sm:flex-none"
            >
              Pass
            </button>
            <button
              type="button"
              onClick={onInterested}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#d4a574]/50 bg-gradient-to-r from-[#fef6c3] via-[#fce8a6] to-[#e8c9a0] px-5 py-2.5 text-sm font-semibold text-[#2d1b4e] shadow-[0_6px_24px_rgba(234,179,8,0.25)] transition hover:brightness-[1.03] sm:flex-none"
            >
              <span aria-hidden className="text-[#2d1b4e]">
                ✓
              </span>
              Interested
            </button>
          </div>

          <div className="text-center text-xs text-[#6b5f80]">
            Card {currentIndex} of {total}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end lg:pt-1">
          <div className="relative shrink-0 rounded-full bg-[#2d1b4e] p-3 shadow-[0_12px_40px_rgba(45,27,78,0.35)] ring-2 ring-[#f4d43a]/55 ring-offset-2 ring-offset-[#f3f0f7]">
            <MatchCircle
              score={score}
              size={112}
              progressStroke="#f4d43a"
              trackStroke="#4a3563"
              inactiveFill="rgba(45, 27, 78, 0.45)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
