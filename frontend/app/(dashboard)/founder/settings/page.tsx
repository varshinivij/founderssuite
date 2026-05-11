"use client";

import { useState } from "react";

export default function FounderSettingsPage() {
  const [newFeedback, setNewFeedback] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [milestones, setMilestones] = useState(false);
  const [hubVisibility, setHubVisibility] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Settings
        </h1>
      </div>

      <div className="rounded-3xl bg-white border border-black/10 p-6 md:p-8 space-y-8">
        <div>
          <div className="text-lg font-extrabold">Product Listing</div>
          <div className="mt-4 space-y-5">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
                PRODUCT URL
              </div>
              <input
                defaultValue="https://app.betterment.ai/beta"
                className="mt-2 w-full h-12 rounded-full border border-black/10 bg-white px-5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
                  ACCESS TYPE
                </div>
                <div className="mt-2 h-12 rounded-full border border-black/10 bg-white px-5 flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#0a0a0f]">Invite Only</div>
                  <div className="text-[#6b7280]">▾</div>
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
                  TESTER CAP
                </div>
                <input
                  placeholder="Input Amount"
                  className="mt-2 w-full h-12 rounded-full border border-black/10 bg-white px-5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-lg font-extrabold">Test Configuration</div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
                START DATE
              </div>
              <input
                defaultValue="3/28/26"
                className="mt-2 w-full h-12 rounded-full border border-black/10 bg-white px-5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
              />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
                END DATE
              </div>
              <input
                defaultValue="4/7/26"
                className="mt-2 w-full h-12 rounded-full border border-black/10 bg-white px-5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
              />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
                DOMAIN
              </div>
              <div className="mt-2 h-12 rounded-full border border-black/10 bg-white px-5 flex items-center justify-between">
                <div className="text-sm font-semibold text-[#0a0a0f]">DevTools</div>
                <div className="text-[#6b7280]">▾</div>
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-[#6b7280] font-semibold">
                PHASE
              </div>
              <div className="mt-2 h-12 rounded-full border border-black/10 bg-white px-5 flex items-center justify-between">
                <div className="text-sm font-semibold text-[#0a0a0f]">Phase 2 (Current)</div>
                <div className="text-[#6b7280]">▾</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-lg font-extrabold">Notifications &amp; Preferences</div>
          <div className="mt-4 divide-y divide-black/10 border-t border-b border-black/10">
            {[
              {
                title: "New Feedback Alerts",
                sub: "Notify me when a tester submits feedback",
                value: newFeedback,
                set: setNewFeedback,
              },
              {
                title: "Weekly Digest",
                sub: "Summarized report of all feedback activity",
                value: weeklyDigest,
                set: setWeeklyDigest,
              },
              {
                title: "Tester Milestone Alerts",
                sub: "When a tester completes all the tasks",
                value: milestones,
                set: setMilestones,
              },
              {
                title: "Community Hub Visibility",
                sub: "Allow testers to post publicly about your product",
                value: hubVisibility,
                set: setHubVisibility,
              },
            ].map((row) => (
              <div key={row.title} className="py-5 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-[#0a0a0f]">{row.title}</div>
                  <div className="mt-1 text-sm text-[#6b7280]">{row.sub}</div>
                </div>
                <button
                  onClick={() => row.set(!row.value)}
                  className="h-8 w-14 rounded-full border border-black/10 p-1"
                  style={{ background: row.value ? "#3d1454" : "rgba(0,0,0,0.15)" }}
                  aria-label={`${row.title} toggle`}
                >
                  <div
                    className="h-6 w-6 rounded-full bg-white transition"
                    style={{ transform: row.value ? "translateX(24px)" : "translateX(0px)" }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

