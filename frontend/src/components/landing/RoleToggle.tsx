
export function RoleToggle({
  value,
  onChange,
}: {
  value: "founder" | "tester";
  onChange: (v: "founder" | "tester") => void;
}) {
  return (
    <div className="flex rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => onChange("founder")}
        className={`rounded-full px-4 py-2 text-sm transition ${
          value === "founder"
            ? "bg-[#8b5cf6] text-white shadow-[0_12px_32px_rgba(139,92,246,0.35)]"
            : "text-purple-100/80 hover:text-white"
        }`}
      >
        I&apos;m a Founder
      </button>
      <button
        type="button"
        onClick={() => onChange("tester")}
        className={`rounded-full px-4 py-2 text-sm transition ${
          value === "tester"
            ? "bg-[#8b5cf6] text-white shadow-[0_12px_32px_rgba(139,92,246,0.35)]"
            : "text-purple-100/80 hover:text-white"
        }`}
      >
        I&apos;m a Tester
      </button>
    </div>
  );
}
