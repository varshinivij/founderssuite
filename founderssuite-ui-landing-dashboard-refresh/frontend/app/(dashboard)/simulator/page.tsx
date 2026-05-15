"use client";

import { type CSSProperties, type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  generateSummary,
  sendSimulationTurn,
  startSimulation,
} from "@/lib/interviewApi";
import type { LiveIntelligenceState, Segment } from "@/lib/interviewIntelligence";
import { SIMULATION_PERSONAS, type AIAgent } from "@/lib/personas";

const pageTheme = {
  "--bg": "#faf9fd",
  "--surface-0": "#ffffff",
  "--surface-1": "#faf9fd",
  "--surface-2": "#f3edf7",
  "--border-subtle": "rgba(201,184,216,0.72)",
  "--border-mid": "rgba(201,184,216,0.9)",
  "--border-strong": "#6b2d8b",
  "--purple": "#6b2d8b",
  "--purple-dim": "rgba(107,45,139,0.1)",
  "--gold": "#f2a58e",
  "--gold-dim": "rgba(247,217,196,0.45)",
  "--red": "#b95465",
  "--green": "#2f8f67",
  "--text-1": "#210b2c",
  "--text-dim": "#0a0a0f",
  "--text-muted": "rgba(88,77,102,0.72)",
} as CSSProperties;

const EMPTY_INTELLIGENCE: LiveIntelligenceState = {
  intent: {
    phase: "rapport",
    confidence: 0.2,
    intent_signal: "Choose a tester and start asking questions.",
    recommended_questions: [
      "Can you walk me through the last time this problem came up?",
      "What are you doing today to work around it?",
    ],
    momentum: "opening",
  },
  bias_events: [],
  bias_pressure_score: 0,
  quality_score: 50,
  talk_time: { founder_ratio: 0, user_ratio: 0, alert: null },
  topic_drift: { drifting: false, current_topic: null, redirect_question: null },
  quotes: [],
  analyzed_segment_count: 0,
  generated_at: new Date().toISOString(),
  degraded: [],
};

function labelize(value: string) {
  return value.replace(/_/g, " ");
}

function PersonaCard({
  persona,
  active,
  onSelect,
}: {
  persona: AIAgent;
  active: boolean;
  onSelect: (persona: AIAgent) => void;
}) {
  return (
    <button
      onClick={() => onSelect(persona)}
      className="text-left"
      style={{
        background: active ? "rgba(201,184,216,0.34)" : "rgba(107,45,139,0.035)",
        border: `1px solid ${active ? "#6b2d8b" : "rgba(201,184,216,0.72)"}`,
        borderRadius: 14,
        padding: 12,
        cursor: "pointer",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: "#c9b8d8",
              color: "#210b2c",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            {persona.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 13,
                color: "#0a0a0f",
              }}
            >
              {persona.name}
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: "#6b2d8b",
                marginTop: 3,
              }}
            >
              {persona.matchScore}% MATCH
            </div>
          </div>
        </div>
        <span
          className="fs-badge fs-badge-purple"
          style={{ fontSize: 9, padding: "2px 7px" }}
        >
          {active ? "Selected" : "Choose"}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5" style={{ marginTop: 8 }}>
        {persona.domains.slice(0, 2).map((domain) => (
          <span
            key={domain}
            className="fs-pill"
            style={{
              fontSize: 9,
              padding: "2px 7px",
              color: "#3d1454",
              borderColor: "#6b2d8b",
              background: "rgba(107,45,139,0.08)",
            }}
          >
            {domain}
          </span>
        ))}
      </div>
    </button>
  );
}

