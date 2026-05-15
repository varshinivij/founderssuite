"use client";

import Link from "next/link";
import { useForms } from "@/hooks/useForms";
import { useAuth } from "@/hooks/useAuth";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";

export default function FounderFormsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useForms(user?.id);
  const forms = data ?? [];
  const open = forms.filter((f) => f.status === "open").length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Manage Forms
          </h1>
          <div className="mt-2 text-sm text-[#6b7280]">
            <span className="text-[#8b5cf6] font-semibold">{open}</span>{" "}
            <span className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
              OPEN
            </span>
            {" · "}
            <span className="text-[#8b5cf6] font-semibold">{forms.length}</span>{" "}
            <span className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
              TOTAL
            </span>
          </div>
        </div>
        <Link
          href="/founder/forms/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3d1454] text-white font-semibold shadow-[0_18px_60px_rgba(61,20,84,0.25)] hover:bg-[#2d1b4e] transition"
        >
          + New Form
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : forms.length === 0 ? (
        <div className="rounded-3xl bg-white border border-black/10 p-10 text-center text-[#6b7280]">
          <div className="text-lg font-semibold text-[#0a0a0f]">No forms yet</div>
          <div className="mt-2 text-sm">Create your first validation form to start matching with testers.</div>
          <Link
            href="/founder/forms/new"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3d1454] text-white font-semibold hover:bg-[#2d1b4e] transition"
          >
            + Create form
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-black/10 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 text-[11px] uppercase tracking-widest font-semibold text-[#6b7280] border-b border-black/10">
            <div>Form</div>
            <div>Status</div>
            <div>Stage</div>
            <div>Compensation</div>
            <div>Actions</div>
          </div>
          {forms.map((f) => (
            <div
              key={f.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-center px-6 py-5 border-b border-black/10 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="font-semibold text-[#0a0a0f] truncate">{f.title}</div>
                <div className="text-sm text-[#6b7280] truncate mt-0.5">{f.targetProfile}</div>
              </div>

              <div>
                <Badge
                  className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    background: f.status === "open" ? "rgba(139,92,246,0.15)" : "rgba(107,114,128,0.15)",
                    color: f.status === "open" ? "#3d1454" : "#6b7280",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  {f.status.toUpperCase()}
                </Badge>
              </div>

              <div className="text-sm text-[#0a0a0f] font-semibold">{f.stage ?? "—"}</div>
              <div className="text-sm text-[#0a0a0f] font-semibold">
                {f.compensation ? `$${f.compensation}` : "—"}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/founder/forms/${f.id}`}
                  className="px-4 py-2 rounded-full border border-black/10 bg-white text-sm font-semibold hover:bg-black/5 transition"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
