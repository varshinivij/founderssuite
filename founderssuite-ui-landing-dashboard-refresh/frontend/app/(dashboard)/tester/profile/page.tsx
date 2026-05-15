"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Briefcase, Pencil, Star, Users } from "lucide-react";
import { getStories, getAgents } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { UserStory, Agent } from "@/types";

export default function TesterProfilePage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<UserStory[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([getStories(user.id), getAgents(user.id)])
      .then(([s, a]) => { setStories(s); setAgents(a); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const initials = (user?.name ?? "T")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Derive stats from real agent data
  const totalFilled = agents.reduce((sum, a) => sum + (a.filledForms ?? 0), 0);
  const avgSuccess = agents.length
    ? agents.reduce((sum, a) => sum + (a.successRate ?? 0), 0) / agents.length
    : 0;
  const qualityScore = Math.round(avgSuccess * 5 * 10) / 10 || 0;

  // Derive tags from all stories
  const allTags = [...new Set(stories.flatMap((s) => s.tags))].slice(0, 8);

  // Domain from first story tag
  const domain = stories[0]?.tags?.[0] ?? "General";

  const stats = [
    { icon: <Users className="text-[#8b5cf6]" size={18} />, value: String(totalFilled || 0), label: "Forms Filled" },
    { icon: <Star className="text-[#8b5cf6]" size={18} />, value: qualityScore > 0 ? qualityScore.toFixed(1) : "—", label: "Quality Score" },
    { icon: <Briefcase className="text-[#8b5cf6]" size={18} />, value: String(stories.length), label: "Experiences" },
    { icon: <BadgeCheck className="text-[#8b5cf6]" size={18} />, value: String(agents.length), label: "Active Agents" },
  ];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center text-sm text-slate-500">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header band */}
      <div className="relative overflow-hidden rounded-3xl border border-[#dcd4ef] bg-[#f3f0f7] shadow-sm ring-1 ring-[#e8dff6]/80">
        <div className="h-28 bg-[linear-gradient(180deg,rgba(252,231,131,0.55)_0%,rgba(232,223,246,0.95)_45%,rgba(255,255,255,0)_100%)]" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 rounded-full bg-[#3d1454] text-white flex items-center justify-center text-xl font-extrabold ring-4 ring-white">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {user?.name ?? "Tester"}
                  </h1>
                  {agents.length > 0 && <BadgeCheck className="text-[#8b5cf6]" size={18} />}
                </div>
                <div className="mt-1 text-sm text-slate-600">{user?.email}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs border border-slate-200 bg-slate-100 capitalize">
                    {domain}
                  </span>
                  {agents.some((a) => a.type === "ai") && (
                    <span className="px-3 py-1 rounded-full text-xs border border-[#c4b5fd] bg-[#f7f4fc] text-[#4c1d95]">
                      AI Agent Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium hover:bg-black/5 transition w-fit">
              <Pencil size={16} />
              Edit profile
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900">
                  {s.icon}
                  <div className="text-lg font-extrabold">{s.value}</div>
                </div>
                <div className="mt-1 text-xs text-slate-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* About — from story descriptions */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold text-slate-900">About Me</div>
          {stories.length === 0 ? (
            <div className="mt-3 text-sm text-slate-400 italic">
              No experiences added yet. Go to AI Agents to add your first story.
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-600 leading-relaxed">
              {stories[0].description}
            </div>
          )}
        </div>

        {/* Active agents */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold text-slate-900">My Agents</div>
          {agents.length === 0 ? (
            <div className="mt-3 text-sm text-slate-400 italic">No agents yet.</div>
          ) : (
            <div className="mt-3 space-y-3">
              {agents.map((a) => (
                <div key={a.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">{a.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {a.filledForms} forms filled · {Math.round((a.successRate ?? 0) * 100)}% success
                    </div>
                  </div>
                  <span className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                    a.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  )}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Experience — all stories */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="text-sm font-extrabold text-slate-900">Experiences & Stories</div>
        {stories.length === 0 ? (
          <div className="mt-3 text-sm text-slate-400 italic">No experiences added yet.</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {stories.map((s) => (
              <div key={s.id} className="rounded-2xl border border-slate-200 bg-[#fafafa] p-4">
                <div className="font-semibold text-slate-900 text-sm">{s.title}</div>
                <div className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-3">{s.description}</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.tags.slice(0, 5).map((t) => (
                    <span key={t} className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] text-slate-600 capitalize">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {allTags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {allTags.map((t) => (
              <span key={t} className={cn("px-3 py-1 rounded-full text-xs border border-[#c4b5fd] bg-[#f7f4fc] text-[#4c1d95]")}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
