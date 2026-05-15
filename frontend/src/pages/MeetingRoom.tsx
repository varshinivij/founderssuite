import { type CSSProperties, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { LiveKitRoom, ParticipantTile, RoomAudioRenderer, TrackLoop, useLocalParticipant, useParticipants, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { analyzeLiveIntelligence, fetchToken, fetchTranscript, saveMeetingContext, storeTranscript } from '../lib/api';
import type { BiasEvent, LiveIntelligenceState, MeetingContext, QuoteEvent, Segment } from '../lib/api';
import { createLocalIntelligence, mergeBiasEvents } from '../lib/interviewIntelligence';
import TranscriptFeed from '../components/meeting/TranscriptFeed';
import KnowledgeGraphPanel from '../components/knowledge/KnowledgeGraphPanel';
import BrandMark from '../components/layout/BrandMark';

interface ConnectionDetails { serverUrl: string; roomName: string; participantToken: string; }

interface BrowserSpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: { transcript: string };
    };
  };
}

interface BrowserSpeechRecognitionErrorEvent {
  error?: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
}

const pageTheme = {
  '--bg': '#faf9fd',
  '--surface-0': '#ffffff',
  '--surface-1': '#faf9fd',
  '--surface-2': '#f3edf7',
  '--border-subtle': 'rgba(201,184,216,0.72)',
  '--border-mid': 'rgba(201,184,216,0.9)',
  '--border-strong': '#6b2d8b',
  '--purple': '#6b2d8b',
  '--purple-dim': 'rgba(107,45,139,0.1)',
  '--gold': '#f2a58e',
  '--gold-dim': 'rgba(247,217,196,0.45)',
  '--red': '#b95465',
  '--green': '#2f8f67',
  '--text-1': '#210b2c',
  '--text-dim': '#0a0a0f',
  '--text-muted': 'rgba(88,77,102,0.72)',
} as CSSProperties;

const PHASES: Array<{ key: LiveIntelligenceState['intent']['phase']; label: string }> = [
  { key: 'rapport', label: 'Rapport' },
  { key: 'problem_exploration', label: 'Problem' },
  { key: 'solution_validation', label: 'Solution' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'closing', label: 'Close' },
];

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

function labelize(value: string) {
  return value.replace(/_/g, ' ');
}

