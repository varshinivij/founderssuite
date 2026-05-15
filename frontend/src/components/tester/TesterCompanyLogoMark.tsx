/** Same visual as the tester company profile hero: emoji + uppercase label in a white tile. */
const sizeStyles = {
  hero: {
    box: "h-28 w-28 sm:h-32 sm:w-32 shadow-md",
    emoji: "text-4xl leading-none",
    label: "mt-2 text-[10px] font-bold uppercase tracking-[0.2em]",
  },
  row: {
    box: "h-12 w-12 sm:h-14 sm:w-14 shadow-sm",
    emoji: "text-2xl leading-none sm:text-3xl",
    label: "mt-1 text-[7px] font-bold uppercase tracking-[0.18em] sm:text-[8px]",
  },
  compact: {
    box: "h-11 w-11 shadow-sm",
    emoji: "text-lg leading-none",
    label:
      "mt-0.5 max-w-[2.75rem] truncate text-center text-[6px] font-bold uppercase leading-tight tracking-[0.12em]",
  },
} as const;

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function TesterCompanyLogoMark({
  emoji,
  label,
  size,
  className,
}: {
  emoji: string;
  label: string;
  size: keyof typeof sizeStyles;
  className?: string;
}) {
  const s = sizeStyles[size];
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center justify-center rounded-2xl border border-[#e0d8f0] bg-white",
        s.box,
        className,
      )}
      role="img"
      aria-label={`${label} mark`}
    >
      <span className={s.emoji} aria-hidden>
        {emoji}
      </span>
      <span className={cn(s.label, "text-[#5c4d75]")}>{label}</span>
    </div>
  );
}
