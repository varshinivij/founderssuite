"use client";

export default function FounderFormsPage() {
  const testers = [
    { name: "Sasha Nomura", email: "sasha@example.com", status: "IN PROGRESS", tasks: "8/10", score: 4.7, payout: 36 },
    { name: "Kayla Liu", email: "kayla@example.com", status: "COMPLETED", tasks: "10/10", score: 4.2, payout: 38 },
    { name: "Kevin Do", email: "kevin@example.com", status: "IN PROGRESS", tasks: "7/10", score: 4.5, payout: 28 },
    { name: "Marcus Reyes", email: "marcus@example.com", status: "COMPLETED", tasks: "10/10", score: 3.9, payout: 31 },
    { name: "Tara Winters", email: "tara@example.com", status: "IN PROGRESS", tasks: "4/10", score: 4.9, payout: 30 },
    { name: "Amara Osei", email: "amara@example.com", status: "IN PROGRESS", tasks: "9/10", score: 4.3, payout: 29 },
    { name: "Dev Kumar", email: "dev@example.com", status: "COMPLETED", tasks: "10/10", score: 4.0, payout: 36 },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Manage Testers
          </h1>
          <div className="mt-2 text-sm text-[#6b7280]">
            <span className="text-[#8b5cf6] font-semibold">42</span>{" "}
            <span className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
              ONBOARDED
            </span>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3d1454] text-white font-semibold shadow-[0_18px_60px_rgba(61,20,84,0.25)] hover:bg-[#2d1b4e] transition">
          + Invite Users
        </button>
      </div>

      <div className="rounded-3xl bg-white border border-black/10 overflow-hidden">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 text-[11px] uppercase tracking-widest font-semibold text-[#6b7280] border-b border-black/10">
          <div>Tester</div>
          <div>Status</div>
          <div>Tasks</div>
          <div>Score</div>
          <div>Payout</div>
        </div>
        {testers.map((t) => (
          <div
            key={t.email}
            className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-4 items-center px-6 py-5 border-b border-black/10 last:border-b-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-11 w-11 rounded-full bg-[#ede9fe] text-[#3d1454] flex items-center justify-center font-extrabold text-sm">
                {t.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[#0a0a0f] truncate">{t.name}</div>
                <div className="text-sm text-[#6b7280] truncate">{t.email}</div>
              </div>
            </div>

            <div>
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{
                  background: t.status === "COMPLETED" ? "rgba(139,92,246,0.15)" : "rgba(244,114,182,0.15)",
                  color: t.status === "COMPLETED" ? "#3d1454" : "#9f1239",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                {t.status}
              </span>
            </div>

            <div className="text-sm text-[#0a0a0f] font-semibold">{t.tasks}</div>
            <div className="text-sm text-[#0a0a0f] font-semibold">
              <span className="text-[#d4a373]">★</span> {t.score.toFixed(1)}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-[#0a0a0f] font-semibold">${t.payout}</div>
              <button className="px-4 py-2 rounded-full border border-black/10 bg-white text-sm font-semibold hover:bg-black/5 transition">
                View →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

