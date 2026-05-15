"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  buildMemory,
  fetchGraph,
  fetchMeetings,
  fetchMemoryTimeline,
  fetchSummary,
  searchMemory,
} from "@/lib/interviewApi";
import type {
  GraphEdge,
  GraphNode,
  Meeting,
  MemoryChunk,
  SummaryReport,
} from "@/lib/interviewApi";

const dashboardTheme = {
  "--bg": "#faf9fd",
  "--surface-0": "#ffffff",
  "--surface-1": "#faf9fd",
  "--surface-2": "#f7f1fb",
  "--surface-3": "#efe4f6",
  "--border-subtle": "rgba(201,184,216,0.72)",
  "--border-mid": "rgba(201,184,216,0.9)",
  "--border-strong": "#6b2d8b",
  "--purple": "#6b2d8b",
  "--purple-dim": "rgba(107,45,139,0.08)",
  "--gold": "#f2a58e",
  "--gold-dim": "rgba(247,217,196,0.45)",
  "--red": "#b95465",
  "--green": "#2f8f67",
  "--text-1": "#210b2c",
  "--text-dim": "#0a0a0f",
  "--text-muted": "rgba(88,77,102,0.72)",
} as CSSProperties;

type DashboardTab = "overview" | "memory";

const NODE_COLORS: Record<string, string> = {
  customer: "#6b2d8b",
  call: "#f2a58e",
  pain_point: "#b95465",
  requirement: "#2f8f67",
  workflow: "#3d1454",
  integration: "#7c3aed",
};

const DEFAULT_MEMORY_QUERY = "spreadsheet onboarding SOC2";

