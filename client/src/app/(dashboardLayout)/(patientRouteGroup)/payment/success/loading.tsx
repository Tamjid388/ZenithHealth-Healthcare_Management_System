export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="animate-pulse w-full max-w-md space-y-6 rounded-xl border p-8 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="mx-auto h-6 w-48 rounded bg-muted" />
          <div className="mx-auto h-4 w-64 rounded bg-muted" />
        </div>
        <div className="space-y-2 rounded-lg border p-4">
          <div className="flex justify-between">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
        </div>
        <div className="h-10 w-40 mx-auto rounded-lg bg-muted" />
      </div>
    </div>
  );
}
