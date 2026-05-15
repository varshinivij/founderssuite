import { useState } from "react";

const DEFAULT_PROFILE = {
  companyName: "FoundersSuite",
  companyDescription:
    "A two-sided marketplace connecting founders with domain-matched testers.",
  productDemoUrl: "",
  lookingFor:
    "Experienced operators who can give direct, actionable feedback.",
  timeCommitment: "30 min interview or 5 min survey",
  feedbackStyle: "Blunt, specific, and outcome-oriented",
  industryTags: ["SaaS", "B2B", "Market Research"],
};

export default function FounderProfile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          Founder profile
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
          Configure what testers see and what you&apos;re looking for.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <div className="space-y-2">
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
              Company name
            </label>
            <input
              id="companyName"
              type="text"
              value={profile.companyName}
              onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="productDemoUrl" className="block text-sm font-medium text-slate-700">
              Product demo URL
            </label>
            <input
              id="productDemoUrl"
              type="text"
              value={profile.productDemoUrl}
              onChange={(e) => setProfile({ ...profile, productDemoUrl: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="companyDescription" className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="companyDescription"
              value={profile.companyDescription}
              onChange={(e) => setProfile({ ...profile, companyDescription: e.target.value })}
              rows={3}
              className="min-h-[88px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="lookingFor" className="block text-sm font-medium text-slate-700">
              What you&apos;re looking for
            </label>
            <textarea
              id="lookingFor"
              value={profile.lookingFor}
              onChange={(e) => setProfile({ ...profile, lookingFor: e.target.value })}
              rows={3}
              className="min-h-[88px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="timeCommitment" className="block text-sm font-medium text-slate-700">
              Time commitment
            </label>
            <input
              id="timeCommitment"
              type="text"
              value={profile.timeCommitment}
              onChange={(e) => setProfile({ ...profile, timeCommitment: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="feedbackStyle" className="block text-sm font-medium text-slate-700">
              Feedback style
            </label>
            <input
              id="feedbackStyle"
              type="text"
              value={profile.feedbackStyle}
              onChange={(e) => setProfile({ ...profile, feedbackStyle: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-sm font-medium text-slate-700">Industry tags</div>
            <div className="flex flex-wrap gap-2">
              {profile.industryTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-900"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
          <button
            type="button"
            className="rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7c3aed]"
          >
            Save (mock)
          </button>
        </div>
      </div>
    </div>
  );
}
