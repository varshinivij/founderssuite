import { Link } from "react-router";
import { Star } from "lucide-react";

/** Pravatar ids from `LANDING_MAP_AVATAR_PINS` — demo only. */
const DEMO_FOUNDER_HEADSHOT_IMG_ID = 12;
const DEFAULT_TESTER_HEADSHOT_IMG_ID = 27;

function pravatarUrl(imgId: number, size = 128): string {
  return `https://i.pravatar.cc/${size}?img=${imgId}`;
}

export function HeroSectionV2({ role }: { role: "founder" | "tester" }) {
  const copy =
    role === "founder"
      ? {
          headlineA: "Market validation,",
          headlineB: "reimagined.",
          subtext:
            "FoundersSuite transforms the exhausting process of market validation into a centralized, transparent, and frictionless system.",
          ctaA: "Join as Founder",
          ctaB: "Login",
          ctaALink: "/signup/founder",
          ctaBLink: "/login",
        }
      : {
          headlineA: "Get hired to validate",
          headlineB: "products.",
          subtext:
            "Share your real-world experience. Match with founders who need your insight. Get paid.",
          ctaA: "Join as Tester",
          ctaB: "Login",
          ctaALink: "/signup/tester",
          ctaBLink: "/login",
        };

  return (
    <section id="overview" className="relative scroll-mt-32 overflow-hidden">
      <div className="mx-auto max-w-[1100px] px-6 pb-20 pt-20 md:pb-24 md:pt-24 lg:pt-28">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.08fr_1fr] lg:items-start lg:gap-x-14 lg:gap-y-10">
          <div className="text-center lg:text-left">
            <h1 className="text-[3.5rem] font-extrabold leading-[1.08] tracking-tight text-white md:text-[4.25rem] lg:text-[4.5rem] xl:text-[4.75rem]">
              {copy.headlineA}
              <br />
              <span className="italic text-[#c084fc]">{copy.headlineB}</span>
            </h1>
            <p className="mx-auto mt-7 max-w-[460px] text-lg leading-relaxed text-purple-100/90 md:mt-8 md:text-xl lg:mx-0">
              {copy.subtext}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3.5 md:mt-10 lg:justify-start">
              <Link
                to={copy.ctaALink}
                className="rounded-full bg-[#8b5cf6] px-7 py-3.5 text-base font-medium text-white transition hover:bg-[#7c3aed] md:px-8 md:text-[17px]"
              >
                {copy.ctaA}
              </Link>
              <Link
                to={copy.ctaBLink}
                className="rounded-full border border-white/35 bg-white/10 px-7 py-3.5 text-base font-medium text-white backdrop-blur-sm transition hover:border-white/55 hover:bg-white/15 md:px-8 md:text-[17px]"
              >
                {copy.ctaB}
              </Link>
            </div>
          </div>

          {/*
            Tall stage (min-height): cards at corners; match centered; no outer chrome.
          */}
          <div className="relative mx-auto hidden w-full max-w-[min(100%,720px)] justify-self-end lg:flex lg:min-h-[min(70vh,760px)] lg:items-center lg:justify-end">
            <div
              className="relative w-full max-w-[540px] p-3 min-h-[min(68vh,700px)] -translate-y-8 md:max-w-[580px] md:min-h-[min(70vh,740px)] md:-translate-y-10 md:p-4 lg:max-w-[620px] lg:min-h-[min(72vh,780px)] lg:-translate-y-14"
              aria-label="Example match between a founder and a tester"
            >
              {/* Founder — hug top-right corner, nudge further out from center */}
              <div className="absolute right-2 top-2 z-[1] w-[min(100%,244px)] max-w-[244px] translate-x-2 -translate-y-2 md:right-3 md:top-3 md:max-w-[252px] md:translate-x-3 md:-translate-y-3">
                <article className="overflow-hidden rounded-2xl border border-white/80 bg-white p-3 shadow-[0_32px_64px_-14px_rgba(25,8,55,0.42),0_16px_40px_-12px_rgba(91,33,182,0.28),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-violet-300/35 md:rounded-3xl md:p-3.5">
                  <div className="flex items-start gap-2">
                    <img
                      src={pravatarUrl(DEMO_FOUNDER_HEADSHOT_IMG_ID, 96)}
                      alt=""
                      width={44}
                      height={44}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-violet-200/90 md:h-11 md:w-11 md:rounded-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold leading-tight tracking-tight text-[#2d1b4e] md:text-[15px]">
                        Kevin T.
                      </h3>
                      <p className="mt-px text-[10px] font-medium text-slate-500 md:text-[11px]">Founder</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="rounded-full bg-violet-100/90 px-1.5 py-px text-[9px] font-semibold text-violet-950 ring-1 ring-violet-300/60 md:text-[10px]">
                          VitalSpan Labs
                        </span>
                        <span className="rounded-full bg-slate-100/95 px-1.5 py-px text-[9px] font-semibold text-slate-800 ring-1 ring-slate-200/80 md:text-[10px]">
                          SaMD · Class II
                        </span>
                        <span className="rounded-full bg-emerald-50 px-1.5 py-px text-[9px] font-semibold text-emerald-900 ring-1 ring-emerald-200/70 md:text-[10px]">
                          HIPAA
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-slate-600 md:text-[12px]">
                    Remote cardiac rhythm patch — need hospital IT + clinical workflow testers, not consumer UX panels.
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-violet-100/80 bg-violet-50/40 p-1.5 shadow-inner md:gap-1.5 md:rounded-xl md:p-2">
                    <div className="rounded-md bg-white/80 px-1 py-1 text-center ring-1 ring-violet-100/60 md:rounded-lg md:px-1.5">
                      <div className="text-[8px] font-semibold uppercase tracking-wide text-slate-500 md:text-[9px]">
                        Open tests
                      </div>
                      <div className="text-[11px] font-extrabold tabular-nums leading-none text-[#2d1b4e] md:text-xs">3</div>
                    </div>
                    <div className="rounded-md bg-white/80 px-1 py-1 text-center ring-1 ring-violet-100/60 md:rounded-lg md:px-1.5">
                      <div className="text-[8px] font-semibold uppercase tracking-wide text-slate-500 md:text-[9px]">
                        Reply SLA
                      </div>
                      <div className="text-[11px] font-extrabold leading-none text-[#2d1b4e] md:text-xs">&lt; 6d</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-violet-100/90 pt-2">
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 md:text-[10px]">
                      Vertical
                    </span>
                    <span className="rounded-full bg-gradient-to-r from-[#3d1454] to-[#4c1d95] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-50 shadow-sm shadow-violet-900/25 md:px-2.5 md:text-[10px]">
                      MedTech
                    </span>
                  </div>
                </article>
              </div>

              {/* Tester — hug bottom-left */}
              <div className="absolute bottom-2 left-2 z-[1] w-[min(100%,244px)] max-w-[244px] -translate-x-2 translate-y-2 md:bottom-3 md:left-3 md:max-w-[252px] md:-translate-x-3 md:translate-y-3">
                <article className="overflow-hidden rounded-2xl border border-white/80 bg-white p-3 shadow-[0_34px_68px_-14px_rgba(25,8,55,0.45),0_18px_44px_-12px_rgba(109,40,217,0.26),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-fuchsia-200/30 md:rounded-3xl md:p-3.5">
                  <div className="flex items-start gap-2">
                    <img
                      src={pravatarUrl(DEFAULT_TESTER_HEADSHOT_IMG_ID, 96)}
                      alt=""
                      width={44}
                      height={44}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-violet-200/90 md:h-11 md:w-11 md:rounded-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-sm font-bold leading-tight tracking-tight text-[#2d1b4e] md:text-[15px]">
                          Anne B.
                        </h3>
                        <span className="rounded-full bg-amber-100 px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-amber-950 ring-1 ring-amber-300/70 md:text-[9px]">
                          5★
                        </span>
                      </div>
                      <p className="mt-px text-[10px] font-medium text-slate-500 md:text-[11px]">Tester</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="rounded-md bg-slate-100/95 px-1.5 py-px text-[9px] font-semibold text-slate-800 ring-1 ring-slate-200/80 md:text-[10px]">
                          Clinical Ops
                        </span>
                        <span className="rounded-md bg-slate-100/95 px-1.5 py-px text-[9px] font-semibold text-slate-800 ring-1 ring-slate-200/80 md:text-[10px]">
                          ex-Medtronic
                        </span>
                        <span className="rounded-md bg-slate-100/95 px-1.5 py-px text-[9px] font-semibold text-slate-800 ring-1 ring-slate-200/80 md:text-[10px]">
                          US/EU
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 rounded-md border border-amber-100/90 bg-gradient-to-r from-amber-50/90 to-orange-50/50 px-2 py-1 shadow-inner md:rounded-lg md:px-2.5">
                    <div className="flex shrink-0 items-center gap-px text-amber-500">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="size-2.5 fill-amber-400 drop-shadow-sm md:size-3" aria-hidden />
                      ))}
                    </div>
                    <div className="flex min-w-0 items-baseline gap-1.5 leading-none">
                      <span className="text-[11px] font-extrabold tabular-nums text-slate-900 md:text-xs">4.9</span>
                      <span className="text-[8px] font-semibold uppercase tracking-wide text-amber-900/75 md:text-[9px]">
                        Quality
                      </span>
                    </div>
                  </div>
                  <blockquote className="mt-1.5 text-[11px] font-medium italic leading-snug text-slate-700 md:text-[12px]">
                    &ldquo;They wanted EHR-adjacent edge cases — alarm fatigue, nurse overrides, and audit-trail
                    gaps.&rdquo;
                  </blockquote>
                  <p className="mt-1 text-[9px] leading-snug text-slate-500 md:text-[10px]">
                    Last: <span className="font-semibold text-slate-700">telemetry UX</span> · MedTech
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-fuchsia-100/90 pt-2">
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 md:text-[10px]">
                      Vertical
                    </span>
                    <span className="rounded-full bg-gradient-to-r from-[#3d1454] to-[#5b21b6] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-50 shadow-sm shadow-violet-900/25 md:px-2.5 md:text-[10px]">
                      MedTech
                    </span>
                  </div>
                </article>
              </div>

              {/* Match — center; smaller footprint so cards can breathe; only bridge element */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                <div className="pointer-events-auto rounded-full bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 p-0.5 shadow-[0_0_28px_rgba(250,204,21,0.45),0_10px_22px_rgba(0,0,0,0.18)] md:p-1 md:shadow-[0_0_36px_rgba(250,204,21,0.5),0_12px_28px_rgba(0,0,0,0.2)]">
                  <div className="flex h-[84px] w-[84px] flex-col items-center justify-center rounded-full border-[2.5px] border-white bg-gradient-to-b from-[#3d1454] to-[#1f0d2e] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_22px_rgba(0,0,0,0.5)] md:h-[92px] md:w-[92px] md:border-[3px]">
                    <span className="text-xl font-extrabold leading-none tracking-tight text-white md:text-2xl">97%</span>
                    <span className="mt-0.5 text-[10px] font-semibold text-violet-200/95 md:mt-1 md:text-[11px]">Match</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
