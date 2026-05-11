"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Share2 } from "lucide-react";
import type { CommunityPost } from "@/types";

export function CommunityPostCard({ post }: { post: CommunityPost }) {
  const layout = post.imageLayout ?? (post.imageUrls?.length === 3 ? "triple" : post.imageUrls?.length === 2 ? "double" : "single");

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_28px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_8px_36px_rgba(91,33,182,0.08)]">
      <div className="relative p-6 pb-4">
        {post.isTopVoice ? (
          <div className="absolute right-5 top-5 max-w-[11rem] rounded-md border border-orange-200/90 bg-orange-50 px-2.5 py-1 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-orange-900">
            Top voice this week
          </div>
        ) : null}

        <div className="flex gap-3 pr-24">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 ring-2 ring-violet-100">
            {post.author.avatar ? (
              <Image
                src={post.author.avatar}
                alt=""
                width={44}
                height={44}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm font-bold text-violet-800">
                {post.author.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-900">{post.author.name}</div>
            <div className="text-sm text-slate-500">
              {post.peerLine ?? `${post.author.role} · ${post.domain}`}
            </div>
          </div>
        </div>

        <h2 className="mt-5 text-xl font-extrabold leading-snug tracking-tight text-slate-900 md:text-2xl">
          {post.title}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{post.content}</p>
      </div>

      {post.imageUrls?.length ? (
        <div className="border-t border-slate-100 px-6 py-5">
          {layout === "double" && post.imageUrls.length >= 2 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {post.imageUrls.slice(0, 2).map((src) => (
                <div
                  key={src}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200/80 bg-slate-200 shadow-sm"
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 400px" />
                </div>
              ))}
            </div>
          ) : layout === "triple" && post.imageUrls.length >= 3 ? (
            <div className="flex gap-2 sm:gap-3">
              {post.imageUrls.slice(0, 3).map((src) => (
                <div
                  key={src}
                  className="relative aspect-[9/16] min-h-[200px] flex-1 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-200 shadow-sm"
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="120px" />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200/80 bg-slate-200 shadow-sm">
              <Image
                src={post.imageUrls[0]!}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 800px"
                priority={false}
              />
            </div>
          )}
        </div>
      ) : null}

      <div className="flex items-center gap-6 border-t border-slate-100 px-6 py-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
          <Heart className="size-4 text-rose-500" strokeWidth={2} aria-hidden />
          {post.likes}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 font-medium text-slate-700 transition hover:text-violet-700"
        >
          <Share2 className="size-4" strokeWidth={2} aria-hidden />
          Share
        </button>
        <Link
          href={`/community/post/${post.id}`}
          className="ml-auto text-sm font-semibold text-violet-700 underline-offset-2 hover:text-violet-900 hover:underline"
        >
          Open thread
        </Link>
      </div>
    </article>
  );
}
