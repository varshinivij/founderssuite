import { useEffect, useMemo, useState } from "react";
import { Heart, Search } from "lucide-react";

type Domain = "All" | "MedTech" | "SaaS" | "EdTech" | "FinTech" | "VehicleTech" | "Other";

const DOMAINS: Domain[] = ["All", "MedTech", "SaaS", "EdTech", "FinTech", "VehicleTech", "Other"];

const TITLES = [
  "How EHR integrations really fail in the field",
  "RevOps metrics founders get wrong on their first call",
  "What a district-wide LMS rollout actually looks like",
  "Fraud signal edge cases no one documents",
  "Fleet telematics: what works at 500 units doesn't at 5,000",
  "Why clinical ops leads reject SaaS tools in week one",
  "The CPQ trap: how pricing complexity kills sales velocity",
  "Procurement in public schools — what the vendor never learns",
];

const CONTENT = [
  "The handoff between HL7 feeds and custom workflows is where most implementations break. Teams underestimate the variance in how different EHRs expose the same concept.",
  "Founders pitch MoM ARR growth but ops teams ask about net retention and expansion. Align your language to the buyer's reporting cycle before the first discovery call.",
  "District IT is a political layer, not a technical one. Your champion is the curriculum director, not the CTO. Procurement goes through a committee that meets twice a year.",
  "Transaction velocity spikes aren't fraud by default. Time-of-day normalization and merchant category codes together catch 70% of cases before ML models are needed.",
  "Firmware rollouts across vehicle classes require staging environments that mirror production hardware—something most SaaS vendors discover too late.",
  "After the first 30 days, the support burden is the product. If onboarding requires an implementation manager, it isn't a SaaS product—it's a service.",
  "CPQ products add value when reps have discretion. If your pricing is catalog-based and non-negotiable, you're adding friction, not control.",
  "Curriculum alignment is the hidden procurement requirement. If your tool doesn't map to state standards documentation, it won't survive the committee stage.",
];

type Post = {
  id: string;
  domain: Exclude<Domain, "All">;
  title: string;
  content: string;
  author: { name: string; initials: string; imgId: number };
  peerLine: string;
  likes: number;
  replies: number;
  isTopVoice: boolean;
  daysAgo: number;
};

const POSTS: Post[] = [
  { id: "1", domain: "MedTech", title: TITLES[0]!, content: CONTENT[0]!, author: { name: "Maya R.", initials: "MR", imgId: 27 }, peerLine: "Peer @ AudioNova", likes: 94, replies: 6, isTopVoice: true, daysAgo: 1 },
  { id: "2", domain: "SaaS", title: TITLES[1]!, content: CONTENT[1]!, author: { name: "Devon K.", initials: "DK", imgId: 12 }, peerLine: "Peer @ BrightApps", likes: 71, replies: 4, isTopVoice: false, daysAgo: 2 },
  { id: "3", domain: "EdTech", title: TITLES[2]!, content: CONTENT[2]!, author: { name: "Aisha T.", initials: "AT", imgId: 32 }, peerLine: "Peer @ District 47", likes: 58, replies: 9, isTopVoice: true, daysAgo: 3 },
  { id: "4", domain: "FinTech", title: TITLES[3]!, content: CONTENT[3]!, author: { name: "Kenji S.", initials: "KS", imgId: 45 }, peerLine: "Peer @ PayScale", likes: 112, replies: 14, isTopVoice: false, daysAgo: 4 },
  { id: "5", domain: "VehicleTech", title: TITLES[4]!, content: CONTENT[4]!, author: { name: "Sofia L.", initials: "SL", imgId: 16 }, peerLine: "Peer @ FleetCo", likes: 44, replies: 3, isTopVoice: false, daysAgo: 5 },
  { id: "6", domain: "MedTech", title: TITLES[5]!, content: CONTENT[5]!, author: { name: "Maya R.", initials: "MR", imgId: 27 }, peerLine: "Peer @ AudioNova", likes: 88, replies: 7, isTopVoice: true, daysAgo: 6 },
  { id: "7", domain: "SaaS", title: TITLES[6]!, content: CONTENT[6]!, author: { name: "Devon K.", initials: "DK", imgId: 12 }, peerLine: "Peer @ BrightApps", likes: 55, replies: 2, isTopVoice: false, daysAgo: 8 },
  { id: "8", domain: "EdTech", title: TITLES[7]!, content: CONTENT[7]!, author: { name: "Aisha T.", initials: "AT", imgId: 32 }, peerLine: "Peer @ District 47", likes: 37, replies: 5, isTopVoice: false, daysAgo: 10 },
];

function timeAgo(days: number) {
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function Community() {
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState<Domain>("All");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 360);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return POSTS.filter((p) => {
      if (domain !== "All" && p.domain !== domain) return false;
      if (!term) return true;
      return p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term) || p.author.name.toLowerCase().includes(term);
    });
  }, [q, domain]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="mx-auto max-w-4xl border-b border-slate-100 px-4 pb-8 pt-8 text-center sm:px-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.5rem] md:leading-tight">
          Share your experiences.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
          Get insights from 8,427+ testers worldwide — structured feedback at your fingertips.
        </p>
      </header>

      <div className="mx-auto mt-8 max-w-4xl px-4 sm:px-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search experiences, products, domains…"
              className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-[#8b5cf6]/20"
            />
          </div>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value as Domain)}
            className="h-11 min-w-[10.5rem] cursor-pointer rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-[#8b5cf6]/20"
          >
            {DOMAINS.map((d) => <option key={d} value={d}>{d === "All" ? "All domains" : d}</option>)}
          </select>
        </div>

        <div className="mt-8 space-y-6 pb-16">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-500">No posts match your search.</div>
          )}
          {filtered.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_28px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_8px_36px_rgba(91,33,182,0.08)]"
            >
              <div className="relative p-6 pb-4">
                {post.isTopVoice && (
                  <div className="absolute right-5 top-5 rounded-md border border-orange-200/90 bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase leading-tight tracking-wide text-orange-900">
                    Top voice this week
                  </div>
                )}
                <div className="flex gap-3 pr-24">
                  <img
                    src={`https://i.pravatar.cc/88?img=${post.author.imgId}`}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11 shrink-0 rounded-full border border-slate-200 object-cover ring-2 ring-violet-100"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900">{post.author.name}</div>
                    <div className="text-sm text-slate-500">{post.peerLine} · {timeAgo(post.daysAgo)}</div>
                  </div>
                </div>
                <h2 className="mt-5 text-xl font-extrabold leading-snug tracking-tight text-slate-900 md:text-2xl">{post.title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{post.content}</p>
              </div>
              <div className="flex items-center gap-5 border-t border-slate-100 px-6 py-3 text-sm text-slate-500">
                <button className="flex items-center gap-1.5 transition hover:text-violet-700">
                  <Heart size={15} />
                  {post.likes}
                </button>
                <span>{post.replies} replies</span>
                <span className="ml-auto rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">{post.domain}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-[#7c3aed]"
        >
          ↑ Back to top
        </button>
      )}
    </div>
  );
}
