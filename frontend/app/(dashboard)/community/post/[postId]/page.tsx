"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { mockCommunityPosts } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ThreadViewPage() {
  const params = useParams<{ postId: string }>();
  const postId = params?.postId ?? "";

  const post = useMemo(() => mockCommunityPosts.find((p) => p.id === postId), [postId]);

  if (!post) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-600">
        Post not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-semibold text-slate-900">{post.author.name}</div>
          <Badge className="border border-violet-200 bg-violet-50 text-violet-900">{post.domain}</Badge>
          {post.isTopVoice ? (
            <Badge className="border border-orange-200 bg-orange-50 text-orange-900">Top voice this week</Badge>
          ) : null}
        </div>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{post.title}</div>
        <div className="mt-3 text-sm leading-relaxed text-slate-600">{post.content}</div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="font-semibold text-slate-900">Replies</div>
        <div className="mt-2 text-sm text-slate-600">
          Thread replies are mocked later. Composer below is placeholder.
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Write a reply…"
            className="border-slate-200 bg-white"
          />
          <Button className="shrink-0 bg-[#8b5cf6] font-semibold text-white hover:bg-[#7c3aed]">Reply</Button>
        </div>
      </div>
    </div>
  );
}
