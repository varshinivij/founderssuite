import { Link } from "react-router";

export function PricingSection() {
  return (
    <section id="pricing" className="relative scroll-mt-32 overflow-x-hidden px-6 py-16 md:py-20">
      <div className="mx-auto max-w-[1100px]">
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-10 shadow-[0_12px_48px_rgba(91,33,182,0.07)] backdrop-blur-sm md:p-12">
          <div>
            <h2 className="text-[32px] font-extrabold text-slate-900">Pricing</h2>
            <p className="mt-2 text-base text-slate-600">Choose your plan, scale your testing.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-8">
              <div className="text-xl font-bold text-slate-900">Basic</div>
              <div className="mt-2 text-sm text-slate-600">Core infrastructure to host centralized testing</div>
              <div className="mt-6 flex items-end gap-2">
                <div className="text-[48px] font-extrabold text-slate-900">$79</div>
                <div className="mb-2 text-slate-600">/month</div>
              </div>
              <div className="mt-6 text-sm font-semibold text-slate-900">Usage</div>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-600">
                <li>Access to tester profiles and commission settings</li>
                <li>Founder and testers are evaluated on the Quality Guide</li>
                <li>Consolidated dashboard for managing reviews</li>
              </ul>
              <Link
                to="/signup/founder"
                className="mt-8 block w-full rounded-full border border-slate-300 py-3 text-center font-medium text-slate-800 transition hover:bg-slate-100"
              >
                Sign up
              </Link>
            </div>

            <div className="relative rounded-2xl border-2 border-[#8b5cf6]/55 bg-white p-8 shadow-[0_0_0_1px_rgba(139,92,246,0.12)]">
              <div className="absolute right-6 top-6 rounded-full bg-[#8b5cf6] px-3 py-1 text-xs font-semibold text-white">
                Popular
              </div>
              <div className="text-xl font-bold text-slate-900">Credits</div>
              <div className="mt-2 text-sm text-slate-600">Scaling testing with additional credits</div>
              <div className="mt-6 flex items-end gap-2">
                <div className="text-[48px] font-extrabold text-slate-900">$50</div>
                <div className="mb-2 text-slate-600">/10 credits</div>
              </div>
              <div className="mt-6 text-sm font-semibold text-slate-900">Usage</div>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-600">
                <li>Each test evaluation requires credits</li>
                <li>Connecting to the network with accredited testers</li>
                <li>Participating in personalized matching</li>
                <li>Centralized feedback and candidate assessment</li>
              </ul>
              <Link
                to="/signup/founder"
                className="mt-8 block w-full rounded-full bg-[#8b5cf6] py-3 text-center font-medium text-white transition hover:bg-[#7c3aed]"
              >
                Buy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
