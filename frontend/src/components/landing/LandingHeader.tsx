import { RoleToggle } from "./RoleToggle";

const LANDING_TOC = [
  { href: "#overview", label: "Overview" },
  { href: "#setup", label: "Test setup" },
  { href: "#validation", label: "Validation" },
  { href: "#stories", label: "Stories" },
  { href: "#community", label: "Community" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;

export function LandingHeader({
  role,
  onRoleChange,
}: {
  role: "founder" | "tester";
  onRoleChange: (r: "founder" | "tester") => void;
}) {
  return (
    <header className="sticky top-0 z-50 w-full bg-transparent">
      <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6">
        {/* Left: natural width, pinned to start */}
        <div className="flex min-w-0 max-w-[38%] shrink-0 items-center gap-2 sm:max-w-none sm:gap-3">
          <img
            src="/logo.png"
            alt="FoundersSuite logo"
            width={40}
            height={40}
            className="size-9 shrink-0 drop-shadow-[0_18px_50px_rgba(139,92,246,0.20)] md:size-11"
          />
          <span className="min-w-0 truncate text-[13px] font-extrabold tracking-tight text-white sm:text-[15px] md:text-base">
            FoundersSuite
          </span>
        </div>

        {/* Center: all remaining width; avoid justify-center + overflow clipping */}
        <nav
          className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-1 py-0.5 text-[11px] font-medium tracking-tight text-white/65 sm:gap-x-3 md:gap-x-4 md:text-[13px]"
          aria-label="On this page"
        >
          {LANDING_TOC.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap rounded-full px-1.5 py-0.5 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right: natural width, pinned to end */}
        <div className="shrink-0">
          <RoleToggle value={role} onChange={onRoleChange} />
        </div>
      </div>
    </header>
  );
}
