"use client";

import {
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  TrackLoop,
  useLocalParticipant,
  useParticipants,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import type { BiasEvent, LiveIntelligenceState, QuoteEvent, Segment } from "@/lib/interviewIntelligence";
import TranscriptFeed from "./TranscriptFeed";

function labelize(v: string) { return v.replace(/_/g, " "); }
function pct(v: number) { return `${Math.round(v * 100)}%`; }

const PHASES: Array<{ key: LiveIntelligenceState["intent"]["phase"]; label: string }> = [
  { key: "rapport", label: "Rapport" },
  { key: "problem_exploration", label: "Problem" },
  { key: "solution_validation", label: "Solution" },
  { key: "pricing", label: "Pricing" },
  { key: "closing", label: "Close" },
];

function ParticipantList() {
  const participants = useParticipants();
  return (
    <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(201,184,216,0.72)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="fs-label">Participants</p>
        <span className="fs-badge fs-badge-purple">{participants.length}</span>
      </div>
      {participants.length === 0 ? (
        <span style={{ color: "rgba(88,77,102,0.72)", fontSize: 13 }}>Waiting...</span>
      ) : (
        <div className="flex flex-col gap-1.5">
          {participants.map((p) => (
            <div key={p.identity} className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl"
              style={{ background: "rgba(107,45,139,0.04)", border: "1px solid rgba(201,184,216,0.72)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "#c9b8d8", fontSize: 10, color: "#210b2c" }}>
                {p.identity.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: "#0a0a0f", fontSize: 13 }}>{p.identity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoGrid() {
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );
  return (
    <div style={{ height: 220, padding: 14, borderBottom: "1px solid rgba(201,184,216,0.72)", background: "#faf9fd", flexShrink: 0 }}>
      <div className="grid h-full" style={{
        gridTemplateColumns: cameraTracks.length > 1 ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)",
        gap: 12,
      }}>
        <TrackLoop tracks={cameraTracks.slice(0, 4)}>
          <ParticipantTile style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 16, border: "1px solid rgba(201,184,216,0.8)", background: "#210b2c" }} />
        </TrackLoop>
      </div>
    </div>
  );
}

function MediaControls({ generating, onGenerateSummary, onError }: {
  generating: boolean; onGenerateSummary: () => void; onError: (m: string) => void;
}) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  return (
    <div className="flex items-center justify-center gap-2 px-8"
      style={{ height: 56, border: "1px solid rgba(201,184,216,0.8)", borderTop: "1px solid rgba(201,184,216,0.72)", borderRadius: "0 0 20px 20px", background: "#ffffff", flexShrink: 0 }}>
      <button onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled).catch(() => onError("Mic error"))} className="fs-btn-ghost" style={{ fontSize: 12 }}>
        {isMicrophoneEnabled ? "Mute" : "Unmute"}
      </button>
      <button onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled).catch(() => onError("Camera error"))} className="fs-btn-ghost" style={{ fontSize: 12 }}>
        {isCameraEnabled ? "Camera off" : "Camera on"}
      </button>
      <button onClick={onGenerateSummary} disabled={generating} className="fs-btn-primary">
        {generating ? "Generating…" : "Generate insights"}
      </button>
    </div>
  );
}

function Meter({ label, value, color = "var(--gold)" }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{label}</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", color, fontSize: 11 }}>{Math.round(value)}</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "rgba(201,184,216,0.34)", overflow: "hidden" }}>
        <div className="score-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}

function BiasCard({ event }: { event: BiasEvent }) {
  const color = event.severity === "high" ? "var(--red)" : event.severity === "medium" ? "var(--gold)" : "var(--purple)";
  return (
    <div className="rounded-xl p-3 fade-in"
      style={{ background: event.severity === "high" ? "rgba(185,84,101,0.08)" : "rgba(247,217,196,0.22)", border: `1px solid ${event.severity === "high" ? "rgba(185,84,101,0.28)" : "rgba(242,165,142,0.4)"}` }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color, textTransform: "uppercase" }}>{labelize(event.bias_type)}</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--text-muted)", fontSize: 9 }}>{Math.round(event.confidence * 100)}%</span>
      </div>
      <div style={{ color: "var(--text-dim)", fontSize: 12, lineHeight: 1.45 }}>&ldquo;{event.flagged_text}&rdquo;</div>
      <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>{event.context_reason}</div>
      {event.alternative_phrasings[0] && (
        <div style={{ color: "var(--purple)", fontSize: 12, marginTop: 7, lineHeight: 1.45 }}>{event.alternative_phrasings[0]}</div>
      )}
    </div>
  );
}

function QuoteBoard({ quotes }: { quotes: QuoteEvent[] }) {
  if (!quotes.length) return <div style={{ color: "var(--text-muted)", fontSize: 12 }}>No high-signal quotes pinned yet.</div>;
  return (
    <div className="flex flex-col gap-2">
      {quotes.slice(0, 3).map((q, i) => (
        <div key={i} className="rounded-xl p-3" style={{ background: "rgba(107,45,139,0.04)", border: "1px solid rgba(201,184,216,0.72)" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "var(--gold)", textTransform: "uppercase", marginBottom: 5 }}>
            {labelize(q.signal_type)} · {q.speaker}
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: 12, lineHeight: 1.45 }}>&ldquo;{q.text}&rdquo;</div>
        </div>
      ))}
    </div>
  );
}

