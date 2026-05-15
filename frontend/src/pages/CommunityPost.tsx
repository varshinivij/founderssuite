import { useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { Heart, ArrowLeft } from "lucide-react";

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

type Comment = { id: string; text: string; author: string };

export default function CommunityPost() {
  const { postId } = useParams<{ postId: string }>();
  const post = useMemo(() => POSTS.find((p) => p.id === postId), [postId]);

  const [replyText, setReplyText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  function handleReply() {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    setComments((prev) => [
      ...prev,
      { id: String(Date.now()), text: trimmed, author: "You" },
    ]);
    setReplyText("");
  }

  if (!post) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-600">
        Post not found.{" "}
        <Link to="/community" className="font-semibold text-violet-700 hover:underline">
          Back to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      {/* Back link */}
      <Link
        to={`/community/${post.domain}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 hover:text-violet-900 transition"
      >
        <ArrowLeft size={15} />
        Back to {post.domain}
      </Link>

      {/* Post body */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <img
            src={`https://i.pravatar.cc/88?img=${post.author.imgId}`}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full border border-slate-200 object-cover ring-2 ring-violet-100"
            loading="lazy"
          />
          <div className="text-sm font-semibold text-slate-900">{post.author.name}</div>
          <span className="text-sm text-slate-500">{post.peerLine} · {timeAgo(post.daysAgo)}</span>
          <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-800">
            {post.domain}
          </span>
          {post.isTopVoice && (
            <span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-900">
              Top voice this week
            </span>
          )}
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
          {post.title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{post.content}</p>

        <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <Heart size={15} className="text-rose-500" />
            {post.likes}
          </span>
          <span>{post.replies + comments.length} replies</span>
        </div>
      </div>

      {/* Comments */}
      {comments.length > 0 && (
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="font-semibold text-slate-900">Replies ({comments.length})</div>
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="size-8 shrink-0 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-800">
                {c.author.slice(0, 1)}
              </div>
              <div className="flex-1 rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-2.5 text-sm text-slate-700">
                {c.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply composer */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="font-semibold text-slate-900 mb-3">Add a reply</div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply()}
            placeholder="Write a reply…"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-[#8b5cf6]/20 transition"
          />
          <button
            onClick={handleReply}
            disabled={!replyText.trim()}
            className="shrink-0 rounded-full bg-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7c3aed] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}