function ParticipantList() {
  const participants = useParticipants();
  return (
    <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="fs-label">Participants</p>
        <span className="fs-badge fs-badge-purple">{participants.length}</span>
      </div>
      {participants.length === 0 ? (
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Waiting...</span>
      ) : (
        <div className="flex flex-col gap-1.5">
          {participants.map(p => (
            <div key={p.identity} className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl" style={{ background: 'rgba(107,45,139,0.04)', border: '1px solid var(--border-subtle)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#c9b8d8', fontSize: 10, color: '#210b2c' }}>
                {p.identity.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{p.identity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoGrid() {
  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], { onlySubscribed: false });
  return (
    <div
      style={{
        height: 220,
        padding: 14,
        borderBottom: '1px solid rgba(201,184,216,0.72)',
        background: '#faf9fd',
        flexShrink: 0,
      }}
    >
      <div
        className="grid h-full"
        style={{
          gridTemplateColumns: cameraTracks.length > 1 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
          gap: 12,
        }}
      >
        <TrackLoop tracks={cameraTracks.slice(0, 4)}>
          <ParticipantTile
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              borderRadius: 16,
              border: '1px solid rgba(201,184,216,0.8)',
              background: '#210b2c',
            }}
          />
        </TrackLoop>
      </div>
    </div>
  );
}

function MediaControls({
  onOpenAnalysis,
  onError,
}: {
  onOpenAnalysis: () => void;
  onError: (message: string) => void;
}) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();

  async function toggleMicrophone() {
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch {
      onError('Could not update microphone permission.');
    }
  }

  async function toggleCamera() {
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch {
      onError('Could not update camera permission.');
    }
  }

  return (
    <div
      className="flex items-center justify-center gap-2 px-8"
      style={{
        height: 56,
        border: '1px solid rgba(201,184,216,0.8)',
        borderTop: '1px solid rgba(201,184,216,0.72)',
        borderRadius: '0 0 20px 20px',
        background: '#ffffff',
        flexShrink: 0,
      }}
    >
      <button onClick={toggleMicrophone} className="fs-btn-ghost" style={{ fontSize: 12 }}>
        {isMicrophoneEnabled ? 'Mute' : 'Unmute'}
      </button>
      <button onClick={toggleCamera} className="fs-btn-ghost" style={{ fontSize: 12 }}>
        {isCameraEnabled ? 'Camera off' : 'Camera on'}
      </button>
      <button
        onClick={onOpenAnalysis}
        className="fs-btn-primary"
      >
        Open analysis
      </button>
    </div>
  );
}

function BrowserTranscriptFallback({
  roomName,
  enabled,
  onSegment,
  onStatus,
}: {
  roomName: string;
  enabled: boolean;
  onSegment: (segment: Segment) => void;
  onStatus: (status: string) => void;
}) {
  const lastStoredRef = useRef('');
  const runningRef = useRef(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    if (!enabled) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      runningRef.current = false;
      return;
    }

    const speechWindow = window as SpeechRecognitionWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      onStatus('Browser transcription is not available here. Start the Deepgram agent to transcribe.');
      return;
    }

    let cancelled = false;
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = event => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result.isFinal || !result[0]?.transcript) continue;
        const text = result[0].transcript.trim();
        if (!text || text === lastStoredRef.current) continue;
        lastStoredRef.current = text;
        const segment = { speaker: 'founder', text, timestamp_ms: Date.now() };
        onSegment(segment);
        storeTranscript(roomName, 'founder', text).catch(() => {
          onStatus('Could not save the browser transcript segment.');
        });
      }
    };

    recognition.onerror = event => {
      if (event.error === 'no-speech') return;
      onStatus('Browser transcription paused. Check microphone permission and keep the meeting tab active.');
    };

    recognition.onend = () => {
      runningRef.current = false;
      if (!cancelled) {
        window.setTimeout(() => {
          if (!cancelled && recognitionRef.current === recognition) {
            try {
              recognition.start();
              runningRef.current = true;
              onStatus('Listening for speech.');
            } catch {
              onStatus('Browser transcription could not restart.');
            }
          }
        }, 500);
      }
    };

    try {
      recognition.start();
      runningRef.current = true;
      onStatus('Listening for speech.');
    } catch {
      onStatus('Browser transcription could not start.');
    }

    return () => {
      cancelled = true;
      recognition.onend = null;
      recognition.stop();
      runningRef.current = false;
    };
  }, [enabled, onSegment, onStatus, roomName]);

  return null;
}

function Meter({ label, value, color = 'var(--gold)' }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{label}</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", color, fontSize: 11 }}>{Math.round(value)}</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'rgba(201,184,216,0.34)', overflow: 'hidden' }}>
        <div className="score-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', background: color }} />
      </div>
    </div>
  );
}

function BiasHeatmap({ events }: { events: BiasEvent[] }) {
  const types: BiasEvent['bias_type'][] = ['leading', 'confirmation', 'anchoring', 'assumption', 'social_desirability', 'false_dichotomy'];
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
      {types.map(type => {
        const count = events.filter(event => event.bias_type === type).length;
        const opacity = Math.min(0.78, 0.08 + count * 0.18);
        return (
          <div
            key={type}
            title={`${labelize(type)}: ${count}`}
            style={{
              aspectRatio: '1',
              borderRadius: 5,
              background: `rgba(255,94,109,${opacity})`,
              border: '1px solid var(--border-subtle)',
            }}
          />
        );
      })}
    </div>
  );
}

