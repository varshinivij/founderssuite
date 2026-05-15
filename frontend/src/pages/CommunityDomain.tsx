import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { Heart } from "lucide-react";

// ---------------------------------------------------------------------------
// Shared post type and data (mirrors Community.tsx)
// ---------------------------------------------------------------------------
type Domain = "MedTech" | "SaaS" | "EdTech" | "FinTech" | "VehicleTech" | "Other";

type Post = {
  id: string;
  domain: Domain;
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
  { id: "1", domain: "MedTech", title: "How EHR integrations really fail in the field", content: "The handoff between HL7 feeds and custom workflows is where most implementations break. Teams underestimate the variance in how different EHRs expose the same concept.", author: { name: "Maya R.", initials: "MR", imgId: 27 }, peerLine: "Peer @ AudioNova", likes: 94, replies: 6, isTopVoice: true, daysAgo: 1 },
  { id: "2", domain: "SaaS", title: "RevOps metrics founders get wrong on their first call", content: "Founders pitch MoM ARR growth but ops teams ask about net retention and expansion. Align your language to the buyer's reporting cycle before the first discovery call.", author: { name: "Devon K.", initials: "DK", imgId: 12 }, peerLine: "Peer @ BrightApps", likes: 71, replies: 4, isTopVoice: false, daysAgo: 2 },
  { id: "3", domain: "EdTech", title: "What a district-wide LMS rollout actually looks like", content: "District IT is a political layer, not a technical one. Your champion is the curriculum director, not the CTO. Procurement goes through a committee that meets twice a year.", author: { name: "Aisha T.", initials: "AT", imgId: 32 }, peerLine: "Peer @ District 47", likes: 58, replies: 9, isTopVoice: true, daysAgo: 3 },
  { id: "4", domain: "FinTech", title: "Fraud signal edge cases no one documents", content: "Transaction velocity spikes aren't fraud by default. Time-of-day normalization and merchant category codes together catch 70% of cases before ML models are needed.", author: { name: "Kenji S.", initials: "KS", imgId: 45 }, peerLine: "Peer @ PayScale", likes: 112, replies: 14, isTopVoice: false, daysAgo: 4 },
  { id: "5", domain: "VehicleTech", title: "Fleet telematics: what works at 500 units doesn't at 5,000", content: "Firmware rollouts across vehicle classes require staging environments that mirror production hardware—something most SaaS vendors discover too late.", author: { name: "Sofia L.", initials: "SL", imgId: 16 }, peerLine: "Peer @ FleetCo", likes: 44, replies: 3, isTopVoice: false, daysAgo: 5 },
  { id: "6", domain: "MedTech", title: "Why clinical ops leads reject SaaS tools in week one", content: "After the first 30 days, the support burden is the product. If onboarding requires an implementation manager, it isn't a SaaS product—it's a service.", author: { name: "Maya R.", initials: "MR", imgId: 27 }, peerLine: "Peer @ AudioNova", likes: 88, replies: 7, isTopVoice: true, daysAgo: 6 },
  { id: "7", domain: "SaaS", title: "The CPQ trap: how pricing complexity kills sales velocity", content: "CPQ products add value when reps have discretion. If your pricing is catalog-based and non-negotiable, you're adding friction, not control.", author: { name: "Devon K.", initials: "DK", imgId: 12 }, peerLine: "Peer @ BrightApps", likes: 55, replies: 2, isTopVoice: false, daysAgo: 8 },
  { id: "8", domain: "EdTech", title: "Procurement in public schools — what the vendor never learns", content: "Curriculum alignment is the hidden procurement requirement. If your tool doesn't map to state standards documentation, it won't survive the committee stage.", author: { name: "Aisha T.", initials: "AT", imgId: 32 }, peerLine: "Peer @ District 47", likes: 37, replies: 5, isTopVoice: false, daysAgo: 10 },
];

function timeAgo(days: number) {
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function CommunityDomain() {
  const { domain } = useParams<{ domain: string }>();
  const domainLabel = domain ?? "All";

  const posts = useMemo(
    () =>
      POSTS.filter(
        (p) => p.domain.toLowerCase() === domainLabel.toLowerCase()
      ),
    [domainLabel]
  );

  return (
    <div className="bg-white text-slate-900">
      <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200/80 bg-white px-6 py-10 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-700">
          Community
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          {domainLabel}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Posts tagged in this domain (mock).{" "}
          <Link
            to="/community"
            className="font-semibold text-violet-700 hover:underline"
          >
            View all domains
          </Link>
        </p>
      </section>

      <div className="mx-auto mt-8 max-w-4xl space-y-6 px-1 pb-10 sm:px-0">
        {posts.map((post) => (
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
                  <div className="text-sm text-slate-500">
                    {post.peerLine} · {timeAgo(post.daysAgo)}
                  </div>
                </div>
              </div>
              <h2 className="mt-5 text-xl font-extrabold leading-snug tracking-tight text-slate-900 md:text-2xl">
                {post.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                {post.content}
              </p>
            </div>
            <div className="flex items-center gap-5 border-t border-slate-100 px-6 py-3 text-sm text-slate-500">
              <button className="flex items-center gap-1.5 transition hover:text-violet-700">
                <Heart size={15} />
                {post.likes}
              </button>
              <span>{post.replies} replies</span>
              <Link
                to={`/community/post/${post.id}`}
                className="ml-auto text-sm font-semibold text-violet-700 hover:underline underline-offset-2"
              >
                Open thread
              </Link>
              <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">
                {post.domain}
              </span>
            </div>
          </article>
        ))}

        {!posts.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-600">
            No posts in this domain yet.
          </div>
        )}
      </div>
    </div>
  );
}
