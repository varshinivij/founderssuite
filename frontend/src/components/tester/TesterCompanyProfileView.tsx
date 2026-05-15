import { Link } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  CheckSquare,
  DollarSign,
  Users,
} from "lucide-react";
import type { TesterCompanyProfile } from "../../lib/testerCompanyProfiles";
import { TesterCompanyLogoMark } from "./TesterCompanyLogoMark";

function StatIcon({ kind }: { kind: "users" | "dollar" | "check" }) {
  const cls = "h-5 w-5 text-[#6d28d9]";
  if (kind === "users") return <Users className={cls} />;
  if (kind === "dollar") return <DollarSign className={cls} />;
  return <CheckSquare className={cls} />;
}

export default function TesterCompanyProfileView({ profile }: { profile: TesterCompanyProfile }) {
  return (
    <div className="space-y-0 pb-16">
      <div className="mb-6">
        <Link
          to="/tester/matches"
          className="text-sm font-medium text-[#6d28d9] underline-offset-4 hover:underline"
        >
          ← Back to matches
        </Link>
      </div>

      {/* Hero */}
      <section className="rounded-3xl bg-[#ebe8f4] px-6 py-10 shadow-sm ring-1 ring-[#dcd4ef]/80 md:px-10 md:py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <div className="flex shrink-0 flex-col items-center gap-4 sm:flex-row sm:items-start lg:flex-col lg:items-center">
            <TesterCompanyLogoMark
              emoji={profile.logoEmoji}
              label={profile.logoLabel}
              size="hero"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-5">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                {profile.displayName}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.tags.map((t) => (
                  <span
                    key={t.label}
                    className={
                      t.style === "orange"
                        ? "rounded-full bg-[#ffedd5] px-3 py-1 text-xs font-semibold text-[#9a3412] ring-1 ring-[#fdba74]/80"
                        : "rounded-full bg-[#fce7f3] px-3 py-1 text-xs font-semibold text-[#9d174d] ring-1 ring-[#f9a8d4]/70"
                    }
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>

            <p className="max-w-3xl text-base leading-relaxed text-slate-700 md:text-[17px]">
              {profile.description}
            </p>

            <Link
              to="/tester/feed"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fef6c3] via-[#fce8a6] to-[#f59e0b] px-8 py-3.5 text-base font-semibold text-[#2d1b4e] shadow-[0_8px_32px_rgba(234,179,8,0.35)] transition hover:brightness-[1.03] sm:w-auto sm:min-w-[280px]"
            >
              Start testing now
              <ArrowRight className="h-5 w-5 shrink-0" />
            </Link>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {profile.heroStats.map((s) => (
                <div
                  key={s.sub}
                  className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white px-4 py-4 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3f0ff]">
                    <StatIcon kind={s.icon} />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-slate-900">{s.headline}</div>
                    <div className="text-xs font-medium capitalize text-slate-600">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo video */}
      <section className="mx-auto mt-14 max-w-5xl space-y-4 px-0">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{profile.demoTitle}</h2>
          <p className="mt-1 text-sm text-slate-600 md:text-base">{profile.demoSubtitle}</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-[#f1f5f9] p-4 shadow-inner md:p-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            <div className="bg-[#2d1b4e] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-white md:text-xs">
              User survey — {profile.surveyBrand} | Help us understand your experience
            </div>
            <div className="space-y-4 px-4 py-5 md:px-6 md:py-6">
              <p className="text-sm font-semibold leading-snug text-slate-900 md:text-base">
                {profile.surveyQuestion}
              </p>
              <div className="space-y-2">
                {profile.surveyOptions.map((opt, i) => {
                  const selected = i === profile.selectedOptionIndex;
                  return (
                    <div
                      key={opt}
                      className={`rounded-xl border px-3 py-3 text-sm transition md:px-4 ${
                        selected
                          ? "border-[#8b5cf6] bg-violet-50/90 ring-2 ring-[#8b5cf6]/25"
                          : "border-slate-200 bg-slate-50/80 text-slate-700"
                      }`}
                    >
                      {opt}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end pt-1">
                <span className="inline-flex rounded-full bg-[#8b5cf6] px-5 py-2 text-sm font-semibold text-white shadow-sm">
                  Next →
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {profile.demoPills.map((p) => (
              <span
                key={p}
                className="rounded-full border border-[#dcd4ef] bg-white px-3 py-1 text-xs font-medium text-[#4c1d95] shadow-sm"
              >
                {p}
              </span>
            ))}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-slate-600 md:text-[15px]">{profile.demoBody}</p>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto mt-16 max-w-5xl space-y-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Team at {profile.displayName}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profile.team.map((m) => (
            <div
              key={m.id}
              className="flex gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm"
            >
              <img
                src={`https://i.pravatar.cc/96?img=${m.avatarImg}`}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[#ebe8f4]"
              />
              <div className="min-w-0">
                <div className="font-bold text-slate-900">{m.name}</div>
                <div className="text-xs text-slate-600">{m.title}</div>
                <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {m.dept}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-stretch gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            See all {profile.employeeTotal} employees
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 pl-1">
            <div className="flex -space-x-2">
              {[41, 52, 16, 29].map((img) => (
                <img
                  key={img}
                  src={`https://i.pravatar.cc/48?img=${img}`}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full border-2 border-white object-cover ring-1 ring-slate-200"
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-600">+{profile.moreFaces} more</span>
          </div>
        </div>
      </section>
    </div>
  );
}
