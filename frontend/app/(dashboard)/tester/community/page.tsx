"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Plus, Search } from "lucide-react";
import { mockCommunityPosts } from "@/lib/mock-data";
import { loadTesterCommunityExtraPosts, prependTesterCommunityExtraPost } from "@/lib/tester-community-storage";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import type { CommunityPost, Domain } from "@/types";

const DOMAINS: (Domain | "All")[] = [
  "All",
  "MedTech",
  "SaaS",
  "EdTech",
  "FinTech",
  "VehicleTech",
  "Other",
];

function mergeFeed(): CommunityPost[] {
  const extra = loadTesterCommunityExtraPosts();
  const extraIds = new Set(extra.map((p) => p.id));
  const base = mockCommunityPosts.filter((p) => !extraIds.has(p.id));
  return [...extra, ...base].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export default function TesterCommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts);
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState<(typeof DOMAINS)[number]>("All");
  const [showTop, setShowTop] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postDomain, setPostDomain] = useState<Domain>("SaaS");
  const [composeError, setComposeError] = useState("");

  useEffect(() => {
    setPosts(mergeFeed());
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 360);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (domain !== "All" && p.domain !== domain) return false;
      if (!term) return true;
      return (
        p.title.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term) ||
        p.domain.toLowerCase().includes(term) ||
        p.author.name.toLowerCase().includes(term)
      );
    });
  }, [q, domain, posts]);

  const resetCompose = useCallback(() => {
    setTitle("");
    setBody("");
    setPostDomain("SaaS");
    setComposeError("");
  }, []);

  const handlePublish = () => {
    if (!user) {
      setComposeError("You need to be signed in to post.");
      return;
    }
    const t = title.trim();
    const b = body.trim();
    if (t.length < 4) {
      setComposeError("Please add a clearer title (at least a few words).");
      return;
    }
    if (b.length < 12) {
      setComposeError("Share a bit more detail in the body so others get real signal.");
      return;
    }
    const post: CommunityPost = {
      id: `post_${Date.now()}`,
      userId: user.id,
      domain: postDomain,
      title: t,
      content: b,
      createdAt: new Date().toISOString(),
      author: {
        id: user.id,
        name: user.name ?? "You",
        role: "tester",
      },
      peerLine: `${user.name ?? "Tester"} · insight`,
      likes: 0,
      replies: 0,
      isTopVoice: false,
    };
    prependTesterCommunityExtraPost(post);
    setPosts(mergeFeed());
    setComposeOpen(false);
    resetCompose();
  };

  const domainLinks = DOMAINS.filter((d): d is Domain => d !== "All");

  return (
    <div className="bg-white text-slate-900">
      <header className="mx-auto max-w-4xl border-b border-slate-100 px-1 pb-8 pt-1 text-center sm:px-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.5rem] md:leading-tight">
          Share your experiences.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
          Add experiences and insights for founders browsing by domain. New posts appear on this feed right
          away and are saved in this browser for the demo.
        </p>
      </header>

      <div className="mx-auto mt-8 max-w-4xl px-1 sm:px-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search experiences, products, domains…"
              className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm shadow-sm outline-none ring-violet-500/0 transition focus:border-violet-300 focus:ring-2 focus:ring-[#8b5cf6]/20"
            />
          </div>
          <div className="flex shrink-0 gap-3 sm:w-auto">
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value as (typeof DOMAINS)[number])}
              className="h-11 min-w-[10.5rem] cursor-pointer rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-[#8b5cf6]/20"
              aria-label="Filter by domain"
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All domains" : d}
                </option>
              ))}
            </select>
            <Button
              type="button"
              className="h-11 shrink-0 rounded-full bg-[#8b5cf6] px-5 font-semibold text-white shadow-md shadow-violet-500/25 hover:bg-[#7c3aed]"
              onClick={() => {
                resetCompose();
                setComposeOpen(true);
              }}
            >
              <Plus className="mr-1.5 size-4" strokeWidth={2.5} aria-hidden />
              Share experience
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-4xl space-y-6 px-1 pb-8 sm:px-0">
        <p className="text-center text-xs text-slate-500">
          Browse by domain:{" "}
          {domainLinks.map((d, i) => (
            <span key={d}>
              {i > 0 ? " · " : null}
              <Link
                href={`/tester/community/${d}`}
                className="font-medium text-violet-700 underline-offset-2 hover:underline"
              >
                {d}
              </Link>
            </span>
          ))}
        </p>

        {filtered.map((p) => (
          <CommunityPostCard key={p.id} post={p} threadBase="/tester/community/post" />
        ))}

        {!filtered.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-14 text-center text-sm text-slate-600">
            No posts match your filters.
          </div>
        ) : null}

        <div className="flex justify-center pt-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
          >
            See more
            <ChevronDown className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {showTop ? (
        <button
          type="button"
          className="fixed bottom-8 right-6 z-40 flex size-11 items-center justify-center rounded-full bg-[#8b5cf6] text-white shadow-lg shadow-violet-600/35 transition hover:bg-[#7c3aed]"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          <ChevronUp className="size-5" strokeWidth={2.5} />
        </button>
      ) : null}

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border border-slate-200 bg-white text-slate-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">Share an experience or insight</DialogTitle>
            <DialogDescription>
              Write for other testers and founders. Posts are stored locally in this browser for the demo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tc-title">Title</Label>
              <Input
                id="tc-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. What broke in onboarding during my last MedTech beta"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tc-domain">Domain</Label>
              <select
                id="tc-domain"
                value={postDomain}
                onChange={(e) => setPostDomain(e.target.value as Domain)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-[#8b5cf6]/20"
              >
                {domainLinks.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tc-body">Experience &amp; insight</Label>
              <textarea
                id="tc-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder="What you tested, what surprised you, constraints you hit, and what you’d tell a founder."
                className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-[#8b5cf6]/20"
              />
            </div>
            {composeError ? <p className="text-sm text-red-600">{composeError}</p> : null}
          </div>
          <DialogFooter className="border-t-0 pt-0 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-[#8b5cf6] hover:bg-[#7c3aed]" onClick={handlePublish}>
              Publish to feed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
