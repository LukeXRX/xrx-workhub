export function TodoSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 px-5 py-4 border-l-[3px] border-bg-3 bg-bg-2 rounded-r"
        >
          <div className="w-6 h-6 rounded-full bg-bg-3 mt-1" />
          <div className="flex-1">
            <div className="h-5 bg-bg-3 rounded w-3/4 mb-2" />
            <div className="h-3 bg-bg-3 rounded w-1/2 mb-2" />
            <div className="flex gap-2">
              <div className="h-5 bg-bg-3 rounded w-12" />
              <div className="h-5 bg-bg-3 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-2 p-5 animate-pulse">
      <div className="h-4 bg-bg-3 rounded w-20 mb-4" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          <div className="w-8 h-8 rounded bg-bg-3" />
          <div className="h-4 bg-bg-3 rounded flex-1" />
          <div className="h-5 w-8 bg-bg-3 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="px-8 py-6 animate-pulse">
      <div className="h-8 bg-bg-3 rounded w-48 mb-2" />
      <div className="h-4 bg-bg-3 rounded w-32 mb-8" />
      <div className="h-12 bg-bg-3 rounded mb-6" />
      <TodoSkeleton />
    </div>
  );
}
