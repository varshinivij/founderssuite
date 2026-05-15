import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";

type StoryType = "experience" | "problem" | "story";

export default function AgentNew() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [type, setType] = useState<StoryType>("experience");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("sales, b2b, saas");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(
    () => title.length > 0 && description.length >= 10,
    [title, description]
  );

  async function handleCreate() {
    if (!canSubmit || !user) return;
    setIsSubmitting(true);
    setError("");
    try {
      // 1. Create story
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const { data: story, error: storyErr } = await supabase
        .from("stories")
        .insert({ user_id: user.id, type, title, description, tags: tagList })
        .select()
        .single();
      if (storyErr) throw new Error(storyErr.message);

      // 2. Derive agent name and domain from tags
      const domain = tagList[0] ?? type;
      const agentName = `${title} Agent`;

      // 3. Create agent linked to story
      const { error: agentErr } = await supabase.from("agents").insert({
        user_id: user.id,
        story_id: story.id,
        name: agentName,
        domain,
        status: "idle",
        match_criteria: description,
        filled_forms: 0,
        success_rate: 0,
        epsilon: 0.5,
        policy_steps: 0,
        trained: false,
      });
      if (agentErr) throw new Error(agentErr.message);

      navigate("/agents");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create agent");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Create agent</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          This creates a backend story and auto-creates an agent.
        </p>
      </div>

      <div className="bg-white/80 border border-black/10 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.08)] rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap gap-2">
          {(["experience", "problem", "story"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full px-3 py-1 text-sm border transition ${
                type === t
                  ? "bg-[#8b5cf6]/15 border-[#8b5cf6]/30 text-[#0a0a0f]"
                  : "bg-white border-black/10 hover:bg-black/5 text-[#0a0a0f]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-[#0a0a0f]">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#8b5cf6]/60 focus:ring-2 focus:ring-[#8b5cf6]/20 transition"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="desc" className="block text-sm font-medium text-[#0a0a0f]">Description</label>
          <textarea
            id="desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#8b5cf6]/60 focus:ring-2 focus:ring-[#8b5cf6]/20 transition resize-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="tags" className="block text-sm font-medium text-[#0a0a0f]">Tags</label>
          <input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="sales, b2b, saas"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#8b5cf6]/60 focus:ring-2 focus:ring-[#8b5cf6]/20 transition"
          />
        </div>

        <div className="rounded-lg border border-black/10 bg-[#f9fafb] p-4 text-sm">
          <div className="font-semibold">x402 payment notice</div>
          <div className="mt-1 text-[#6b7280]">
            Agent creation is designed to require{" "}
            <span className="text-[#0a0a0f]">$1.00 USDC</span> on Base.
            For now we're just exercising the backend endpoint.
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-[#0a0a0f] hover:bg-black/5 transition"
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit || isSubmitting}
            onClick={handleCreate}
            className="rounded-full bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7c3aed] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating…" : "Create agent"}
          </button>
        </div>
      </div>
    </div>
  );
}
