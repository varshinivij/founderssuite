"use client";

const items = [
  {
    name: "Sasha Nomura",
    tag: "ONBOARDING",
    body:
      "Setup wizard asks too much upfront. I’d love a “skip for now” option on non-essential steps. The pipeline configuration page especially felt overwhelming before I understood the product.",
    hours: "3h",
    rating: 4,
  },
  {
    name: "Kayla Liu",
    tag: "AI FEATURES",
    body:
      "Natural language command parsing is genuinely impressive — got my first automation running in 4 minutes. The suggestions engine is intuitive and didn’t feel gimmicky at all.",
    hours: "4h",
    rating: 5,
  },
  {
    name: "Marcus Reyes",
    tag: "UX FLOW",
    body:
      "Slack integration works great, but I couldn’t find GitHub anywhere in the connectors panel. This would be a dealbreaker for my dev team without it.",
    hours: "7h",
    rating: 4,
  },
  {
    name: "Tara Winters",
    tag: "INTEGRATIONS",
    body:
      "Desktop experience is polished and the timeline view is genuinely great. Mobile however is rough — touch targets too small, no swipe support on the kanban.",
    hours: "8h",
    rating: 3,
  },
];

export default function FounderFeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Feedback Submissions
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">{items.length} total</p>
      </div>

      <div className="rounded-3xl bg-white border border-black/10 overflow-hidden">
        {items.map((it, idx) => (
          <div
            key={it.name + it.hours}
            className={`px-6 py-6 ${idx === 0 ? "" : "border-t border-black/10"}`}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="h-10 w-10 rounded-full bg-[#ede9fe] text-[#3d1454] flex items-center justify-center font-extrabold text-sm">
                    {it.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-[#0a0a0f]">{it.name}</div>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[11px] border border-black/10 bg-[#f3f4f6] text-[#6b7280] font-semibold">
                        {it.tag}
                      </span>
                      <span className="text-xs text-[#6b7280]">{it.hours}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-[#6b7280] leading-relaxed max-w-3xl">
                  {it.body}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-xs text-[#6b7280] font-semibold">TASK RATING</div>
                <div className="mt-2 text-[#d4a373] tracking-[2px]">
                  {"★★★★★".slice(0, it.rating)}
                  <span className="text-black/15">
                    {"★★★★★".slice(it.rating)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

