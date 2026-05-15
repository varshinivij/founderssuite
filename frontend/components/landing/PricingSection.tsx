"use client";

export function PricingSection() {
  return (
    <section id="pricing" className="relative scroll-mt-32 overflow-x-hidden px-6 py-16 md:py-20">
      <div className="mx-auto max-w-[1100px]">
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-10 shadow-[0_12px_48px_rgba(91,33,182,0.07)] backdrop-blur-sm md:p-12">
          <div>
            <h2 className="text-[32px] font-extrabold text-slate-900">Pricing</h2>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Simple per-conversation pricing. You pay when a matched conversation runs—no monthly seat
              minimums for getting signal.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-violet-700">B2C domains</div>
              <div className="mt-2 text-xl font-bold text-slate-900">Consumer</div>
              <p className="mt-2 text-sm text-slate-600">
                Lifestyle, education, creator tools, wellness, and other primarily consumer-facing products.
              </p>
              <div className="mt-6 flex items-end gap-2">
                <div className="text-[48px] font-extrabold text-slate-900">$15</div>
                <div className="mb-2 text-slate-600">/ conversation</div>
              </div>

              <div className="mt-6 text-sm font-semibold text-slate-900">Includes</div>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-600">
                <li>Domain-matched tester routing</li>
                <li>Structured session or async thread (per your study)</li>
                <li>Centralized feedback capture</li>
              </ul>

              <button className="mt-8 w-full rounded-full border border-slate-300 py-3 font-medium text-slate-800 transition hover:bg-slate-100">
                Sign up
              </button>
            </div>

            <div className="relative rounded-2xl border-2 border-[#8b5cf6]/55 bg-white p-8 shadow-[0_0_0_1px_rgba(139,92,246,0.12)]">
              <div className="absolute right-6 top-6 rounded-full bg-[#8b5cf6] px-3 py-1 text-xs font-semibold text-white">
                B2B
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-violet-700">B2B domains</div>
              <div className="mt-2 text-xl font-bold text-slate-900">Teams, workflows &amp; compliance</div>
              <p className="mt-2 text-sm text-slate-600">
                SaaS, FinTech, MedTech, enterprise IT, and other business-critical validation where context
                density is higher.
              </p>
              <div className="mt-6 flex items-end gap-2">
                <div className="text-[48px] font-extrabold text-slate-900">$45</div>
                <div className="mb-2 text-slate-600">/ conversation</div>
              </div>

              <div className="mt-6 text-sm font-semibold text-slate-900">Includes</div>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-600">
                <li>Stricter domain &amp; role matching</li>
                <li>Richer session templates (security, procurement, admin personas)</li>
                <li>Same centralized feedback pipeline</li>
              </ul>

              <button className="mt-8 w-full rounded-full bg-[#8b5cf6] py-3 font-medium text-white transition hover:bg-[#7c3aed]">
                Get started
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
