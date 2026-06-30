export default function EmptyState({
  title = "No data",
  description = "Nothing to display yet.",
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <svg
        className="w-16 h-16 text-slate-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <div>
        <h3 className="text-slate-600 font-semibold text-lg">{title}</h3>
        <p className="text-slate-400 text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}