function InsightPanel({
  intelligence,
}: {
  intelligence: LiveIntelligenceState;
}) {
  const topBias = intelligence.bias_events.slice(0, 3);
  return (
    <aside
      className="flex flex-col overflow-hidden"
      style={{
        width: 320,
        minWidth: 320,
        borderLeft: "1px solid var(--border-subtle)",
        background: "#ffffff",
      }}
    >
      <div
        className="px-4 py-4"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <p className="fs-label" style={{ marginBottom: 10 }}>
          Live coaching
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              label: "Question quality",
              value: intelligence.quality_score,
              color: "#6b2d8b",
            },
            {
              label: "Bias pressure",
              value: intelligence.bias_pressure_score,
              color:
                intelligence.bias_pressure_score > 55 ? "#b95465" : "#f2a58e",
            },
          ].map((item) => (
            <div key={item.label}>
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: 7 }}
              >
                <span style={{ color: "rgba(88,77,102,0.82)", fontSize: 12 }}>
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    color: item.color,
                  }}
                >
                  {Math.round(item.value)}
                </span>
              </div>
              <div
                style={{
                  height: 7,
                  borderRadius: 99,
                  background: "rgba(201,184,216,0.34)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(0, Math.min(100, item.value))}%`,
                    height: "100%",
                    background: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 py-4">
        <section style={{ marginBottom: 16 }}>
          <p className="fs-label" style={{ marginBottom: 8 }}>
            Suggested follow-ups
          </p>
          <div className="flex flex-col gap-2">
            {intelligence.intent.recommended_questions
              .slice(0, 2)
              .map((question, i) => (
                <div
                  key={`${question}-${i}`}
                  style={{
                    background: "rgba(107,45,139,0.06)",
                    border: "1px solid rgba(107,45,139,0.14)",
                    borderRadius: 10,
                    padding: 10,
                    color: "#0a0a0f",
                    fontSize: 11,
                    lineHeight: 1.35,
                  }}
                >
                  {question}
                </div>
              ))}
          </div>
        </section>

        <section style={{ marginBottom: 16 }}>
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 8 }}
          >
            <p className="fs-label">Bias nudges</p>
            <span className="fs-badge fs-badge-purple">
              {intelligence.bias_events.length}
            </span>
          </div>
          {!topBias.length ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              No bias detected yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {topBias.map((event, i) => (
                <div
                  key={`${event.flagged_text}-${i}`}
                  style={{
                    background: "rgba(247,217,196,0.22)",
                    border: "1px solid rgba(242,165,142,0.45)",
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 9,
                      color: "#b95465",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    {labelize(event.bias_type)}
                  </div>
                  <div
                    style={{ color: "#0a0a0f", fontSize: 11, lineHeight: 1.35 }}
                  >
                    {event.context_reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <p className="fs-label" style={{ marginBottom: 8 }}>
            Pinned quotes
          </p>
          {!intelligence.quotes.length ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Strong quotes will appear here.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {intelligence.quotes.slice(0, 2).map((quote, i) => (
                <div
                  key={`${quote.text}-${i}`}
                  style={{
                    background: "rgba(107,45,139,0.04)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 9,
                      color: "#6b2d8b",
                      textTransform: "uppercase",
                      marginBottom: 5,
                    }}
                  >
                    {labelize(quote.signal_type)}
                  </div>
                  <div
                    style={{ color: "#0a0a0f", fontSize: 11, lineHeight: 1.35 }}
                  >
                    &ldquo;{quote.text}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}

export default function SimulatorPage() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<AIAgent>(
    SIMULATION_PERSONAS[0]
  );
  const [customPersona, setCustomPersona] = useState({
    name: "Ideal Customer",
    domains: "B2B SaaS, Operations",
    profile:
      "Operations leader who owns a painful workflow, evaluates new software carefully, and needs specific evidence before buying.",
  });
  const [roomName, setRoomName] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [intelligence, setIntelligence] =
    useState<LiveIntelligenceState>(EMPTY_INTELLIGENCE);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = !!roomName;
  const builtCustomPersona = useMemo<AIAgent>(
    () => ({
      id: `custom-${
        customPersona.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "persona"
      }`,
      name: customPersona.name.trim() || "Ideal Customer",
      domains: customPersona.domains
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean)
        .slice(0, 4),
      matchScore: 100,
      surveysCompleted: 0,
      lastActive: "now",
      status: "available",
      color: "#6b2d8b",
      autonomousEnabled: true,
      profile:
        customPersona.profile.trim() ||
        "Realistic target customer with practical constraints and skeptical buying behavior.",
    }),
    [customPersona]
  );
  const activePersona = useMemo(
    () =>
      selectedPersona.id.startsWith("custom-") ? builtCustomPersona : selectedPersona,
    [builtCustomPersona, selectedPersona]
  );
  const personaSummary = useMemo(
    () => activePersona.domains.join(", "),
    [activePersona]
  );

  async function handleStart() {
    setBusy(true);
    setError(null);
    try {
      const session = await startSimulation({
        id: activePersona.id,
        name: activePersona.name,
        domains: activePersona.domains,
        profile: activePersona.profile,
        role: activePersona.role,
        companyContext: activePersona.companyContext,
        buyingCriteria: activePersona.buyingCriteria,
        skepticism: activePersona.skepticism,
        responseStyle: activePersona.responseStyle,
      });
      setRoomName(session.room_name);
      setSegments(session.segments);
      setIntelligence(session.intelligence);
    } catch {
      setError("Could not start the simulation.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAsk(event: FormEvent) {
    event.preventDefault();
    if (!roomName || !question.trim()) return;
    const nextQuestion = question.trim();
    setQuestion("");
    setBusy(true);
    setError(null);
    try {
      const response = await sendSimulationTurn(roomName, nextQuestion);
      setSegments(response.segments);
      setIntelligence(response.intelligence);
    } catch {
      setError("Could not send that question.");
      setQuestion(nextQuestion);
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateInsights() {
    if (!roomName) return;
    setGenerating(true);
    setError(null);
    try {
      await generateSummary(roomName);
      router.push(`/insights?room=${encodeURIComponent(roomName)}`);
    } catch {
      setError("Could not generate insights for this simulation.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        ...pageTheme,
        background: "#faf9fd",
        padding: 14,
        height: "calc(100vh - 72px)",
        maxHeight: "calc(100vh - 72px)",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          minHeight: 56,
          background: "#ffffff",
          border: "1px solid rgba(201,184,216,0.8)",
          borderRadius: "18px 18px 0 0",
          padding: "8px 18px",
          gap: 18,
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              color: "#210b2c",
            }}
          >
            Mock Interview Simulator
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: "rgba(88,77,102,0.72)",
              marginTop: 3,
            }}
          >
            {active
              ? `ACTIVE SESSION · ${activePersona.name}`
              : "PRACTICE WITH A MATCHED TESTER"}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="fs-badge fs-badge-purple">{personaSummary}</span>
          {active && (
            <button
              onClick={handleGenerateInsights}
              disabled={generating || segments.length === 0}
              className="fs-btn-primary"
            >
              {generating ? "Generating…" : "Generate insights"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          className="px-4 py-2"
          style={{
            background: "rgba(185,84,101,0.08)",
            borderLeft: "1px solid rgba(201,184,216,0.8)",
            borderRight: "1px solid rgba(201,184,216,0.8)",
            color: "var(--red)",
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          {error}
        </div>
      )}

      <div
        className="flex flex-1 overflow-hidden"
        style={{
          minHeight: 0,
          background: "#ffffff",
          borderLeft: "1px solid rgba(201,184,216,0.8)",
          borderRight: "1px solid rgba(201,184,216,0.8)",
        }}
      >
        <aside
          className="flex flex-col overflow-y-auto"
          style={{
            width: 300,
            minWidth: 300,
            borderRight: "1px solid var(--border-subtle)",
            background: "#ffffff",
            padding: 12,
            gap: 8,
          }}
        >
          <p className="fs-label" style={{ marginBottom: 2 }}>
            Choose respondent
          </p>
          <div
            style={{
              border: "1px solid rgba(107,45,139,0.18)",
              borderRadius: 14,
              padding: 10,
              background: "rgba(107,45,139,0.04)",
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 8 }}
            >
              <p className="fs-label">Custom target</p>
              <button
                onClick={() => !active && setSelectedPersona(builtCustomPersona)}
                disabled={active}
                className="fs-btn-ghost"
                style={{ fontSize: 10, padding: "4px 8px" }}
              >
                Use
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <input
                value={customPersona.name}
                onChange={(e) =>
                  setCustomPersona((c) => ({ ...c, name: e.target.value }))
                }
                disabled={active}
                placeholder="Persona name"
                style={{
                  border: "1px solid rgba(201,184,216,0.8)",
                  borderRadius: 9,
                  padding: "7px 9px",
                  fontSize: 11,
                  color: "#0a0a0f",
                  background: "#ffffff",
                }}
              />
              <input
                value={customPersona.domains}
                onChange={(e) =>
                  setCustomPersona((c) => ({ ...c, domains: e.target.value }))
                }
                disabled={active}
                placeholder="Domains, comma separated"
                style={{
                  border: "1px solid rgba(201,184,216,0.8)",
                  borderRadius: 9,
                  padding: "7px 9px",
                  fontSize: 11,
                  color: "#0a0a0f",
                  background: "#ffffff",
                }}
              />
              <textarea
                value={customPersona.profile}
                onChange={(e) =>
                  setCustomPersona((c) => ({ ...c, profile: e.target.value }))
                }
                disabled={active}
                rows={3}
                placeholder="Workflow, constraints, skepticism, buying role"
                style={{
                  resize: "none",
                  border: "1px solid rgba(201,184,216,0.8)",
                  borderRadius: 9,
                  padding: "7px 9px",
                  fontSize: 11,
                  lineHeight: 1.3,
                  color: "#0a0a0f",
                  background: "#ffffff",
                }}
              />
            </div>
          </div>
          {SIMULATION_PERSONAS.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              active={selectedPersona.id === persona.id}
              onSelect={active ? () => undefined : setSelectedPersona}
            />
          ))}
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex-1 overflow-y-auto"
            style={{
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minHeight: 0,
            }}
          >
            {!active ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 999,
                    background: "rgba(201,184,216,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 800,
                    color: "#210b2c",
                    marginBottom: 14,
                  }}
                >
                  SIM
                </div>
                <h1
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: 26,
                    color: "#0a0a0f",
                    marginBottom: 8,
                  }}
                >
                  Rehearse before the real interview
                </h1>
                <p
                  style={{
                    color: "#584d66",
                    fontSize: 13,
                    lineHeight: 1.5,
                    maxWidth: 480,
                    marginBottom: 18,
                  }}
                >
                  Ask your discovery questions to a mock respondent and get live
                  coaching on bias, quality, and follow-up opportunities.
                </p>
                <button
                  onClick={handleStart}
                  disabled={busy}
                  className="fs-btn-primary"
                  style={{ padding: "10px 22px" }}
                >
                  {busy ? "Starting…" : `Start with ${activePersona.name}`}
                </button>
              </div>
            ) : segments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h2
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: 22,
                    color: "#0a0a0f",
                    marginBottom: 8,
                  }}
                >
                  Ask your first question
                </h2>
                <p style={{ color: "#584d66", fontSize: 14 }}>
                  Try starting with a recent workflow or pain point.
                </p>
              </div>
            ) : (
              segments.map((segment, i) => {
                const isFounder = segment.speaker === "founder";
                return (
                  <div
                    key={`${segment.timestamp_ms}-${i}`}
                    className="fade-in"
                    style={{
                      alignSelf: isFounder ? "flex-end" : "flex-start",
                      maxWidth: "74%",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        color: "#6b2d8b",
                        marginBottom: 5,
                        textAlign: isFounder ? "right" : "left",
                      }}
                    >
                      {isFounder ? "FOUNDER" : activePersona.name.toUpperCase()}
                    </div>
                    <div
                      style={{
                        background: isFounder
                          ? "#3d1454"
                          : "rgba(201,184,216,0.26)",
                        color: isFounder ? "#ffffff" : "#0a0a0f",
                        border: isFounder
                          ? "1px solid #3d1454"
                          : "1px solid rgba(201,184,216,0.8)",
                        borderRadius: 18,
                        padding: "13px 16px",
                        fontSize: 14,
                        lineHeight: 1.55,
                      }}
                    >
                      {segment.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={handleAsk}
            className="flex items-center gap-3"
            style={{
              borderTop: "1px solid var(--border-subtle)",
              padding: 12,
              background: "#ffffff",
              flexShrink: 0,
            }}
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!active || busy}
              placeholder={
                active
                  ? "Ask your next interview question…"
                  : "Start a simulation to ask questions"
              }
              style={{
                flex: 1,
                border: "1px solid rgba(201,184,216,0.9)",
                borderRadius: 999,
                padding: "10px 16px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14,
                color: "#0a0a0f",
                background: "#faf9fd",
              }}
            />
            <button
              type="submit"
              disabled={!active || busy || !question.trim()}
              className="fs-btn-primary"
            >
              {busy ? "Sending…" : "Ask"}
            </button>
          </form>
        </main>

        <InsightPanel intelligence={intelligence} />
      </div>

      <div
        style={{
          height: 8,
          background: "#ffffff",
          border: "1px solid rgba(201,184,216,0.8)",
          borderTop: "none",
          borderRadius: "0 0 18px 18px",
          flexShrink: 0,
        }}
      />
    </div>
  );
}
