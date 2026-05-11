"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { mockAgents, mockMatches, mockStories } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AgentDetailPage() {
  const params = useParams<{ agentId: string }>();
  const agentId = params?.agentId ?? "";

  const agent = useMemo(() => mockAgents.find((a) => a.id === agentId), [agentId]);
  const story = useMemo(
    () => (agent ? mockStories.find((s) => s.id === agent.storyId) : undefined),
    [agent]
  );
  const matches = useMemo(
    () => mockMatches.filter((m) => m.agentId === agentId),
    [agentId]
  );

  if (!agent) {
    return (
      <Card className="bg-bg-accent border-divider shadow-card p-8 text-center">
        <div className="text-sm text-neutral-text-gray">Agent not found.</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {agent.name}
          </h1>
          <p className="mt-1 text-sm text-neutral-text-gray">
            Status: <span className="capitalize text-white">{agent.status}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border text-white hover:bg-purple-deep/40">
            Pause/Resume
          </Button>
          <Button variant="outline" className="border-border text-white hover:bg-red-500/15 hover:border-red-500/40">
            Stop/Delete
          </Button>
        </div>
      </div>

      <Card className="bg-bg-accent border-divider shadow-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="font-semibold">RL policy</div>
          <Badge className="bg-bg-card/40 border border-divider">
            {agent.policy.trained ? "trained" : "untrained"}
          </Badge>
        </div>
        <div className="text-sm text-neutral-text-gray flex flex-wrap gap-x-3 gap-y-1">
          <span>Steps: {agent.policy.steps}</span>
          <span>•</span>
          <span>Epsilon: {agent.policy.epsilon.toFixed(2)}</span>
        </div>
      </Card>

      <Card className="bg-bg-accent border-divider shadow-card p-6 space-y-2">
        <div className="font-semibold">Story</div>
        <div className="text-sm text-neutral-text-gray">
          {story ? (
            <>
              <div className="text-white font-semibold">{story.title}</div>
              <div className="mt-1">{story.description}</div>
            </>
          ) : (
            "Story not found."
          )}
        </div>
      </Card>

      <Card className="bg-bg-accent border-divider shadow-card p-6">
        <div className="font-semibold">Match history</div>
        <div className="mt-3 space-y-2">
          {matches.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border border-divider bg-bg-card/30 px-4 py-3 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">
                  {m.form?.title ?? m.formId}
                </div>
                <div className="text-xs text-neutral-text-gray">
                  Score: {Math.round(m.score * 100)}% • Status:{" "}
                  <span className="capitalize">{m.status}</span>
                </div>
              </div>
              <Badge className="bg-purple-deep/60 border border-divider text-neutral-text-gray">
                {m.submittedAt ? m.submittedAt.slice(0, 10) : "—"}
              </Badge>
            </div>
          ))}
          {!matches.length ? (
            <div className="text-sm text-neutral-text-gray">No matches yet.</div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

