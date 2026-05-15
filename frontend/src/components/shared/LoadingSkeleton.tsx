export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={[
        "animate-pulse rounded-lg bg-white/5 border border-black/10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl bg-[#f9fafb] border border-black/10 shadow p-5 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  );
}
