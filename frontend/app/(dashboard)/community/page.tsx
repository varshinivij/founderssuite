"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Plus, Search } from "lucide-react";
import { mockCommunityPosts } from "@/lib/mock-data";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { Button } from "@/components/ui/button";
import type { Domain } from "@/types";

const DOMAINS: (Domain | "All")[] = [
  "All",
  "MedTech",
  "SaaS",
  "EdTech",
  "FinTech",
  "VehicleTech",
  "Other",
];

export default function CommunityPage() {
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState<(typeof DOMAINS)[number]>("All");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 360);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return mockCommunityPosts.filter((p) => {
      if (domain !== "All" && p.domain !== domain) return false;
      if (!term) return true;
      return (
        p.title.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term) ||
        p.domain.toLowerCase().includes(term) ||
        p.author.name.toLowerCase().includes(term)
      );
    });
  }, [q, domain]);

  return (
    <div className="bg-white text-slate-900">
      <header className="mx-auto max-w-4xl border-b border-slate-100 px-1 pb-8 pt-1 text-center sm:px-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.5rem] md:leading-tight">
          Share your experiences.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
          Get insights from 8,427+ testers worldwide — structured feedback at your fingertips.
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
            >
              <Plus className="mr-1.5 size-4" strokeWidth={2.5} aria-hidden />
              Share experience
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-4xl space-y-6 px-1 pb-8 sm:px-0">
        {filtered.map((p) => (
          <CommunityPostCard key={p.id} post={p} />
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

      <footer className="mt-12 border-t border-violet-950/20 bg-[#1a0f2e] px-6 py-12 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="FoundersSuite" width={36} height={36} className="rounded-lg" />
            <span className="text-lg font-extrabold tracking-tight">FoundersSuite</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
            <Link href="/agents" className="text-white/85 transition hover:text-white">
              Learn more
            </Link>
            <a href="mailto:support@founderssuite.ai" className="text-white/85 transition hover:text-white">
              Support
            </a>
          </div>
          <div className="flex items-center gap-5 text-white/80">
            <span className="sr-only">Social</span>
            <a href="#" className="transition hover:text-white" aria-label="Instagram">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            </a>
            <a href="#" className="transition hover:text-white" aria-label="LinkedIn">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M6.5 8.5h2V19h-2V8.5zm1-3.25a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM9.75 8.5H12v2.8h.05c.35-.65 1.2-1.35 2.45-1.35 2.6 0 3.1 1.7 3.1 3.9V19h-2v-5.2c0-1.25-.02-2.85-1.75-2.85-1.75 0-2 1.35-2 2.75V19h-2V8.5z" />
              </svg>
            </a>
            <a href="#" className="transition hover:text-white" aria-label="X">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M4 4l7.2 9.6L4 20h2.4l5.6-6.08L16.8 20H20l-7.6-10.1L19.2 4h-2.4l-5 6.72L7.4 4H4z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

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
    </div>
  );
}
