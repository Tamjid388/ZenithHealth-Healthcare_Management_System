export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="animate-pulse w-full max-w-md space-y-6 rounded-xl border p-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto h-8 w-32 rounded bg-muted" />
          <div className="mx-auto h-4 w-48 rounded bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-10 w-full rounded-lg bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-10 w-full rounded-lg bg-muted" />
          </div>
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
        </div>
        <div className="h-4 w-40 mx-auto rounded bg-muted" />
      </div>
    </div>
  );
}
