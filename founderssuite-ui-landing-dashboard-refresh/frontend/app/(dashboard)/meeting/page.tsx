"use client";

import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { analyzeLiveIntelligence, fetchToken, fetchTranscript, generateSummary, saveMeetingContext, storeTranscript } from "@/lib/interviewApi";
import type { MeetingContext } from "@/lib/interviewApi";
import { createLocalIntelligence, mergeBiasEvents } from "@/lib/interviewIntelligence";
import { useAuth } from "@/hooks/useAuth";
import type { LiveIntelligenceState, Segment } from "@/lib/interviewIntelligence";

// LiveKit (~500 kB) deferred until after the user clicks "Join Meeting"
const LiveRoom = dynamic(() => import("@/components/meeting/LiveRoom"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-[#8b5cf6] border-t-transparent animate-spin" />
    </div>
  ),
});

interface BrowserSpeechRecognition {
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((e: { resultIndex: number; results: { length: number; [i: number]: { isFinal: boolean; length: number; [j: number]: { transcript: string } } } }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void;
}

const pageTheme = {
  "--bg": "#faf9fd", "--surface-0": "#ffffff", "--border-subtle": "rgba(201,184,216,0.72)",
  "--purple": "#6b2d8b", "--gold": "#f2a58e", "--red": "#b95465", "--green": "#2f8f67",
  "--text-1": "#210b2c", "--text-dim": "#0a0a0f", "--text-muted": "rgba(88,77,102,0.72)",
} as CSSProperties;

function BrowserTranscriptFallback({ roomName, enabled, onSegment, onStatus }: {
  roomName: string; enabled: boolean;
  onSegment: (s: Segment) => void; onStatus: (s: string) => void;
}) {
  const lastRef = useRef(""); const recRef = useRef<BrowserSpeechRecognition | null>(null);
  useEffect(() => {
    if (!enabled) { recRef.current?.stop(); recRef.current = null; return; }
    const win = window as Window & { SpeechRecognition?: new () => BrowserSpeechRecognition; webkitSpeechRecognition?: new () => BrowserSpeechRecognition };
    const Rec = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!Rec) { onStatus("Browser transcription unavailable. Start the Deepgram agent."); return; }
    let cancelled = false;
    const rec = new Rec();
    rec.continuous = true; rec.interimResults = false; rec.lang = "en-US";
    recRef.current = rec;
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (!r.isFinal || !r[0]?.transcript) continue;
        const text = r[0].transcript.trim();
        if (!text || text === lastRef.current) continue;
        lastRef.current = text;
        const seg = { speaker: "founder", text, timestamp_ms: Date.now() };
        onSegment(seg);
        storeTranscript(roomName, "founder", text).catch(() => onStatus("Could not save transcript segment."));
      }
    };
    rec.onerror = (e) => { if (e.error !== "no-speech") onStatus("Browser transcription paused."); };
    rec.onend = () => { if (!cancelled) window.setTimeout(() => { if (!cancelled) { try { rec.start(); onStatus("Listening."); } catch { onStatus("Transcription could not restart."); } } }, 500); };
    try { rec.start(); onStatus("Listening for speech."); } catch { onStatus("Transcription could not start."); }
    return () => { cancelled = true; rec.onend = null; rec.stop(); };
  }, [enabled, onSegment, onStatus, roomName]);
  return null;
}

