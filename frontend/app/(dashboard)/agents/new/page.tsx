"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Create agent
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          This creates a backend story and auto-creates an agent.
        </p>
      </div>

      <Card className="bg-white/80 border-black/10 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6 space-y-5">
        <div className="flex flex-wrap gap-2">
          {(["experience", "problem", "story"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full px-3 py-1 text-sm border ${
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
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>

        <div className="rounded-lg border border-black/10 bg-[#f9fafb] p-4 text-sm">
          <div className="font-semibold">x402 payment notice</div>
          <div className="mt-1 text-[#6b7280]">
            Agent creation is designed to require <span className="text-[#0a0a0f]">$1.00 USDC</span> on Base.
            For now we’re just exercising the backend endpoint.
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="border-black/10 text-[#0a0a0f] hover:bg-black/5"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            className="bg-purple hover:bg-purple-mid"
            disabled={!canSubmit || !user?.id || isSubmitting}
            onClick={async () => {
              if (!user?.id) return;
              setIsSubmitting(true);
              try {
                const resp = await addStory(user.id, {
                  type,
                  title,
                  description,
                  tags: tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                });
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
      </Card>
    </div>
  );
}

