"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockCommunityPosts } from "@/lib/mock-data";
import { loadTesterCommunityExtraPosts } from "@/lib/tester-community-storage";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import type { CommunityPost } from "@/types";

function mergeFeed(): CommunityPost[] {
  const extra = loadTesterCommunityExtraPosts();
  const extraIds = new Set(extra.map((p) => p.id));
  const base = mockCommunityPosts.filter((p) => !extraIds.has(p.id));
  return [...extra, ...base];
}

export default function TesterCommunityDomainPage() {
  const params = useParams<{ domain: string }>();
  const domain = params?.domain ?? "";
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    const all = mergeFeed();
    setPosts(all.filter((p) => p.domain.toLowerCase() === String(domain).toLowerCase()));
  }, [domain]);

  return (
    <div className="bg-white text-slate-900">
      <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200/80 bg-white px-6 py-10 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-700">Community</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{domain}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Posts tagged in this domain.{" "}
          <Link href="/tester/community" className="font-semibold text-violet-700 hover:underline">
            View all domains
          </Link>
        </p>
      </section>

      <div className="mx-auto mt-8 max-w-4xl space-y-6 px-1 pb-10 sm:px-0">
        {posts.map((p) => (
          <CommunityPostCard key={p.id} post={p} threadBase="/tester/community/post" />
        ))}

        {!posts.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-600">
            No posts in this domain yet.{" "}
            <Link href="/tester/community" className="font-semibold text-violet-700 hover:underline">
              Share one
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