function GraphPreview({
  nodes,
  edges,
  onSelect,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelect: (node: GraphNode) => void;
}) {
  const visibleNodes = nodes.slice(0, 12);
  const visibleEdges = edges.slice(0, 8);

  return (
    <div style={{ padding: 16, background: "#ffffff", height: "100%" }}>
      {/* Node grid */}
      <div
        style={{
          borderRadius: 14,
          border: "1px dashed rgba(201,184,216,0.9)",
          background: "linear-gradient(135deg,rgba(250,249,253,0.95) 0%,rgba(247,241,251,0.72) 100%)",
          padding: 12,
          marginBottom: visibleEdges.length > 0 ? 12 : 0,
        }}
      >
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}
        >
          {visibleNodes.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelect(node)}
              style={{
                minHeight: 72,
                border: "1px solid rgba(201,184,216,0.86)",
                borderRadius: 12,
                background: "#ffffff",
                padding: "10px 11px",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(33,11,44,0.04)",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span
                  style={{
                    width: 8, height: 8, borderRadius: 99,
                    background: NODE_COLORS[node.type] ?? "#584d66",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    color: "var(--purple)",
                    textTransform: "uppercase",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {node.type.replace(/_/g, " ")}
                </span>
              </div>
              <div
                style={{
                  color: "var(--text-1)",
                  fontWeight: 800,
                  fontSize: 12,
                  lineHeight: 1.3,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {node.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Edges — below the grid, not overlapping */}
      {visibleEdges.length > 0 && (
        <div
          style={{
            borderRadius: 12,
            border: "1px solid rgba(201,184,216,0.6)",
            background: "#faf9fd",
            padding: "10px 12px",
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              color: "rgba(88,77,102,0.6)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Relationships
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {visibleEdges.map((edge) => {
              const source = nodes.find((n) => n.id === edge.source)?.name ?? edge.source;
              const target = nodes.find((n) => n.id === edge.target)?.name ?? edge.target;
              const srcShort = source.length > 18 ? source.slice(0, 16) + "…" : source;
              const tgtShort = target.length > 18 ? target.slice(0, 16) + "…" : target;
              return (
                <span
                  key={edge.id}
                  className="fs-badge fs-badge-neutral"
                  style={{
                    textTransform: "none",
                    letterSpacing: 0,
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={`${source} → ${edge.type.replace(/_/g, " ")} → ${target}`}
                >
                  {srcShort} → {edge.type.replace(/_/g, " ")} → {tgtShort}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MemoryView({ selectedRoom, workspaceId }: { selectedRoom: string | null; workspaceId: string }) {
  const [query, setQuery] = useState(DEFAULT_MEMORY_QUERY);
  const [results, setResults] = useState<MemoryChunk[]>([]);
  const [timeline, setTimeline] = useState<MemoryChunk[]>([]);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function refreshMemory() {
    const [{ nodes: gn, edges: ge }, { events }, { results: found }] =
      await Promise.all([
        fetchGraph(workspaceId),
        fetchMemoryTimeline(workspaceId),
        searchMemory(query, workspaceId),
      ]);
    setNodes(gn);
    setEdges(ge);
    setTimeline(events);
    setResults(found);
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchGraph(workspaceId)
        .then(({ nodes: gn, edges: ge }) => {
          setNodes(gn);
          setEdges(ge);
        })
        .catch(() => setStatus("Memory data is not available yet."));
      fetchMemoryTimeline(workspaceId).then(({ events }) =>
        setTimeline(events)
      );
      searchMemory(DEFAULT_MEMORY_QUERY, workspaceId).then(({ results: found }) =>
        setResults(found)
      );
    });
  }, [workspaceId]);

  async function handleBuildMemory() {
    if (!selectedRoom) {
      setStatus("Select or create an interview before building memory.");
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      await buildMemory(selectedRoom);
      await refreshMemory();
      setStatus("Memory graph refreshed.");
    } catch {
      setStatus("Could not build memory for the selected interview.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSearch() {
    setBusy(true);
    try {
      const { results: found } = await searchMemory(query, workspaceId);
      setResults(found);
    } catch {
      setStatus("Memory search failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="flex flex-1 overflow-hidden"
      style={{
        background: "#ffffff",
        borderLeft: "1px solid rgba(201,184,216,0.8)",
        borderRight: "1px solid rgba(201,184,216,0.8)",
      }}
    >
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ padding: 20 }}
      >
        <div
          className="flex items-center gap-3"
          style={{ marginBottom: 14 }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memory: customers mentioning SOC2"
            style={{
              flex: 1,
              border: "1px solid var(--border-mid)",
              borderRadius: 12,
              padding: "10px 12px",
              background: "#faf9fd",
              color: "var(--text-dim)",
            }}
          />
          <button
            onClick={handleSearch}
            disabled={busy}
            className="fs-btn-ghost"
          >
            Search
          </button>
          <button
            onClick={handleBuildMemory}
            disabled={busy || !selectedRoom}
            className="fs-btn-primary"
          >
            {busy ? "Working..." : "Build memory"}
          </button>
        </div>

        {status && (
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            {status}
          </div>
        )}

        <div
          className="flex-1 grid overflow-hidden"
          style={{
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
            gap: 16,
          }}
        >
          <section
            style={{
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              overflow: "hidden",
              background: "#faf9fd",
              minHeight: 0,
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                borderBottom: "1px solid var(--border-subtle)",
                background: "#ffffff",
              }}
            >
              <span className="fs-label">Knowledge Graph</span>
              <span className="fs-badge fs-badge-purple">
                {nodes.length} nodes
              </span>
            </div>
            {nodes.length === 0 ? (
              <div
                className="flex items-center justify-center h-full"
                style={{ color: "var(--text-muted)", fontSize: 13 }}
              >
                Build memory from an interview to populate the graph.
              </div>
            ) : (
              <div className="h-full overflow-auto">
                <GraphPreview
                  nodes={nodes}
                  edges={edges}
                  onSelect={setSelectedNode}
                />
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-4 overflow-y-auto">
            {selectedNode && (
              <div
                style={{
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 14,
                  padding: 16,
                  background: "#ffffff",
                }}
              >
                <p className="fs-label" style={{ marginBottom: 8 }}>
                  Node detail
                </p>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: "var(--text-1)",
                    marginBottom: 6,
                  }}
                >
                  {selectedNode.name}
                </div>
                <span
                  className="fs-badge fs-badge-purple"
                  style={{ textTransform: "capitalize" }}
                >
                  {selectedNode.type.replace(/_/g, " ")}
                </span>
              </div>
            )}

            <div
              style={{
                border: "1px solid var(--border-subtle)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  background: "#ffffff",
                }}
              >
                <span className="fs-label">Search results</span>
                <span className="fs-badge fs-badge-neutral">
                  {results.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-3 overflow-y-auto max-h-72">
                {results.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    No results yet.
                  </div>
                ) : (
                  results.map((chunk) => (
                    <div
                      key={chunk.id}
                      style={{
                        background: "#faf9fd",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 10,
                        padding: 10,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 9,
                          color: "var(--purple)",
                          textTransform: "uppercase",
                          marginBottom: 5,
                        }}
                      >
                        {chunk.topic} · {chunk.speaker}
                      </div>
                      <p
                        style={{
                          color: "var(--text-dim)",
                          fontSize: 12,
                          lineHeight: 1.45,
                        }}
                      >
                        {chunk.text.slice(0, 180)}
                        {chunk.text.length > 180 ? "…" : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div
              style={{
                border: "1px solid var(--border-subtle)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  background: "#ffffff",
                }}
              >
                <span className="fs-label">Timeline</span>
                <span className="fs-badge fs-badge-neutral">
                  {timeline.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-3 overflow-y-auto max-h-64">
                {timeline.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    No timeline events.
                  </div>
                ) : (
                  timeline.slice(0, 10).map((event) => (
                    <div
                      key={event.id}
                      style={{
                        background: "#faf9fd",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 10,
                        padding: 10,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 9,
                          color: "var(--gold)",
                          textTransform: "uppercase",
                          marginBottom: 5,
                        }}
                      >
                        {event.topic}
                      </div>
                      <p
                        style={{
                          color: "var(--text-dim)",
                          fontSize: 12,
                          lineHeight: 1.45,
                        }}
                      >
                        {event.text.slice(0, 140)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SummaryView({ report }: { report: SummaryReport }) {
  return (
    <div className="flex flex-col gap-5 overflow-y-auto px-2">
      {report.error && (
        <div
          style={{
            color: "var(--red)",
            background: "rgba(185,84,101,0.08)",
            border: "1px solid rgba(185,84,101,0.24)",
            borderRadius: 12,
            padding: 14,
            fontSize: 13,
          }}
        >
          {report.error}
        </div>
      )}

      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}
      >
        {Object.entries(report.scores).map(([key, val]) => (
          <div
            key={key}
            style={{
              background: "#ffffff",
              border: "1px solid var(--border-subtle)",
              borderRadius: 14,
              padding: 14,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 26,
                fontWeight: 800,
                color: "var(--purple)",
              }}
            >
              {Math.round(val)}
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginTop: 5,
              }}
            >
              {key.replace(/_/g, " ")}
            </div>
          </div>
        ))}
      </div>

      {report.findings.length > 0 && (
        <section>
          <p className="fs-label" style={{ marginBottom: 10 }}>
            Key findings
          </p>
          <div className="flex flex-col gap-2">
            {report.findings.map((finding, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(107,45,139,0.04)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  color: "var(--text-dim)",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {finding}
              </div>
            ))}
          </div>
        </section>
      )}

      {report.validations.length > 0 && (
        <section>
          <p className="fs-label" style={{ marginBottom: 10 }}>
            Hypothesis validations
          </p>
          <div className="flex flex-col gap-2">
            {report.validations.map((v, i) => (
              <div
                key={i}
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                <div
                  className="flex items-center gap-2"
                  style={{ marginBottom: 6 }}
                >
                  <span
                    className={`fs-badge ${
                      v.status === "validated"
                        ? "fs-badge-gold"
                        : v.status === "invalidated"
                          ? "fs-badge-neutral"
                          : "fs-badge-purple"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
                <p
                  style={{
                    fontWeight: 700,
                    color: "var(--text-1)",
                    fontSize: 13,
                    marginBottom: 5,
                  }}
                >
                  {v.hypothesis}
                </p>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: 12,
                    lineHeight: 1.45,
                  }}
                >
                  {v.evidence}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {report.bias_flags.length > 0 && (
        <section>
          <p className="fs-label" style={{ marginBottom: 10 }}>
            Bias flags
          </p>
          <div className="flex flex-col gap-2">
            {report.bias_flags.map((flag, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(247,217,196,0.22)",
                  border: "1px solid rgba(242,165,142,0.45)",
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                <p
                  style={{
                    color: "var(--red)",
                    fontSize: 12,
                    marginBottom: 5,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{flag.question}&rdquo;
                </p>
                <p
                  style={{
                    color: "var(--text-dim)",
                    fontSize: 12,
                    marginBottom: 5,
                  }}
                >
                  {flag.issue}
                </p>
                <p
                  style={{
                    color: "var(--purple)",
                    fontSize: 12,
                    lineHeight: 1.45,
                  }}
                >
                  {flag.suggestion}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {report.next_steps.length > 0 && (
        <section>
          <p className="fs-label" style={{ marginBottom: 10 }}>
            Next steps
          </p>
          <div className="flex flex-col gap-2">
            {report.next_steps.map((step, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(47,143,103,0.06)",
                  border: "1px solid rgba(47,143,103,0.24)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  color: "var(--text-dim)",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {i + 1}. {step}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function InsightsPage() {
  const searchParams = useSearchParams();
  const initialRoom = searchParams.get("room");
  const { user, isLoading: authLoading } = useAuth();
  const workspaceId = user?.id ?? "default";

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(
    initialRoom
  );
  const [report, setReport] = useState<SummaryReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    fetchMeetings(user?.id).then(({ meetings: m }) => {
      setMeetings(m);
      if (m.length > 0) {
        const roomInList = m.some((mt) => mt.room_name === selectedRoom);
        if (!roomInList) setSelectedRoom(m[0].room_name);
      } else {
        setSelectedRoom(null);
      }
    });
  }, [authLoading, user?.id]);

  useEffect(() => {
    if (!selectedRoom) return;
    setLoadingReport(true);
    fetchSummary(selectedRoom)
      .then(({ report: r }) => setReport(r))
      .finally(() => setLoadingReport(false));
  }, [selectedRoom]);

  const TABS: Array<{ key: DashboardTab; label: string }> = [
    { key: "overview", label: "Summary" },
    { key: "memory", label: "Memory graph" },
  ];

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        ...dashboardTheme,
        background: "#faf9fd",
        padding: 14,
        height: "calc(100vh - 72px)",
        maxHeight: "calc(100vh - 72px)",
      }}
    >
      {/* Header */}
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
            Interview Insights
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: "rgba(88,77,102,0.72)",
              marginTop: 3,
            }}
          >
            {selectedRoom ?? "SELECT AN INTERVIEW BELOW"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`fs-pill${activeTab === tab.key ? " active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex flex-1 overflow-hidden"
        style={{
          minHeight: 0,
          background: "#ffffff",
          borderLeft: "1px solid rgba(201,184,216,0.8)",
          borderRight: "1px solid rgba(201,184,216,0.8)",
        }}
      >
        {/* Sidebar: meeting list */}
        <aside
          className="flex flex-col overflow-y-auto"
          style={{
            width: 260,
            minWidth: 260,
            borderRight: "1px solid var(--border-subtle)",
            background: "#faf9fd",
            padding: 12,
            gap: 6,
          }}
        >
          <p className="fs-label" style={{ marginBottom: 6 }}>
            Interviews
          </p>
          {meetings.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
              No interviews yet. Run a simulation or live meeting.
            </p>
          ) : (
            meetings.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedRoom(m.room_name)}
                style={{
                  background:
                    selectedRoom === m.room_name
                      ? "rgba(201,184,216,0.34)"
                      : "rgba(107,45,139,0.035)",
                  border: `1px solid ${
                    selectedRoom === m.room_name
                      ? "#6b2d8b"
                      : "rgba(201,184,216,0.72)"
                  }`,
                  borderRadius: 12,
                  padding: "10px 12px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    color: "#0a0a0f",
                    marginBottom: 4,
                  }}
                >
                  {m.title ?? m.room_name}
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    color: "rgba(88,77,102,0.72)",
                  }}
                >
                  {new Date(m.created_at).toLocaleDateString()}
                  {m.is_simulated ? " · SIMULATED" : ""}
                </div>
              </button>
            ))
          )}
        </aside>

        {/* Main content */}
        {activeTab === "overview" ? (
          <main
            className="flex-1 overflow-y-auto"
            style={{ padding: 20 }}
          >
            {loadingReport ? (
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: 13,
                  textAlign: "center",
                  paddingTop: 60,
                }}
              >
                Loading summary…
              </div>
            ) : !selectedRoom ? (
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: 13,
                  textAlign: "center",
                  paddingTop: 60,
                }}
              >
                Select an interview from the left to view its insights.
              </div>
            ) : !report ? (
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: 13,
                  textAlign: "center",
                  paddingTop: 60,
                }}
              >
                No summary yet. Generate one from the meeting room or simulator.
              </div>
            ) : (
              <SummaryView report={report} />
            )}
          </main>
        ) : (
          <MemoryView selectedRoom={selectedRoom} workspaceId={workspaceId} />
        )}
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
