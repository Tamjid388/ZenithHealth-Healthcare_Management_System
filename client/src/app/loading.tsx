export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse space-y-4 text-center">
        <div className="mx-auto h-10 w-10 rounded-full bg-muted" />
        <div className="h-4 w-48 mx-auto rounded bg-muted" />
        <div className="h-3 w-32 mx-auto rounded bg-muted" />
      </div>
    </div>
  );
}
