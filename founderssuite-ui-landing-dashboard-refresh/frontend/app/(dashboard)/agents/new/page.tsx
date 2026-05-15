"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addStory } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { StoryType } from "@/types";

export default function NewAgentPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [type, setType] = useState<StoryType>("experience");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("sales, b2b, saas");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => title.length > 0 && description.length >= 10,
    [title, description]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0a0a0f]">
          Create agent
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          This creates a story and auto-creates a matching agent.
        </p>
      </div>

      <div className="bg-white border border-black/10 rounded-2xl p-6 space-y-5 shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
        <div>
          <Label className="text-[#6b7280] text-[11px] uppercase tracking-widest font-semibold">Story type</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["experience", "problem", "story"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${
                  type === t
                    ? "bg-[#3d1454] text-white border-[#3d1454]"
                    : "bg-white border-black/10 hover:bg-black/5 text-[#0a0a0f]"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-[#0a0a0f] font-semibold">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 5 years in B2B SaaS sales"
            className="border-black/10 bg-white text-[#0a0a0f] placeholder:text-[#6b7280]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc" className="text-[#0a0a0f] font-semibold">Description</Label>
          <Input
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your lived experience in detail…"
            className="border-black/10 bg-white text-[#0a0a0f] placeholder:text-[#6b7280]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags" className="text-[#0a0a0f] font-semibold">Tags <span className="text-[#6b7280] font-normal">(comma separated)</span></Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="sales, b2b, saas"
            className="border-black/10 bg-white text-[#0a0a0f] placeholder:text-[#6b7280]"
          />
        </div>

        <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-4 text-sm">
          <div className="font-semibold text-[#0a0a0f]">x402 payment notice</div>
          <div className="mt-1 text-[#6b7280]">
            Agent creation is designed to require{" "}
            <span className="text-[#3d1454] font-semibold">$1.00 USDC</span> on Base.
            In development mode this is bypassed automatically.
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            className="border-black/10 text-[#0a0a0f] hover:bg-black/5"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
            disabled={!canSubmit || !user?.id || isSubmitting}
            onClick={async () => {
              if (!user?.id) return;
              setIsSubmitting(true);
              try {
                const scope = user.role === "founder" ? "self" : "public";
                const resp = await addStory(user.id, {
                  type,
                  title,
                  description,
                  tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                }, scope);
                toast.success("Agent created", { description: resp.agent.name });
                router.replace("/agents");
              } catch (e: unknown) {
                toast.error("Failed to create agent", {
                  description: e instanceof Error ? e.message : "Unknown error",
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? "Creating…" : "Create agent"}
          </Button>
        </div>
      </div>
    </div>
  );
}
