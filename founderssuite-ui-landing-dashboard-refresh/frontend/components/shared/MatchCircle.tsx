"use client";

interface MatchCircleProps {
  score: number; // 0 to 1
  size?: number; // default 80
  /** When set, overrides traffic-light ring color (e.g. landing demo). */
  progressStroke?: string;
  /** Background track stroke (default dark zinc). */
  trackStroke?: string;
  /** Inner fill behind the progress arc. */
  inactiveFill?: string;
}

export function MatchCircle({
  score,
  size = 80,
  progressStroke,
  trackStroke = "#27272a",
  inactiveFill = "rgba(139, 92, 246, 0.1)",
}: MatchCircleProps) {
  const pct = Math.round(score * 100);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - score * circumference;

  const color =
    progressStroke ?? (pct >= 80 ? "#22c55e" : pct >= 60 ? "#eab308" : "#dc2626");

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={inactiveFill}
          stroke={trackStroke}
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-bold" style={{ fontSize: size * 0.22 }}>
          {pct}%
        </span>
        <span className="text-[#a8a9ad]" style={{ fontSize: size * 0.13 }}>
          Match
        </span>
      </div>
    </div>
  );
}

