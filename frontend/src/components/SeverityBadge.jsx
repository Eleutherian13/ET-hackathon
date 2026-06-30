export default function SeverityBadge({ severity, label }) {
  const styles = {
    CRITICAL: "bg-red-600 text-white",
    MAJOR: "bg-orange-500 text-white",
    MINOR: "bg-amber-400 text-slate-900",
    OBSERVATION: "bg-gray-400 text-white",
    PASS: "bg-green-500 text-white",
    HIGH: "bg-red-600 text-white",
    MEDIUM: "bg-orange-500 text-white",
    LOW: "bg-green-500 text-white",
    COMPLIANT: "bg-green-500 text-white",
    PENDING: "bg-gray-400 text-white",
    open: "bg-red-100 text-red-800",
    closed: "bg-green-100 text-green-800",
    resolved: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    running: "bg-blue-100 text-blue-800",
  };

  // Fallback to severity if no specific label is passed
  const displayLabel = label || severity;

  // Find the style using severity, then label, then default to gray
  const baseStyle =
    styles[severity] || styles[displayLabel] || "bg-gray-300 text-gray-800";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${baseStyle}`}
    >
      {displayLabel}
    </span>
  );
}
