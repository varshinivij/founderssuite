"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { mockCommunityPosts } from "@/lib/mock-data";
import { loadTesterCommunityExtraPosts } from "@/lib/tester-community-storage";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import type { CommunityPost } from "@/types";

function findPost(postId: string): CommunityPost | null {
  const extra = loadTesterCommunityExtraPosts();
  const fromExtra = extra.find((p) => p.id === postId);
  if (fromExtra) return fromExtra;
  return mockCommunityPosts.find((p) => p.id === postId) ?? null;
}

export default function TesterCommunityPostPage() {
  const params = useParams<{ postId: string }>();
  const postId = params?.postId ?? "";
  const [post, setPost] = useState<CommunityPost | null | undefined>(undefined);

  useEffect(() => {
    setPost(findPost(postId));
  }, [postId]);

  if (post === undefined) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center text-sm text-slate-500">Loading…</div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-12 text-center">
        <p className="text-slate-600">This post could not be found.</p>
        <Link href="/tester/community" className="font-semibold text-violet-700 hover:underline">
          Back to community feed
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      <Link href="/tester/community" className="text-sm font-medium text-violet-700 hover:underline">
        ← Back to feed
      </Link>
      <CommunityPostCard post={post} threadBase="/tester/community/post" />
    </div>
  );
}
