import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { CardSkeleton } from "../components/shared/LoadingSkeleton";

type Agent = {
  id: string;
  name: string;
  domain: string | null;
  status: "active" | "idle" | "paused";
  match_criteria: string | null;
  filled_forms: number;
  success_rate: number;
  epsilon: number;
  policy_steps: number;
  trained: boolean;
  created_at: string;
};

export default function Agents() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("agents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setAgents((data as Agent[]) ?? []);
        setIsLoading(false);
      });
  }, [user]);

  async function toggleStatus(agent: Agent) {
    const next = agent.status === "active" ? "paused" : "active";
    const { data } = await supabase
      .from("agents")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", agent.id)
      .select()
      .single();
    if (data) setAgents((prev) => prev.map((a) => (a.id === agent.id ? (data as Agent) : a)));
  }

  const total = agents.length;
  const active = agents.filter((a) => a.status === "active").length;
  const filled = agents.reduce((sum, a) => sum + a.filled_forms, 0);
  const success = total > 0 ? agents.reduce((sum, a) => sum + a.success_rate, 0) / total : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Your AI Agents</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Manage agents derived from your stories.</p>
        </div>
        <Link
          to="/agents/new"
          className="rounded-full bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7c3aed] transition"
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
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          : agents.length === 0
            ? (
              <div className="col-span-3 rounded-2xl border border-black/10 bg-white p-10 text-center">
                <p className="text-sm text-[#6b7280]">No agents yet. Create your first one above.</p>
              </div>
            )
            : agents.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-black/10 rounded-2xl p-5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.10)] transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-extrabold truncate">{a.name}</div>
                    <div className="text-sm text-[#6b7280] line-clamp-2 mt-1">
                      {a.match_criteria ?? a.domain ?? "—"}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#f3f4f6] border border-black/10 capitalize text-[#6b7280] px-2 py-0.5 text-xs font-medium">
                    {a.status}
                  </span>
                </div>

                <div className="mt-4 text-sm text-[#6b7280] flex flex-wrap gap-x-3 gap-y-1">
                  <span>Filled: {a.filled_forms}</span>
                  <span>•</span>
                  <span>Success: {Math.round(a.success_rate * 100)}%</span>
                  <span>•</span>
                  <span
                    className={`text-sm font-mono ${
                      a.epsilon > 0.7
                        ? "text-yellow-600"
                        : a.epsilon > 0.4
                          ? "text-orange-600"
                          : "text-green-700"
                    }`}
                  >
                    ε: {a.epsilon.toFixed(2)}
                  </span>
                </div>

                <div className="mt-5 flex gap-2">
                  <Link
                    to={`/agents/${a.id}`}
                    className="flex-1 text-center rounded-full bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7c3aed] transition"
                  >
                    View details
                  </Link>
                  <button
                    onClick={() => toggleStatus(a)}
                    className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-[#0a0a0f] hover:bg-black/5 transition"
                  >
                    {a.status === "active" ? "Pause" : "Resume"}
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
