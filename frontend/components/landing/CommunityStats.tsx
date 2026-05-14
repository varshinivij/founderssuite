"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { LANDING_MAP_AVATAR_PINS, pravatarUrl } from "@/lib/landing-pravatar";

/** Equirectangular projection → % positions for overlay (matches Wikimedia map viewBox 950×620). */
function geoToStyle(lon: number, lat: number) {
  const leftPct = ((lon + 180) / 360) * 100;
  const topPct = ((90 - lat) / 180) * 100;
  return {
    left: `${leftPct}%`,
    top: `${topPct}%`,
    transform: "translate(-50%, -50%)",
  } as const;
}

const MAP_SRC = "/landing/world-map-low-resolution.svg";

function WorldMap() {
  return (
    <div className="relative w-full max-w-[920px] mx-auto">
      <div className="relative aspect-[950/620] w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white/80 shadow-[0_10px_36px_rgba(91,33,182,0.08)] backdrop-blur-sm">
        {/* Real world geography (Natural Earth–style country paths); tinted to match landing palette */}
        <Image
          src={MAP_SRC}
          alt=""
          fill
          className="object-contain p-2 sm:p-3 [filter:invert(88%)_sepia(12%)_saturate(900%)_hue-rotate(232deg)_brightness(0.92)_contrast(0.92)] opacity-[0.82] pointer-events-none"
          sizes="(max-width: 920px) 100vw, 920px"
          priority={false}
        />

        {LANDING_MAP_AVATAR_PINS.map((p, i) => (
          <div
            key={i}
            className="absolute z-10 size-10 overflow-hidden rounded-full bg-[#f5f0ff] shadow-[0_8px_24px_rgba(139,92,246,0.3)] ring-2 ring-[#8b5cf6] ring-offset-2 ring-offset-white sm:size-11"
            style={geoToStyle(p.lon, p.lat)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote avatars; pravatar does not need optimization */}
            <img
              src={pravatarUrl(p.imgId, 128)}
              alt=""
              width={44}
              height={44}
              className="size-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[11px] leading-snug text-slate-500">
        World map ©{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:World_map_-_low_resolution.svg"
          target="_blank"
          rel="noreferrer"
          className="text-violet-700 underline underline-offset-2 hover:text-violet-900"
        >
          Al MacDonald
        </a>{" "}
        (
        <a
          href="https://creativecommons.org/licenses/by-sa/3.0/deed.en"
          target="_blank"
          rel="noreferrer"
          className="text-violet-700 underline underline-offset-2 hover:text-violet-900"
        >
          CC BY-SA 3.0
        </a>
        ).
      </p>
    </div>
  );
}

export function CommunityStats() {
  const stats = [
    { value: "1,200+", label: "Founders" },
    { value: "8,427", label: "Testers" },
    { value: "$160K+", label: "Saved in Research" },
  ];

  const cards = [
    { name: "Noah", loc: "France", domain: "FinTech" },
    { name: "Alyssa", loc: "United States", domain: "SaaS" },
    { name: "Wei", loc: "China", domain: "HealthTech" },
  ];

  return (
    <section className="relative overflow-x-hidden">
      <div className="mx-auto max-w-[1100px] px-6 py-16 md:py-20">
        <div className="text-center">
          <div className="text-2xl font-semibold italic text-violet-700">
            Community of collaborative testers,
            <br />
            driving discussion in specialized domain spaces
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-extrabold text-slate-900" style={{ fontSize: 64, lineHeight: 1 }}>
                {s.value}
              </div>
              <div className="mt-2 text-base text-slate-600">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <WorldMap />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.name}
              className="rounded-xl border border-slate-200/90 bg-white/90 p-5 shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#8b5cf6] bg-[#f5f0ff]">
                  <span className="font-bold text-[#5b21b6]">
                    {c.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-sm text-slate-600">{c.loc}</div>
                </div>
              </div>
              <div className="mt-4 text-sm leading-relaxed text-slate-600">
                “The match quality is the best I’ve seen — the context is clear and the questions are neutral.”
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs text-violet-800">
                  {c.domain}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