function BiasCard({ event }: { event: BiasEvent }) {
  const color = event.severity === 'high' ? 'var(--red)' : event.severity === 'medium' ? 'var(--gold)' : 'var(--purple)';
  return (
    <div
      className="rounded-xl p-3 fade-in"
      style={{
        background: event.severity === 'high' ? 'rgba(185,84,101,0.08)' : 'rgba(247,217,196,0.22)',
        border: `1px solid ${event.severity === 'high' ? 'rgba(185,84,101,0.28)' : 'rgba(242,165,142,0.4)'}`,
        animation: event.severity === 'high' ? 'glow-pulse 1.6s ease-in-out infinite' : undefined,
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color, textTransform: 'uppercase' }}>
          {labelize(event.bias_type)}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-muted)', fontSize: 9 }}>
          {Math.round(event.confidence * 100)}%
        </span>
      </div>
      <div style={{ color: 'var(--text-dim)', fontSize: 12, lineHeight: 1.45 }}>"{event.flagged_text}"</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>{event.context_reason}</div>
      {event.alternative_phrasings[0] && (
        <div style={{ color: 'var(--purple)', fontSize: 12, marginTop: 7, lineHeight: 1.45 }}>
          {event.alternative_phrasings[0]}
        </div>
      )}
    </div>
  );
}

function QuoteBoard({ quotes }: { quotes: QuoteEvent[] }) {
  if (!quotes.length) {
    return <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No high-signal quotes pinned yet.</div>;
  }
  return (
    <div className="flex flex-col gap-2">
      {quotes.slice(0, 3).map((quote, i) => (
        <div key={`${quote.text}-${i}`} className="rounded-xl p-3" style={{ background: 'rgba(107,45,139,0.04)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 5 }}>
            {labelize(quote.signal_type)} · {quote.speaker}
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: 12, lineHeight: 1.45 }}>"{quote.text}"</div>
        </div>
      ))}
    </div>
  );
}

