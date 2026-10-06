export default function Loading() {
  return (
    <div className="bg-zh-mist px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-11 w-36 rounded-xl bg-zh-foam" />
        <div className="mt-4 overflow-hidden rounded-2xl bg-white ring-1 ring-zh-blue-deep/10">
          <div className="h-20 bg-zh-foam sm:h-24" />
          <div className="space-y-4 px-5 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-col gap-5 sm:-mt-12 sm:flex-row sm:items-end">
              <div className="size-24 rounded-full bg-zh-foam ring-4 ring-white sm:size-28" />
              <div className="flex-1 space-y-2.5 sm:pb-1">
                <div className="h-7 w-56 rounded-lg bg-zh-foam" />
                <div className="h-4 w-72 rounded bg-zh-foam/70" />
                <div className="h-4 w-48 rounded bg-zh-foam/70" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-36 rounded-full bg-zh-foam/70" />
              <div className="h-8 w-28 rounded-full bg-zh-foam/70" />
              <div className="h-8 w-32 rounded-full bg-zh-foam/70" />
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-zh-blue-deep/10">
              <div className="h-5 w-28 rounded bg-zh-foam" />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-zh-mist" />
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 ring-1 ring-zh-blue-deep/10">
              <div className="h-5 w-32 rounded bg-zh-foam" />
              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-zh-mist" />
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-zh-blue-deep/90 p-6">
            <div className="h-4 w-28 rounded bg-white/20" />
            <div className="mt-2 h-10 w-32 rounded-lg bg-white/20" />
            <div className="mt-4 space-y-2.5">
              <div className="h-4 w-full rounded bg-white/15" />
              <div className="h-4 w-full rounded bg-white/15" />
              <div className="h-11 w-full rounded-xl bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
