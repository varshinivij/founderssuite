export default function Loading() {
  return (
    <div className="flex flex-col overflow-hidden" style={{ background: "#faf9fd", padding: 14, height: "calc(100vh - 72px)" }}>
      <div style={{ height: 56, background: "#fff", border: "1px solid rgba(201,184,216,0.8)", borderRadius: "18px 18px 0 0" }} className="animate-pulse" />
      <div style={{ flex: 1, background: "#fff", borderLeft: "1px solid rgba(201,184,216,0.8)", borderRight: "1px solid rgba(201,184,216,0.8)" }} className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#8b5cf6] border-t-transparent animate-spin" />
          <p style={{ color: "rgba(88,77,102,0.72)", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>Loading simulator…</p>
        </div>
      </div>
    </div>
  );
}
