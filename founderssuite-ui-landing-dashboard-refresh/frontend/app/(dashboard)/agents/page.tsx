"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAgents } from "@/hooks/useAgents";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { updateAgentStatus } from "@/lib/api";
import { toast } from "sonner";
import type { Agent } from "@/types";

export default function AgentsPage() {
  const { data, error, isLoading, mutate } = useAgents();
  const [toggling, setToggling] = useState<string | null>(null);

  if (error) toast.error("Failed to load agents", { description: error });

  const agents = data ?? [];
  const total = agents.length;
  const active = agents.filter((a) => a.status === "active").length;
  const filled = agents.reduce((sum, a) => sum + a.filledForms, 0);
  const success = agents.reduce((sum, a) => sum + a.successRate, 0) / Math.max(total, 1);

  async function handleToggle(agent: Agent) {
    setToggling(agent.id);
    try {
      const action = agent.status === "active" ? "pause" : "activate";
      await updateAgentStatus(agent.id, action);
      toast.success(action === "pause" ? "Agent paused" : "Agent activated");
      mutate?.();
    } catch {
      toast.error("Failed to update agent status");
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Your AI Agents
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Manage agents derived from your stories.
          </p>
        </div>
        <Link
          href="/agents/new"
          className={cn(buttonVariants({ variant: "default" }), "bg-purple hover:bg-purple-mid")}
        >
          Create New Agent
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: total },
          { label: "Active", value: active },
          { label: "Forms Filled", value: filled },
          { label: "Success Rate", value: `${Math.round(success * 100)}%` },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-black/10 rounded-2xl p-5 shadow-[0_12px_32px_rgba(0,0,0,0.06)]"
          >
            <div className="text-2xl font-extrabold">{s.value}</div>
            <div className="text-sm text-[#6b7280]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : agents.map((a) => (
          <div
            key={a.id}
            className="bg-white border border-black/10 rounded-2xl p-5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.10)] transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-extrabold truncate">{a.name}</div>
                <div className="text-sm text-[#6b7280] line-clamp-2 mt-1">
                  {a.matchCriteria}
                </div>
              </div>
              <Badge
                className={cn(
                  "border capitalize shrink-0",
                  a.status === "active"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : a.status === "paused"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                    : "bg-[#f3f4f6] border-black/10 text-[#6b7280]"
                )}
              >
                {a.status}
              </Badge>
            </div>

            <div className="mt-4 text-sm text-[#6b7280] flex flex-wrap gap-x-3 gap-y-1">
              <span>Filled: {a.filledForms}</span>
              <span>•</span>
              <span>Success: {Math.round(a.successRate * 100)}%</span>
              <span>•</span>
              <span
                className={`text-sm font-mono ${
                  a.policy.epsilon > 0.7
                    ? "text-yellow-600"
                    : a.policy.epsilon > 0.4
                      ? "text-orange-600"
                      : "text-green-700"
                }`}
              >
                ε: {a.policy.epsilon.toFixed(2)}
              </span>
            </div>

            <div className="mt-5 flex gap-2">
              <Link
                href={`/agents/${a.id}`}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "bg-purple hover:bg-purple-mid flex-1"
                )}
              >
                View details
              </Link>
              {a.status !== "stopped" && (
                <Button
                  variant="outline"
                  className="border-black/10 text-[#0a0a0f] hover:bg-black/5"
                  disabled={toggling === a.id}
                  onClick={() => handleToggle(a)}
                >
                  {toggling === a.id
                    ? "…"
                    : a.status === "active"
                    ? "Pause"
                    : "Resume"}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isLoading && agents.length === 0 && (
        <div className="text-center py-16 text-[#6b7280]">
          <div className="text-4xl mb-4">🤖</div>
          <div className="font-semibold text-lg">No agents yet</div>
          <p className="text-sm mt-1">Create your first agent by adding a story about your experience.</p>
          <Link href="/agents/new" className={cn(buttonVariants(), "mt-4 bg-purple hover:bg-purple-mid")}>
            Create agent
          </Link>
        </div>
      )}
    </div>
  );
}
