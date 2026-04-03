"use client";

export function TrackSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <span className="w-6 h-3 bg-white/5 rounded" />
      <div className="w-10 h-10 bg-white/10 rounded-md" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/10 rounded w-2/3" />
        <div className="h-2 bg-white/5 rounded w-1/3" />
      </div>
      <div className="w-8 h-8 bg-white/5 rounded-full" />
    </div>
  );
}

export function PlaylistSkeleton({ count = 15 }: { count?: number }) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="h-3 bg-white/10 rounded w-48 animate-pulse" />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
        {Array.from({ length: count }).map((_, i) => (
          <TrackSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      <div className="flex items-center justify-between text-sm text-white/50 mb-2">
        <span>Loading songs...</span>
        <span>{done} of {total} artists</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
