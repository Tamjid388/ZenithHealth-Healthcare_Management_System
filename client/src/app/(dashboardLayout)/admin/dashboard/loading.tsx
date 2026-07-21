export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-8 w-16 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-4 space-y-3">
          <div className="h-5 w-36 rounded bg-muted" />
          <div className="h-48 w-full rounded bg-muted" />
        </div>
        <div className="rounded-lg border p-4 space-y-3">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="h-48 w-full rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
