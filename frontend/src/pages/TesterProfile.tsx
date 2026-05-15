import { Award, BadgeCheck, Briefcase, Calendar, DollarSign, Layers, Star, Users, Zap } from "lucide-react";

function pravatarUrl(imgId: number, size = 128) {
  return `https://i.pravatar.cc/${size}?img=${imgId}`;
}

const PROFILE = {
  name: "Maya R.",
  pronouns: "She/Her",
  domain: "MedTech",
  professional_headline: "Clinical ops · HIPAA-aware · EHR-adjacent workflows",
  lived_experience: "Former clinical ops lead; led device trials and IRB workflows.",
  skills: ["Clinical Ops", "Regulatory", "User Research"],
  hourly_rate: 85,
  quality_score: 4.9,
  projects_tested: 11,
  total_testing_hours: 168,
  bio: "I help teams validate workflows under real clinical constraints.",
  is_top_voice: true,
  pravatar_img_id: 27,
  availability: "Weeknights (after 6pm PT)",
  timezone: "PT",
  methodology: "Scenario-based walkthroughs with think-aloud, then tighten into repro steps.",
};

export default function TesterProfile() {
  const p = PROFILE;

  const stats = [
    { icon: <Users className="text-[#8b5cf6]" size={18} />, value: String(p.projects_tested), label: "Tests Completed" },
    { icon: <Star className="text-[#8b5cf6]" size={18} />, value: String(p.quality_score), label: "Quality Score" },
    { icon: <Briefcase className="text-[#8b5cf6]" size={18} />, value: String(p.total_testing_hours) + "h", label: "Total Hours" },
    { icon: <DollarSign className="text-[#8b5cf6]" size={18} />, value: `$${p.hourly_rate}/hr`, label: "Compensation" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-[#8b5cf6]/20 shadow-lg">
            <img src={pravatarUrl(p.pravatar_img_id, 176)} alt="" className="size-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{p.name}</h1>
              {p.pronouns && <span className="text-sm text-slate-500">({p.pronouns})</span>}
              {p.is_top_voice && (
                <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">Top voice this week</span>
              )}
            </div>
            {p.professional_headline && <p className="mt-1 text-sm text-slate-600">{p.professional_headline}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.skills.map((s) => (
                <span key={s} className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">{s.icon}<span className="text-lg font-extrabold text-slate-900">{s.value}</span></div>
            <div className="mt-1 text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Layers size={14} />Domain</div>
          <p className="mt-1 text-sm font-semibold text-slate-900">{p.domain}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Award size={14} />Lived Experience</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{p.lived_experience}</p>
        </div>
        {p.bio && (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><BadgeCheck size={14} />Bio</div>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{p.bio}</p>
          </div>
        )}
        {p.methodology && (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Zap size={14} />Testing Methodology</div>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{p.methodology}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Calendar size={14} />Availability</div>
            <p className="mt-1 text-sm text-slate-700">{p.availability} <span className="text-slate-400">({p.timezone})</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
