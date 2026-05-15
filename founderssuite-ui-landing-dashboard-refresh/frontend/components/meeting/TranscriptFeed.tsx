"use client";

import { useEffect, useMemo, useRef } from "react";
import type { BiasEvent, Segment } from "@/lib/interviewIntelligence";

interface Props {
  segments: Segment[];
  biasFlags: BiasEvent[];
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function isFlagged(text: string, flags: Props["biasFlags"]) {
  return flags.some((f) =>
    text.toLowerCase().includes(f.flagged_text.toLowerCase().slice(0, 20))
  );
}

const SPEAKER_COLORS = [
  { bg: "rgba(201,184,216,0.65)", border: "rgba(201,184,216,0.95)", text: "#210b2c" },
  { bg: "rgba(247,217,196,0.55)", border: "rgba(242,165,142,0.7)", text: "#3d1454" },
  { bg: "rgba(107,45,139,0.12)", border: "rgba(107,45,139,0.35)", text: "#6b2d8b" },
  { bg: "rgba(232,201,160,0.42)", border: "rgba(232,201,160,0.72)", text: "#210b2c" },
];

export default function TranscriptFeed({ segments, biasFlags }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const speakerMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const segment of segments) {
      if (!map.has(segment.speaker)) {
        map.set(segment.speaker, map.size % SPEAKER_COLORS.length);
      }
    }
    return map;
  }, [segments]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [segments.length]);

  function getColor(speaker: string) {
    return SPEAKER_COLORS[speakerMap.get(speaker) ?? 0];
  }

  if (!segments.length) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-3"
        style={{ color: "var(--text-muted)" }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 18,
            opacity: 0.55,
          }}
        >
          REC
        </div>
        <p style={{ fontSize: 14 }}>
          Transcript will appear here once the meeting starts
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {segments.map((seg, i) => {
        const flagged = isFlagged(seg.text, biasFlags);
        const c = getColor(seg.speaker);
        const initial = seg.speaker.charAt(0).toUpperCase();
        const displayName =
          seg.speaker.charAt(0).toUpperCase() + seg.speaker.slice(1);

        return (
          <div
            key={i}
            className="rounded-2xl fade-in"
            style={{
              background: flagged
                ? "rgba(247,217,196,0.32)"
                : "rgba(107,45,139,0.035)",
              border: `1px solid ${
                flagged ? "rgba(242,165,142,0.48)" : "rgba(201,184,216,0.58)"
              }`,
              padding: "14px 18px",
            }}
          >
            <div className="flex items-center gap-3 mb-2.5">
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: c.text,
                }}
              >
                {initial}
              </div>
              <div className="flex-1">
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    color: c.text,
                  }}
                >
                  {displayName}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    marginLeft: 8,
                  }}
                >
                  {formatTime(seg.timestamp_ms)}
                </span>
              </div>
              {flagged && (
                <span className="fs-badge fs-badge-gold" style={{ fontSize: 9 }}>
                  Bias
                </span>
              )}
            </div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14,
                color: "var(--text-dim)",
                lineHeight: 1.6,
                paddingLeft: 44,
              }}
            >
              {seg.text}
            </p>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
