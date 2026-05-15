import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { supabase } from "../lib/supabase";

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
  story_id: string | null;
  created_at: string;
};

type Story = {
  id: string;
  type: string;
  title: string;
  description: string;
  tags: string[];
};

export default function AgentDetail() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!agentId) return;
    supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .single()
      .then(async ({ data: agentData }) => {
        if (!agentData) { setIsLoading(false); return; }
        setAgent(agentData as Agent);
        if (agentData.story_id) {
          const { data: storyData } = await supabase
            .from("stories")
            .select("*")
            .eq("id", agentData.story_id)
            .single();
          setStory(storyData as Story ?? null);
        }
        setIsLoading(false);
      });
  }, [agentId]);

  async function toggleStatus() {
    if (!agent) return;
    const next = agent.status === "active" ? "paused" : "active";
    const { data } = await supabase
      .from("agents")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", agent.id)
      .select()
      .single();
    if (data) setAgent(data as Agent);
  }

  async function handleDelete() {
    if (!agent || !confirm(`Delete "${agent.name}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    await supabase.from("agents").delete().eq("id", agent.id);
    navigate("/agents");
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-black/5" />
        ))}
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="bg-[#f9fafb] border border-black/10 rounded-2xl p-8 text-center">
        <div className="text-sm text-[#6b7280]">Agent not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{agent.name}</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Status:{" "}
            <span className="capitalize text-[#0a0a0f] font-medium">{agent.status}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleStatus}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-[#0a0a0f] hover:bg-black/5 transition"
          >
            {agent.status === "active" ? "Pause" : "Resume"}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {/* RL Policy */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="font-semibold">RL policy</div>
          <span className="rounded-full bg-[#f3f4f6] border border-black/10 px-2 py-0.5 text-xs font-medium text-[#6b7280]">
            {agent.trained ? "trained" : "untrained"}
          </span>
        </div>
        <div className="text-sm text-[#6b7280] flex flex-wrap gap-x-3 gap-y-1">
          <span>Steps: {agent.policy_steps}</span>
          <span>•</span>
          <span>Epsilon: {agent.epsilon.toFixed(2)}</span>
          <span>•</span>
          <span>Forms filled: {agent.filled_forms}</span>
          <span>•</span>
          <span>Success rate: {Math.round(agent.success_rate * 100)}%</span>
        </div>
      </div>

      {/* Story */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 space-y-2">
        <div className="font-semibold">Story</div>
        {story ? (
          <div className="text-sm text-[#6b7280]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#0a0a0f] font-semibold">{story.title}</span>
              <span className="rounded-full bg-[#f3f4f6] border border-black/10 px-2 py-0.5 text-xs capitalize text-[#6b7280]">
                {story.type}
              </span>
            </div>
            <div>{story.description}</div>
            {story.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {story.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#ede9fe] border border-[#8b5cf6]/20 px-2 py-0.5 text-xs text-[#6b21a8]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-[#6b7280]">No story linked.</div>
        )}
      </div>

      {/* Match criteria */}
      {agent.match_criteria && (
        <div className="bg-white border border-black/10 rounded-2xl p-6 space-y-2">
          <div className="font-semibold">Match criteria</div>
          <div className="text-sm text-[#6b7280]">{agent.match_criteria}</div>
        </div>
      )}
    </div>
  );
}
