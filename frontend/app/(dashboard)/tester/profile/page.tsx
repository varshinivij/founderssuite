"use client";

import { useMemo } from "react";
import { mockTesterProfiles } from "@/lib/mock-data";
import { DEFAULT_TESTER_HEADSHOT_IMG_ID, pravatarUrl } from "@/lib/landing-pravatar";
import {
  Award,
  BadgeCheck,
  Briefcase,
  Calendar,
  Layers,
  Pencil,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function formatTestingType(t: string): string {
  if (t === "beta test") return "Beta testing";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default function TesterProfilePage() {
  const profile = mockTesterProfiles[0]!;
  const initials =
    profile.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "TD";

  const headshotId = profile.pravatarImgId ?? DEFAULT_TESTER_HEADSHOT_IMG_ID;
  const headshotSrc = pravatarUrl(headshotId, 176);

  const stats = useMemo(
    () => [
      { icon: <Users className="text-[#8b5cf6]" size={18} />, value: "12", label: "Tests Completed" },
      {
        icon: <Star className="text-[#8b5cf6]" size={18} />,
        value: String(profile.qualityScore ?? 4.9),
        label: "Quality Score",
      },
      {
        icon: <Briefcase className="text-[#8b5cf6]" size={18} />,
        value: String(profile.projectsTested ?? 8),
        label: "Posts Made",
      },
    ],
    [profile.projectsTested, profile.qualityScore],
  );

  const tags = (profile.tags ?? profile.skills ?? []).slice(0, 8);
  const experience = [
    {
      org: "Meridian",
      sub: "Beta Testing",
      weeks: "5 weeks",
      detail: "EHR handoff flows, clinician onboarding, audit log readability.",
    },
    {
      org: "Nexus CRM",
      sub: "Problem Validation",
      weeks: "2 weeks",
      detail: "Pipeline hygiene interviews with RevOps + AEs; 14 sessions.",
    },
    {
      org: "FreshBasket",
      sub: "Concept Prototyping",
      weeks: "3 weeks",
      detail: "Mobile checkout prototypes; moderated card sorts on taxonomy.",
    },
  ];

  const posts = [
    {
      title:
        "Real-time transaction data is blazing fast. Bank-level trust signals need immediate attention.",
      body:
        "Tested E2E spend management tool. Data refresh speeds were impressive and consistent. Trust badges and permissions felt unclear — buried three clicks deep, and no “factory setup” option.",
      meta: "42",
    },
    {
      title:
        "AI-generated insights are impressive, but the chart builder needs serious work.",
      body:
        "The AI summary at the top of every dashboard is genuinely useful. But it can’t read paid spend well and export flows are brittle. Drag-and-drop broke on Firefox; column headers were cryptic; and I lost my work twice.",
      meta: "89",
    },
  ];

  const bioParagraphs = profile.bio.split(/\n\n+/).filter(Boolean);
  const interestPills = [profile.domain, ...profile.industryInterests].filter(
    (v, i, a) => v && a.indexOf(v) === i,
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-[#dcd4ef] bg-[#f3f0f7] shadow-sm ring-1 ring-[#e8dff6]/80">
        <div
          className="h-28 bg-gradient-to-b from-violet-100/95 via-[#ebe3f7] to-transparent"
          aria-hidden
        />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                <Avatar className="h-20 w-20 ring-4 ring-white">
                  <AvatarImage src={headshotSrc} alt="" className="object-cover" />
                  <AvatarFallback className="bg-[#3d1454] text-lg font-extrabold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <BadgeCheck
                  className="absolute -bottom-0.5 -right-0.5 size-7 rounded-full bg-white p-0.5 text-[#8b5cf6]"
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                    {profile.name}
                  </h1>
                  {profile.isTopVoice ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-900">
                      <Zap className="size-3.5 shrink-0 text-[#8b5cf6]" aria-hidden />
                      Top voice
                    </span>
                  ) : null}
                  <span className="text-sm text-slate-600">{profile.pronouns ?? ""}</span>
                </div>
                {profile.professionalHeadline ? (
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {profile.professionalHeadline}
                  </p>
                ) : null}
                <div className="mt-1 text-sm text-slate-600">
                  Recently beta-tested @{" "}
                  <span className="font-medium text-slate-900">
                    {profile.previousCompany ?? "Meridian Capital"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {interestPills.slice(0, 4).map((pill) => (
                    <span
                      key={pill}
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-900"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-black/5"
              >
                <Pencil size={16} />
                Edit
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-slate-900">
                  {s.icon}
                  <div className="text-lg font-extrabold">{s.value}</div>
                </div>
                <div className="mt-1 text-xs text-slate-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="text-sm font-extrabold text-slate-900">About</div>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
              {bioParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                <span className="mr-1.5 inline-block size-1 rounded-full bg-violet-400 align-middle" aria-hidden />
                Lived experience
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{profile.livedExperience}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <Layers className="size-4 text-[#8b5cf6]" aria-hidden />
                How I test
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {profile.methodology ??
                  "Structured sessions with clear success criteria, think-aloud where appropriate, and written follow-ups with prioritized findings."}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <Briefcase className="size-4 text-[#8b5cf6]" aria-hidden />
                Tools &amp; stack
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(profile.tooling ?? profile.skills).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-violet-200/80 bg-violet-50/80 px-2.5 py-1 text-xs font-medium text-violet-950"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                Core skills
              </div>
              <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                {profile.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <Calendar className="size-4 text-[#8b5cf6]" aria-hidden />
                Availability &amp; logistics
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Schedule
                  </dt>
                  <dd className="mt-0.5 text-slate-700">{profile.availability}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Timezone
                  </dt>
                  <dd className="mt-0.5 text-slate-700">{profile.timezone}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Session types
                  </dt>
                  <dd className="mt-0.5 text-slate-700">
                    {profile.testingTypes.map(formatTestingType).join(" · ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Surfaces
                  </dt>
                  <dd className="mt-0.5 text-slate-700">
                    {profile.platformPreferences.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" · ")}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <Award className="size-4 text-[#8b5cf6]" aria-hidden />
                Credentials &amp; focus
              </div>
              {profile.certifications?.length ? (
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {profile.certifications.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#8b5cf6]" aria-hidden />
                      {c}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  No public certifications listed — depth comes from shipped work and moderated studies.
                </p>
              )}
              <div className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">
                Industries
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.industryInterests.map((i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-800"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-slate-900">Recent posts</div>
            <button type="button" className="text-sm text-slate-600 transition hover:text-slate-900">
              See all →
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            {posts.map((p) => (
              <div key={p.title} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
                <div className="font-semibold text-slate-900">{p.title}</div>
                <div className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-600">{p.meta} likes</div>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-black/5"
                  >
                    Go to post →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-extrabold text-slate-900">Previous experience</div>
          <button type="button" className="text-sm text-slate-600 transition hover:text-slate-900">
            See all →
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {experience.map((e) => (
            <div
              key={e.org}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 md:min-h-[140px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{e.org}</div>
                  <div className="text-xs text-slate-600">{e.sub}</div>
                </div>
                <div className="shrink-0 rounded-full border border-violet-200/70 bg-violet-50/80 px-3 py-1 text-xs text-slate-700">
                  {e.weeks}
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">{e.detail}</p>
            </div>
          ))}
        </div>

        {tags.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className={cn(
                  "rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-900",
                )}
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
