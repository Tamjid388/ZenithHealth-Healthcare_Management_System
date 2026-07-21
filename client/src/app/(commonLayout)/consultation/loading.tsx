export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 w-56 rounded bg-muted" />
      <div className="flex gap-3">
        <div className="h-10 w-64 rounded-lg bg-muted" />
        <div className="h-10 w-36 rounded-lg bg-muted" />
        <div className="h-10 w-36 rounded-lg bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-5 space-y-3">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            </div>
            <div className="h-3 w-full rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-6 w-20 rounded-full bg-muted" />
            </div>
            <div className="h-9 w-full rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
