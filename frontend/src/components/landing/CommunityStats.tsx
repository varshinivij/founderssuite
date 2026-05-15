import { Star } from "lucide-react";

const AVATAR_PINS = [
  { lon: -122.4, lat: 37.8, imgId: 12 },
  { lon: -74.0, lat: 40.7, imgId: 32 },
  { lon: -46.6, lat: -23.5, imgId: 45 },
  { lon: 2.35, lat: 48.86, imgId: 16 },
  { lon: -0.13, lat: 51.5, imgId: 27 },
  { lon: 3.4, lat: 6.5, imgId: 68 },
  { lon: 139.65, lat: 35.68, imgId: 11 },
  { lon: 103.82, lat: 1.35, imgId: 59 },
  { lon: 151.2, lat: -33.87, imgId: 33 },
] as const;

function pravatarUrl(imgId: number, size = 128) {
  return `https://i.pravatar.cc/${size}?img=${imgId}`;
}

function geoToStyle(lon: number, lat: number) {
  return {
    left: `${((lon + 180) / 360) * 100}%`,
    top: `${((90 - lat) / 180) * 100}%`,
    transform: "translate(-50%, -50%)",
  } as const;
}

function WorldMap() {
  return (
    <div className="relative mx-auto w-full max-w-[920px]">
      <div className="relative aspect-[950/620] w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-violet-50/60 shadow-[0_10px_36px_rgba(91,33,182,0.08)]">
        <img
          src="/landing/world-map-low-resolution.svg"
          alt="World map showing tester locations"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain p-2 opacity-[0.6] [filter:invert(88%)_sepia(12%)_saturate(900%)_hue-rotate(232deg)_brightness(0.92)_contrast(0.92)] sm:p-3"
        />
        {AVATAR_PINS.map((p, i) => (
          <div
            key={i}
            className="absolute z-10 size-9 overflow-hidden rounded-full bg-[#f5f0ff] shadow-[0_8px_24px_rgba(139,92,246,0.3)] ring-2 ring-[#8b5cf6] ring-offset-1 ring-offset-white sm:size-10"
            style={geoToStyle(p.lon, p.lat)}
          >
            <img
              src={pravatarUrl(p.imgId, 80)}
              alt=""
              width={40}
              height={40}
              className="size-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
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
    <section id="community" className="relative scroll-mt-32 overflow-x-hidden">
      <div className="mx-auto max-w-[1100px] px-6 py-16 md:py-20">
        <div className="text-center">
          <div className="text-2xl font-semibold italic text-violet-700">
            Community of collaborative testers,
            <br />
            driving discussion in specialized domain spaces
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 text-center md:grid-cols-3">
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
                  <span className="font-bold text-[#5b21b6]">{c.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-sm text-slate-600">{c.loc}</div>
                </div>
              </div>
              <div className="mt-4 text-sm leading-relaxed text-slate-600">
                "The match quality is the best I've seen — the context is clear and the questions are neutral."
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
