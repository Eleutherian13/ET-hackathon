export default function LoadingSpinner({ message = "Processing..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-600 text-sm font-medium">{message}</p>
    </div>
  );
}
