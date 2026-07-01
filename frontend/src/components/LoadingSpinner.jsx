/** Glass shimmer skeleton for loading states — no spinner */
function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export default function LoadingSpinner({ message = "" }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-48 rounded-xl" />
          <SkeletonBlock className="h-4 w-64 rounded-lg" />
        </div>
        <SkeletonBlock className="h-10 w-28 rounded-full" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl p-6 space-y-3 bg-white border border-slate-200">
            <SkeletonBlock className="h-4 w-24 rounded-lg" />
            <SkeletonBlock className="h-9 w-16 rounded-xl" />
            <SkeletonBlock className="h-3 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Content block */}
      <div className="rounded-2xl p-6 space-y-4 bg-white border border-slate-200">
        <SkeletonBlock className="h-5 w-40 rounded-lg" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <SkeletonBlock className="h-4 rounded-lg flex-1" />
            <SkeletonBlock className="h-4 w-16 rounded-lg" />
          </div>
        ))}
      </div>

      {message && (
        <p className="text-center text-sm font-medium text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
}
