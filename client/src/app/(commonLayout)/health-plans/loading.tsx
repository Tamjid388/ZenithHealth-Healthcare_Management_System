export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 w-40 rounded bg-muted" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-6 space-y-4">
            <div className="h-6 w-32 rounded bg-muted" />
            <div className="h-10 w-24 rounded bg-muted" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-muted" />
                  <div className="h-3 w-3/4 rounded bg-muted" />
                </div>
              ))}
            </div>
            <div className="h-10 w-full rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
