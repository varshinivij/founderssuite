"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

const faqs = [
  {
    q: "Who is FoundersSuite built for?",
    a: "Early-stage founders who need fast, high-signal validation and testers who want to share real expertise for paid opportunities.",
  },
  {
    q: "What stage of a product is the tool best for?",
    a: "From problem validation through beta testing — especially when you’re iterating weekly and need repeatable feedback loops.",
  },
  {
    q: "What types of products can be tested?",
    a: "B2B, consumer, and domain-specific products — the matching is experience-first, so niche workflows work well.",
  },
  {
    q: "How is this different from traditional user testing platforms?",
    a: "Instead of broad demographic targeting, we match on lived experience and domain context, then feed outcomes back into the system.",
  },
  {
    q: "What makes your feedback high quality?",
    a: "Clear incentives, domain-specific matching, and structured prompts that reduce bias and improve actionability.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="relative scroll-mt-32 overflow-x-hidden px-6 py-16 md:py-20">
      <div className="mx-auto max-w-[1100px]">
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-10 shadow-[0_12px_48px_rgba(91,33,182,0.07)] backdrop-blur-sm md:p-12">
          <div>
            <h2 className="text-[32px] font-extrabold text-slate-900">FAQ</h2>
            <p className="mt-2 text-base text-slate-600">
              Common questions about matching, feedback, and who the product is for.
            </p>
          </div>
          <div className="mt-10 divide-y divide-slate-200 border-b border-t border-slate-200">
            {faqs.map((item, idx) => {
              const open = idx === openIndex;
              return (
                <div
                  key={item.q}
                  className={`py-5 first:pt-0 last:pb-0 ${open ? "rounded-lg bg-violet-50/50 px-1" : ""}`}
                >
                  <button
                    className="flex w-full items-center justify-between gap-4 text-left"
                    onClick={() => setOpenIndex(open ? -1 : idx)}
                  >
                    <div className="text-base font-medium text-slate-900">
                      {item.q}
                    </div>
                    <ChevronRight
                      className={`shrink-0 text-slate-500 transition-transform ${
                        open ? "rotate-90" : "rotate-0"
                      }`}
                      size={18}
                    />
                  </button>
                  {open ? (
                    <div className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
                      {item.a}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
