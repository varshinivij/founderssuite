"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAgents, getStories, getAgentMatches, updateAgentStatus } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "sonner";
import type { Agent, UserStory, Match } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
  stopped: "bg-red-100 text-red-800 border-red-200",
};

const MATCH_STATUS_COLORS: Record<string, string> = {
  submitted: "bg-[#ede9fe] text-[#3d1454] border-[#8b5cf6]/20",
  accepted: "bg-green-50 text-green-800 border-green-200",
  rejected: "bg-red-50 text-red-800 border-red-200",
  pending: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function AgentDetailPage() {
  const params = useParams<{ agentId: string }>();
  const { user } = useAuth();
  const agentId = params?.agentId ?? "";

  const [agent, setAgent] = useState<Agent | null>(null);
  const [story, setStory] = useState<UserStory | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!agentId) return;
    const userId = user?.id ?? "demo";

    Promise.all([getAgents(userId), getAgentMatches(agentId)])
      .then(([agents, agentMatches]) => {
        const found = agents.find((a) => a.id === agentId) ?? null;
        setAgent(found);
        setMatches(agentMatches);
        if (found?.storyId) {
          return getStories(userId).then((stories) => {
            setStory(stories.find((s) => s.id === found.storyId) ?? null);
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [agentId, user?.id]);

  async function handleAction(action: "activate" | "pause" | "stop") {
    if (!agent) return;
    try {
      const updated = await updateAgentStatus(agent.id, action);
      setAgent(updated);
      toast.success(`Agent ${action === "activate" ? "resumed" : action + "d"}`);
    } catch {
      toast.error(`Failed to ${action} agent`);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="rounded-3xl bg-white border border-black/10 p-10 text-center text-[#6b7280]">
        Agent not found.
      </div>
    );
  }

  const epsilonColor =
    agent.policy.epsilon > 0.7
      ? "text-yellow-600"
      : agent.policy.epsilon > 0.4
        ? "text-orange-600"
        : "text-green-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0a0a0f]">
            {agent.name}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[agent.status] ?? "bg-slate-100 text-slate-700"}`}
            >
              {agent.status}
            </span>
            <span className="text-sm text-[#6b7280]">
              Last active {new Date(agent.lastActiveAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {agent.status === "active" && (
            <Button variant="outline" className="border-black/10 text-[#0a0a0f] hover:bg-black/5" onClick={() => handleAction("pause")}>
              Pause
            </Button>
          )}
          {agent.status === "paused" && (
            <Button variant="outline" className="border-black/10 text-[#0a0a0f] hover:bg-black/5" onClick={() => handleAction("activate")}>
              Resume
            </Button>
          )}
          {agent.status !== "stopped" && (
            <Button variant="outline" className="border-black/10 text-[#0a0a0f] hover:bg-red-50 hover:border-red-200 hover:text-red-600" onClick={() => handleAction("stop")}>
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* RL Policy */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-extrabold text-[#0a0a0f]">RL Policy</div>
          <Badge className={`text-xs font-semibold border ${agent.policy.trained ? "bg-green-50 text-green-800 border-green-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
            {agent.policy.trained ? "Trained" : "Untrained"}
          </Badge>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {[
            { label: "Training steps", value: agent.policy.steps.toString() },
            { label: "Epsilon (exploration)", value: <span className={epsilonColor}>{agent.policy.epsilon.toFixed(2)}</span> },
            { label: "Forms filled", value: agent.filledForms.toString() },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-black/10 bg-[#fafafa] p-4">
              <div className="text-lg font-extrabold text-[#0a0a0f]">{s.value}</div>
              <div className="text-xs text-[#6b7280] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="text-xs text-[#6b7280] mb-1 font-semibold">Success rate</div>
          <div className="h-2 rounded-full bg-black/10 overflow-hidden">
            <div
              className="h-2 rounded-full bg-[linear-gradient(90deg,#a78bfa,#8b5cf6)]"
              style={{ width: `${Math.round(agent.successRate * 100)}%` }}
            />
          </div>
          <div className="text-xs text-[#6b7280] mt-1">{Math.round(agent.successRate * 100)}%</div>
        </div>
      </div>

      {/* Story */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="text-sm font-extrabold text-[#0a0a0f]">Story</div>
        {story ? (
          <>
            <div className="mt-3 font-semibold text-[#0a0a0f]">{story.title}</div>
            <div className="mt-1 text-sm text-[#6b7280] leading-relaxed">{story.description}</div>
            {story.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {story.tags.map((t) => (
                  <span key={t} className="rounded-full border border-black/10 bg-[#fafafa] px-3 py-0.5 text-xs text-[#6b7280]">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="mt-3 text-sm text-[#6b7280]">Story not found.</div>
        )}
      </div>

      {/* Match history */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="text-sm font-extrabold text-[#0a0a0f]">Match history ({matches.length})</div>
        <div className="mt-4 space-y-2">
          {matches.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-black/10 bg-[#fafafa] px-4 py-3 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate text-[#0a0a0f]">
                  {m.form?.title ?? m.formId}
                </div>
                <div className="text-xs text-[#6b7280] mt-0.5">
                  Score: {Math.round(m.score * 100)}%
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={`text-xs border ${MATCH_STATUS_COLORS[m.status] ?? "bg-slate-100 text-slate-700"}`}>
                  {m.status}
                </Badge>
                <span className="text-xs text-[#6b7280]">
                  {m.submittedAt ? m.submittedAt.slice(0, 10) : "—"}
                </span>
              </div>
            </div>
          ))}
          {!matches.length && (
            <div className="text-sm text-[#6b7280] py-4 text-center">
              No matches yet. This agent will automatically match when a relevant form is posted.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