function IntelligencePanel({ state }: { state: LiveIntelligenceState }) {
  const activeIndex = PHASES.findIndex(phase => phase.key === state.intent.phase);
  return (
    <div className="flex-1 overflow-y-auto px-5 py-5">
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <p className="fs-label">Live Intelligence</p>
        <span className="fs-badge fs-badge-neutral">{state.intent.momentum}</span>
      </div>

      <div className="flex flex-col gap-5">
        <section>
          <div className="flex items-center justify-between" style={{ marginBottom: 9 }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 13, fontWeight: 700 }}>{labelize(state.intent.phase)}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-muted)', fontSize: 10 }}>{pct(state.intent.confidence)}</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ marginBottom: 9 }}>
            {PHASES.map((phase, i) => (
              <div
                key={phase.key}
                title={phase.label}
                style={{
                  height: 7,
                  flex: 1,
                  borderRadius: 99,
                  background: i <= activeIndex ? 'var(--gold)' : 'rgba(201,184,216,0.36)',
                }}
              />
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.45 }}>{state.intent.intent_signal}</p>
        </section>

        <section className="flex flex-col gap-3">
          <Meter label="Interview quality" value={state.quality_score} />
          <Meter label="Bias pressure" value={state.bias_pressure_score} color={state.bias_pressure_score > 55 ? 'var(--red)' : 'var(--purple)'} />
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Talk time founder / user</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-muted)', fontSize: 11 }}>
                {pct(state.talk_time.founder_ratio)} / {pct(state.talk_time.user_ratio)}
              </span>
            </div>
            <div style={{ height: 7, borderRadius: 99, display: 'flex', overflow: 'hidden', background: 'rgba(201,184,216,0.34)' }}>
              <div style={{ width: pct(state.talk_time.founder_ratio), background: 'var(--gold)' }} />
              <div style={{ flex: 1, background: 'var(--purple)' }} />
            </div>
            {state.talk_time.alert && <p style={{ color: 'var(--gold)', fontSize: 11, marginTop: 6 }}>{state.talk_time.alert}</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
            <p className="fs-label">Bias Nudges</p>
            <span className="fs-badge fs-badge-purple">{state.bias_events.length}</span>
          </div>
          <BiasHeatmap events={state.bias_events} />
          <div className="flex flex-col gap-3" style={{ marginTop: 12 }}>
            {state.bias_events.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No bias detected</div>
            ) : (
              state.bias_events.slice(0, 4).map((event, i) => <BiasCard key={`${event.flagged_text}-${i}`} event={event} />)
            )}
          </div>
        </section>

        <section>
          <p className="fs-label" style={{ marginBottom: 10 }}>Next Questions</p>
          <div className="flex flex-col gap-2">
            {state.intent.recommended_questions.slice(0, 2).map((question, i) => (
              <div key={`${question}-${i}`} className="rounded-xl p-3" style={{ background: 'rgba(107,45,139,0.06)', border: '1px solid rgba(107,45,139,0.14)', color: 'var(--text-dim)', fontSize: 12, lineHeight: 1.45 }}>
                {question}
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="fs-label" style={{ marginBottom: 10 }}>Topic Drift</p>
          <div className="rounded-xl p-3" style={{ background: 'rgba(107,45,139,0.04)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: state.topic_drift.drifting ? 'var(--gold)' : 'var(--text-dim)', fontSize: 12, marginBottom: 5 }}>
              {state.topic_drift.drifting ? 'Drifting' : 'On track'}{state.topic_drift.current_topic ? ` · ${state.topic_drift.current_topic}` : ''}
            </div>
            {state.topic_drift.redirect_question && (
              <div style={{ color: 'var(--purple)', fontSize: 12, lineHeight: 1.45 }}>{state.topic_drift.redirect_question}</div>
            )}
          </div>
        </section>

        <section>
          <p className="fs-label" style={{ marginBottom: 10 }}>Pinned Quotes</p>
          <QuoteBoard quotes={state.quotes} />
        </section>

        {!!state.degraded?.length && (
          <section style={{ color: 'var(--text-muted)', fontSize: 11, lineHeight: 1.45 }}>
            Degraded: {state.degraded.join(', ')}
          </section>
        )}
      </div>
    </div>
  );
}

export default function MeetingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [connection, setConnection] = useState<ConnectionDetails | null>(null);
  const [connected, setConnected] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [serverIntelligence, setServerIntelligence] = useState<LiveIntelligenceState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcriptionStatus, setTranscriptionStatus] = useState('Waiting for speech');
  const [browserFallbackEnabled, setBrowserFallbackEnabled] = useState(false);
  const [meetingContext, setMeetingContext] = useState<MeetingContext>({
    objective: 'Understand the current workflow and biggest pain points.',
    target_customer: '',
    hypothesis: '',
    success_criteria: '',
    avoid_topics: '',
    notes: '',
  });
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const analyzingRef = useRef(false);
  const lastBackendAtRef = useRef(0);
  const lastAnalyzedCountRef = useRef(0);

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
      quotes: [...serverIntelligence.quotes, ...localIntelligence.quotes]
        .filter((quote, index, all) => all.findIndex(other => other.text === quote.text) === index)
        .slice(0, 5),
      degraded: [...(serverIntelligence.degraded ?? []), ...(localIntelligence.degraded ?? [])],
    };
  }, [localIntelligence, serverIntelligence]);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const details = await fetchToken(roomId);
      await saveMeetingContext(details.roomName, meetingContext);
      setConnection(details);
      setConnected(true);
      const initial = await fetchTranscript(details.roomName);
      setSegments(initial.segments);
      setBrowserFallbackEnabled(false);
      setTranscriptionStatus('Waiting for speech');
      const interval = setInterval(async () => {
        const { segments: s } = await fetchTranscript(details.roomName);
        setSegments(s);
      }, 3000);
      setPollInterval(interval);
    } catch {
      setError('Failed to connect — is the API server running on localhost:8000?');
    }
  }, [meetingContext, roomId]);

  useEffect(() => () => { if (pollInterval) clearInterval(pollInterval); }, [pollInterval]);

  useEffect(() => {
    if (!connected || segments.length > 0 || browserFallbackEnabled) return;
    const timeout = window.setTimeout(() => {
      setBrowserFallbackEnabled(true);
      setTranscriptionStatus('Starting browser transcription fallback.');
    }, 7000);
    return () => window.clearTimeout(timeout);
  }, [browserFallbackEnabled, connected, segments.length]);

  useEffect(() => {
    if (!connected || !connection || segments.length === 0 || analyzingRef.current) return;
    const now = Date.now();
    const enoughTimePassed = now - lastBackendAtRef.current >= 30000;
    const hasNewSegments = segments.length !== lastAnalyzedCountRef.current;
    const shouldAnalyze = hasNewSegments && (enoughTimePassed || lastAnalyzedCountRef.current === 0);
    if (!shouldAnalyze) return;

    analyzingRef.current = true;
    lastBackendAtRef.current = now;
    lastAnalyzedCountRef.current = segments.length;
    analyzeLiveIntelligence(connection.roomName)
      .then(setServerIntelligence)
      .catch(() => {
        setServerIntelligence(current => current ? { ...current, degraded: [...(current.degraded ?? []), 'live_intelligence_api_unavailable'] } : current);
      })
      .finally(() => {
        analyzingRef.current = false;
      });
  }, [connected, connection, segments.length]);

  const handleOpenAnalysis = () => {
    if (!connection) return;
    navigate(`/analysis/${connection.roomName}`);
  };

  const handleLeave = () => {
    if (pollInterval) clearInterval(pollInterval);
    setConnected(false);
    setConnection(null);
    setServerIntelligence(null);
    setSegments([]);
    setBrowserFallbackEnabled(false);
    setTranscriptionStatus('Waiting for speech');
    lastBackendAtRef.current = 0;
    lastAnalyzedCountRef.current = 0;
  };

  const handleBrowserTranscriptSegment = useCallback((segment: Segment) => {
    setSegments(current => {
      if (current.some(existing => existing.text === segment.text && existing.speaker === segment.speaker)) {
        return current;
      }
      return [...current, segment];
    });
  }, []);

  const handleStartCaptions = useCallback(() => {
    setBrowserFallbackEnabled(true);
    setTranscriptionStatus('Starting browser transcription fallback.');
  }, []);

  const updateMeetingContext = useCallback((key: keyof MeetingContext, value: string) => {
    setMeetingContext(current => ({ ...current, [key]: value }));
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ ...pageTheme, background: '#faf9fd', padding: connected ? 24 : 0 }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-8 py-0"
        style={{
          background: '#ffffff',
          border: connected ? '1px solid rgba(201,184,216,0.8)' : 'none',
          borderBottom: connected ? '1px solid rgba(201,184,216,0.8)' : '1px solid rgba(201,184,216,0.5)',
          borderRadius: connected ? '20px 20px 0 0' : 0,
          height: 72,
          flexShrink: 0,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: connected ? '#2f8f67' : 'rgba(88,77,102,0.24)',
            }}
          />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 15, color: 'var(--text-1)' }}>
            {connected ? 'Live Interview' : roomId ?? 'Interview Room'}
          </span>
          {connected && (
            <span className="fs-badge fs-badge-purple">Live</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {connected && (
            <>
              <button
                onClick={handleOpenAnalysis}
                disabled={segments.length === 0}
                className="fs-btn-primary"
              >
                Open analysis
              </button>
              <button onClick={handleLeave} className="fs-btn-ghost">Leave</button>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-3 px-4 py-3 rounded-xl fade-in" style={{ background: 'rgba(185,84,101,0.08)', border: '1px solid rgba(185,84,101,0.24)', color: 'var(--red)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {!connected ? (
        /* Join screen */
        <div className="flex-1 flex items-center justify-center" style={{ background: '#faf9fd' }}>
          <div style={{ width: 'min(920px, calc(100vw - 48px))' }}>
            <div className="flex justify-center" style={{ marginBottom: 20 }}>
              <BrandMark size={70} fontSize={30} />
            </div>
            <div className="text-center" style={{ marginBottom: 22 }}>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 30,
                color: 'var(--text-1)',
                marginBottom: 10,
              }}>
                Set up the interview
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.55 }}>
                Define what you are trying to learn before the live coaching starts.
              </p>
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 12,
                background: '#ffffff',
                border: '1px solid rgba(201,184,216,0.8)',
                borderRadius: 18,
                padding: 16,
                boxShadow: '0 16px 44px rgba(33,11,44,0.07)',
              }}
            >
              {[
                { key: 'objective', label: 'Objective', placeholder: 'What should this interview teach you?' },
                { key: 'target_customer', label: 'Target customer', placeholder: 'Who are you interviewing?' },
                { key: 'hypothesis', label: 'Hypothesis', placeholder: 'What belief are you testing?' },
                { key: 'success_criteria', label: 'Success criteria', placeholder: 'What would count as a strong signal?' },
                { key: 'avoid_topics', label: 'Avoid topics', placeholder: 'What should the conversation avoid?' },
                { key: 'notes', label: 'Context notes', placeholder: 'Product, market, or workflow context.' },
              ].map(field => (
                <label key={field.key} className="flex flex-col gap-2">
                  <span className="fs-label">{field.label}</span>
                  <textarea
                    value={meetingContext[field.key as keyof MeetingContext]}
                    onChange={event => updateMeetingContext(field.key as keyof MeetingContext, event.target.value)}
                    placeholder={field.placeholder}
                    rows={2}
                    style={{
                      resize: 'none',
                      border: '1px solid rgba(201,184,216,0.85)',
                      borderRadius: 12,
                      padding: '10px 12px',
                      minHeight: 58,
                      color: 'var(--text-dim)',
                      background: '#faf9fd',
                      fontSize: 13,
                      lineHeight: 1.35,
                    }}
                  />
                </label>
              ))}
              <div className="flex items-center justify-between" style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  This context guides bias detection, topic drift, and post-interview insights.
                </span>
                <button onClick={connect} className="fs-btn-primary" style={{ fontSize: 15, padding: '12px 30px', borderRadius: 12 }}>
                  Join Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Connected */
        connection && (
          <LiveKitRoom
            serverUrl={connection.serverUrl}
            token={connection.participantToken}
            connect={true}
            audio={true}
            video={true}
            style={{ display: 'contents' }}
          >
            <RoomAudioRenderer />

            <div className="flex flex-1 overflow-hidden" style={{ background: '#ffffff', borderLeft: '1px solid rgba(201,184,216,0.8)', borderRight: '1px solid rgba(201,184,216,0.8)' }}>
              {/* Transcript column */}
              <div className="flex-1 flex flex-col" style={{ borderRight: '1px solid rgba(201,184,216,0.72)' }}>
                <VideoGrid />
                <div
                  className="flex items-center justify-between px-6 py-3"
                  style={{ borderBottom: '1px solid rgba(201,184,216,0.72)', background: 'rgba(88,77,102,0.06)', flexShrink: 0 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="fs-label">Live Transcript</span>
                  </div>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                    {segments.length} segments
                  </span>
                </div>
                <div
                  className="flex items-center justify-between px-6 py-2"
                  style={{
                    borderBottom: '1px solid rgba(201,184,216,0.55)',
                    background: browserFallbackEnabled ? 'rgba(247,217,196,0.28)' : 'rgba(47,143,103,0.06)',
                    color: browserFallbackEnabled ? 'var(--gold)' : 'var(--green)',
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  <span>{transcriptionStatus}</span>
                  {browserFallbackEnabled ? (
                    <span>Backup captions active</span>
                  ) : (
                    <button
                      onClick={handleStartCaptions}
                      className="fs-btn-ghost"
                      style={{ fontSize: 11, padding: '4px 9px', borderColor: 'rgba(47,143,103,0.24)', color: 'var(--green)' }}
                    >
                      Start captions
                    </button>
                  )}
                </div>
                <TranscriptFeed segments={segments} biasFlags={intelligence.bias_events} />
              </div>

              {/* Right panel */}
              <div className="flex flex-col" style={{ width: 360, minWidth: 360, background: 'var(--surface-0)' }}>
                <ParticipantList />
                <div style={{ height: 320, padding: 10, borderBottom: '1px solid rgba(201,184,216,0.72)' }}>
                  <KnowledgeGraphPanel compact title="Interview Graph" activeNodeId={meetingContext.target_customer || undefined} />
                </div>
                <IntelligencePanel state={intelligence} />
              </div>
            </div>

            <MediaControls
              onOpenAnalysis={handleOpenAnalysis}
              onError={setError}
            />
            <BrowserTranscriptFallback
              roomName={connection.roomName}
              enabled={browserFallbackEnabled}
              onSegment={handleBrowserTranscriptSegment}
              onStatus={setTranscriptionStatus}
            />
          </LiveKitRoom>
        )
      )}
    </div>
  );
}
