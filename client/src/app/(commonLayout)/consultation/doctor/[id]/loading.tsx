export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="flex items-start gap-6">
        <div className="h-32 w-32 rounded-full bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-muted" />
            <div className="h-6 w-24 rounded-full bg-muted" />
          </div>
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4 space-y-3">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        </div>
        <div className="rounded-lg border p-4 space-y-3">
          <div className="h-5 w-36 rounded bg-muted" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