function IntelligencePanel({ state }: { state: LiveIntelligenceState }) {
  const activeIndex = PHASES.findIndex((p) => p.key === state.intent.phase);
  return (
    <div className="flex-1 overflow-y-auto px-5 py-5">
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <p className="fs-label">Live Intelligence</p>
        <span className="fs-badge fs-badge-neutral">{state.intent.momentum}</span>
      </div>
      <div className="flex flex-col gap-5">
        <section>
          <div className="flex items-center justify-between" style={{ marginBottom: 9 }}>
            <span style={{ color: "var(--text-dim)", fontSize: 13, fontWeight: 700 }}>{labelize(state.intent.phase)}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--text-muted)", fontSize: 10 }}>{pct(state.intent.confidence)}</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ marginBottom: 9 }}>
            {PHASES.map((phase, i) => (
              <div key={phase.key} title={phase.label} style={{ height: 7, flex: 1, borderRadius: 99, background: i <= activeIndex ? "var(--gold)" : "rgba(201,184,216,0.36)" }} />
            ))}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.45 }}>{state.intent.intent_signal}</p>
        </section>
        <section className="flex flex-col gap-3">
          <Meter label="Interview quality" value={state.quality_score} />
          <Meter label="Bias pressure" value={state.bias_pressure_score} color={state.bias_pressure_score > 55 ? "var(--red)" : "var(--purple)"} />
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 11 }}>Talk time founder / user</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--text-muted)", fontSize: 11 }}>
                {pct(state.talk_time.founder_ratio)} / {pct(state.talk_time.user_ratio)}
              </span>
            </div>
            <div style={{ height: 7, borderRadius: 99, display: "flex", overflow: "hidden", background: "rgba(201,184,216,0.34)" }}>
              <div style={{ width: pct(state.talk_time.founder_ratio), background: "var(--gold)" }} />
              <div style={{ flex: 1, background: "var(--purple)" }} />
            </div>
            {state.talk_time.alert && <p style={{ color: "var(--gold)", fontSize: 11, marginTop: 6 }}>{state.talk_time.alert}</p>}
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
            <p className="fs-label">Bias Nudges</p>
            <span className="fs-badge fs-badge-purple">{state.bias_events.length}</span>
          </div>
          <div className="flex flex-col gap-3">
            {state.bias_events.length === 0
              ? <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No bias detected</div>
              : state.bias_events.slice(0, 4).map((e, i) => <BiasCard key={i} event={e} />)}
          </div>
        </section>
        <section>
          <p className="fs-label" style={{ marginBottom: 10 }}>Next Questions</p>
          <div className="flex flex-col gap-2">
            {state.intent.recommended_questions.slice(0, 2).map((q, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: "rgba(107,45,139,0.06)", border: "1px solid rgba(107,45,139,0.14)", color: "var(--text-dim)", fontSize: 12, lineHeight: 1.45 }}>{q}</div>
            ))}
          </div>
        </section>
        <section>
          <p className="fs-label" style={{ marginBottom: 10 }}>Pinned Quotes</p>
          <QuoteBoard quotes={state.quotes} />
        </section>
      </div>
    </div>
  );
}

interface LiveRoomProps {
  connection: { serverUrl: string; roomName: string; participantToken: string };
  segments: Segment[];
  intelligence: LiveIntelligenceState;
  generating: boolean;
  browserFallbackEnabled: boolean;
  transcriptionStatus: string;
  onGenerateSummary: () => void;
  onError: (m: string) => void;
  onStartCaptions: () => void;
}

export default function LiveRoom({
  connection, segments, intelligence, generating,
  browserFallbackEnabled, transcriptionStatus,
  onGenerateSummary, onError, onStartCaptions,
}: LiveRoomProps) {
  return (
    <LiveKitRoom serverUrl={connection.serverUrl} token={connection.participantToken} connect audio video style={{ display: "contents" }}>
      <RoomAudioRenderer />
      <div className="flex flex-1 overflow-hidden" style={{ background: "#ffffff", borderLeft: "1px solid rgba(201,184,216,0.8)", borderRight: "1px solid rgba(201,184,216,0.8)" }}>
        <div className="flex-1 flex flex-col" style={{ borderRight: "1px solid rgba(201,184,216,0.72)" }}>
          <VideoGrid />
          <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: "1px solid rgba(201,184,216,0.72)", background: "rgba(88,77,102,0.06)", flexShrink: 0 }}>
            <span className="fs-label">Live Transcript</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>{segments.length} segments</span>
          </div>
          <div className="flex items-center justify-between px-6 py-2" style={{
            borderBottom: "1px solid rgba(201,184,216,0.55)",
            background: browserFallbackEnabled ? "rgba(247,217,196,0.28)" : "rgba(47,143,103,0.06)",
            color: browserFallbackEnabled ? "var(--gold)" : "var(--green)",
            fontSize: 11, flexShrink: 0,
          }}>
            <span>{transcriptionStatus}</span>
            {browserFallbackEnabled
              ? <span>Backup captions active</span>
              : <button onClick={onStartCaptions} className="fs-btn-ghost" style={{ fontSize: 11, padding: "4px 9px", borderColor: "rgba(47,143,103,0.24)", color: "var(--green)" }}>Start captions</button>}
          </div>
          <TranscriptFeed segments={segments} biasFlags={intelligence.bias_events} />
        </div>
        <div className="flex flex-col" style={{ width: 360, minWidth: 360, background: "#ffffff" }}>
          <ParticipantList />
          <IntelligencePanel state={intelligence} />
        </div>
      </div>
      <MediaControls generating={generating} onGenerateSummary={onGenerateSummary} onError={onError} />
    </LiveKitRoom>
  );
}