export default function MeetingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room") ?? undefined;
  const { user } = useAuth();

  const [connection, setConnection] = useState<{ serverUrl: string; roomName: string; participantToken: string } | null>(null);
  const [connected, setConnected] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [serverIntelligence, setServerIntelligence] = useState<LiveIntelligenceState | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptionStatus, setTranscriptionStatus] = useState("Waiting for speech");
  const [browserFallbackEnabled, setBrowserFallbackEnabled] = useState(false);
  const [meetingContext, setMeetingContext] = useState<MeetingContext>({
    objective: "Understand the current workflow and biggest pain points.",
    target_customer: "", hypothesis: "", success_criteria: "", avoid_topics: "", notes: "",
  });
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const analyzingRef = useRef(false);
  const lastBackendAtRef = useRef(0);
  const lastCountRef = useRef(0);

  const localIntelligence = useMemo(() => createLocalIntelligence(segments), [segments]);
  const intelligence = useMemo<LiveIntelligenceState>(() => {
    if (!serverIntelligence) return localIntelligence;
    return {
      ...serverIntelligence,
      bias_events: mergeBiasEvents(localIntelligence.bias_events, serverIntelligence.bias_events),
      talk_time: localIntelligence.talk_time,
      quality_score: Math.max(localIntelligence.quality_score, serverIntelligence.quality_score),
      bias_pressure_score: Math.max(localIntelligence.bias_pressure_score, serverIntelligence.bias_pressure_score),
      topic_drift: serverIntelligence.topic_drift.drifting ? serverIntelligence.topic_drift : localIntelligence.topic_drift,
      quotes: [...serverIntelligence.quotes, ...localIntelligence.quotes].filter((q, i, a) => a.findIndex((o) => o.text === q.text) === i).slice(0, 5),
      degraded: [...(serverIntelligence.degraded ?? []), ...(localIntelligence.degraded ?? [])],
    };
  }, [localIntelligence, serverIntelligence]);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const details = await fetchToken(roomId, "user", user?.id);
      await saveMeetingContext(details.roomName, meetingContext);
      setConnection(details);
      setConnected(true);
      const initial = await fetchTranscript(details.roomName);
      setSegments(initial.segments);
      setBrowserFallbackEnabled(false);
      setTranscriptionStatus("Waiting for speech");
      const iv = setInterval(async () => { const { segments: s } = await fetchTranscript(details.roomName); setSegments(s); }, 3000);
      setPollInterval(iv);
    } catch { setError("Failed to connect — is the API server running on localhost:8000?"); }
  }, [meetingContext, roomId]);

  useEffect(() => () => { if (pollInterval) clearInterval(pollInterval); }, [pollInterval]);

  useEffect(() => {
    if (!connected || segments.length > 0 || browserFallbackEnabled) return;
    const t = window.setTimeout(() => { setBrowserFallbackEnabled(true); setTranscriptionStatus("Starting browser transcription fallback."); }, 7000);
    return () => window.clearTimeout(t);
  }, [browserFallbackEnabled, connected, segments.length]);

  useEffect(() => {
    if (!connected || !connection || segments.length === 0 || analyzingRef.current) return;
    const now = Date.now();
    const shouldAnalyze = segments.length !== lastCountRef.current && (now - lastBackendAtRef.current >= 30000 || lastCountRef.current === 0);
    if (!shouldAnalyze) return;
    analyzingRef.current = true; lastBackendAtRef.current = now; lastCountRef.current = segments.length;
    analyzeLiveIntelligence(connection.roomName).then(setServerIntelligence).catch(() => {}).finally(() => { analyzingRef.current = false; });
  }, [connected, connection, segments.length]);

  const handleGenerateSummary = async () => {
    if (!connection) return;
    setGenerating(true);
    try { await generateSummary(connection.roomName); router.push(`/insights?room=${encodeURIComponent(connection.roomName)}`); }
    catch { setError("Summary generation failed"); }
    finally { setGenerating(false); }
  };

  const handleLeave = () => {
    if (pollInterval) clearInterval(pollInterval);
    setConnected(false); setConnection(null); setServerIntelligence(null);
    setSegments([]); setBrowserFallbackEnabled(false); setTranscriptionStatus("Waiting for speech");
    lastBackendAtRef.current = 0; lastCountRef.current = 0;
  };

  const handleBrowserSegment = useCallback((seg: Segment) => {
    setSegments((curr) => curr.some((e) => e.text === seg.text && e.speaker === seg.speaker) ? curr : [...curr, seg]);
  }, []);

  const handleStartCaptions = useCallback(() => { setBrowserFallbackEnabled(true); setTranscriptionStatus("Starting browser transcription fallback."); }, []);
  const updateCtx = useCallback((key: keyof MeetingContext, value: string) => { setMeetingContext((c) => ({ ...c, [key]: value })); }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ ...pageTheme, background: "#faf9fd", padding: connected ? 24 : 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-8" style={{ background: "#ffffff", border: connected ? "1px solid rgba(201,184,216,0.8)" : "none", borderBottom: "1px solid rgba(201,184,216,0.5)", borderRadius: connected ? "20px 20px 0 0" : 0, height: 72, flexShrink: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: connected ? "#2f8f67" : "rgba(88,77,102,0.24)" }} />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 15, color: "var(--text-1)" }}>
            {connected ? "Live Interview" : roomId ?? "Interview Room"}
          </span>
          {connected && <span className="fs-badge fs-badge-purple">Live</span>}
        </div>
        {connected && (
          <div className="flex items-center gap-2">
            <button onClick={handleGenerateSummary} disabled={generating || segments.length === 0} className="fs-btn-primary">
              {generating ? "Generating…" : "Generate insights"}
            </button>
            <button onClick={handleLeave} className="fs-btn-ghost">Leave</button>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-6 mt-3 px-4 py-3 rounded-xl fade-in" style={{ background: "rgba(185,84,101,0.08)", border: "1px solid rgba(185,84,101,0.24)", color: "var(--red)", fontSize: 13 }}>
          {error}
        </div>
      )}

      {!connected ? (
        /* Join screen */
        <div className="flex-1 flex items-center justify-center" style={{ background: "#faf9fd" }}>
          <div style={{ width: "min(920px, calc(100vw - 48px))" }}>
            <div className="flex items-center justify-center mx-auto rounded-3xl" style={{ width: 70, height: 70, background: "rgba(201,184,216,0.45)", border: "1px solid rgba(201,184,216,0.9)", fontSize: 28, color: "#210b2c", marginBottom: 20 }}>FS</div>
            <div className="text-center" style={{ marginBottom: 22 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 30, color: "var(--text-1)", marginBottom: 10 }}>Set up the interview</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.55 }}>Define what you are trying to learn before the live coaching starts.</p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, background: "#ffffff", border: "1px solid rgba(201,184,216,0.8)", borderRadius: 18, padding: 16, boxShadow: "0 16px 44px rgba(33,11,44,0.07)" }}>
              {[
                { key: "objective", label: "Objective", placeholder: "What should this interview teach you?" },
                { key: "target_customer", label: "Target customer", placeholder: "Who are you interviewing?" },
                { key: "hypothesis", label: "Hypothesis", placeholder: "What belief are you testing?" },
                { key: "success_criteria", label: "Success criteria", placeholder: "What would count as a strong signal?" },
                { key: "avoid_topics", label: "Avoid topics", placeholder: "What should the conversation avoid?" },
                { key: "notes", label: "Context notes", placeholder: "Product, market, or workflow context." },
              ].map((field) => (
                <label key={field.key} className="flex flex-col gap-2">
                  <span className="fs-label">{field.label}</span>
                  <textarea value={meetingContext[field.key as keyof MeetingContext]} onChange={(e) => updateCtx(field.key as keyof MeetingContext, e.target.value)} placeholder={field.placeholder} rows={2}
                    style={{ resize: "none", border: "1px solid rgba(201,184,216,0.85)", borderRadius: 12, padding: "10px 12px", minHeight: 58, color: "var(--text-dim)", background: "#faf9fd", fontSize: 13, lineHeight: 1.35 }} />
                </label>
              ))}
              <div className="flex items-center justify-between" style={{ gridColumn: "1 / -1", marginTop: 4 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>This context guides bias detection, topic drift, and post-interview insights.</span>
                <button onClick={connect} className="fs-btn-primary" style={{ fontSize: 15, padding: "12px 30px", borderRadius: 12 }}>Join Meeting</button>
              </div>
            </div>
          </div>
        </div>
      ) : connection && (
        <>
          <LiveRoom
            connection={connection}
            segments={segments}
            intelligence={intelligence}
            generating={generating}
            browserFallbackEnabled={browserFallbackEnabled}
            transcriptionStatus={transcriptionStatus}
            onGenerateSummary={handleGenerateSummary}
            onError={setError}
            onStartCaptions={handleStartCaptions}
          />
          <BrowserTranscriptFallback
            roomName={connection.roomName}
            enabled={browserFallbackEnabled}
            onSegment={handleBrowserSegment}
            onStatus={setTranscriptionStatus}
          />
        </>
      )}
    </div>
  );
}
