import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSummary();
  }, []);

  async function fetchSummary() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <strong>Error loading dashboard:</strong> {error}
        <button onClick={fetchSummary} className="ml-4 text-sm underline">
          Retry
        </button>
      </div>
    );
  if (!summary) return null;

  const ncr = summary.open_ncr_count || {};
  const health = summary.project_health_score || 0;
  const healthColor =
    health >= 70
      ? "text-green-600"
      : health >= 40
        ? "text-amber-600"
        : "text-red-600";
  const healthBg =
    health >= 70
      ? "border-green-400"
      : health >= 40
        ? "border-amber-400"
        : "border-red-500";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Project VERTEX</h1>
          <p className="text-slate-500 text-sm">
            Hyperscale Data Centre — Pune, Maharashtra
          </p>
        </div>
        <button
          onClick={fetchSummary}
          className="text-sm text-teal-600 hover:text-teal-800 font-medium"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Health Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className={`bg-white rounded-xl border-l-4 ${(ncr.CRITICAL || 0) > 0 ? "border-red-500" : "border-slate-200"} shadow-sm p-5`}
        >
          <div className="text-3xl font-bold text-red-600">
            {ncr.CRITICAL || 0}
          </div>
          <div className="text-sm font-semibold text-slate-600 mt-1">
            Critical NCRs
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Open — action required
          </div>
        </div>

        <div
          className={`bg-white rounded-xl border-l-4 ${(summary.at_risk_tasks || 0) > 0 ? "border-orange-400" : "border-slate-200"} shadow-sm p-5`}
        >
          <div className="text-3xl font-bold text-orange-500">
            {summary.at_risk_tasks || 0}
          </div>
          <div className="text-sm font-semibold text-slate-600 mt-1">
            At-Risk Tasks
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Risk score &gt; 50%
          </div>
        </div>

        <div
          className={`bg-white rounded-xl border-l-4 ${healthBg} shadow-sm p-5`}
        >
          <div className={`text-3xl font-bold ${healthColor}`}>
            {health.toFixed(0)}
          </div>
          <div className="text-sm font-semibold text-slate-600 mt-1">
            Health Score
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Out of 100</div>
        </div>

        <div className="bg-white rounded-xl border-l-4 border-slate-200 shadow-sm p-5">
          <div className="text-3xl font-bold text-slate-700">
            {summary.total_documents || 0}
          </div>
          <div className="text-sm font-semibold text-slate-600 mt-1">
            Documents
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {summary.compliance_checks_run || 0} checks run
          </div>
        </div>
      </div>

      {/* NCR Summary Row */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
        <h2 className="text-base font-semibold text-slate-700 mb-3">
          NCR Summary
        </h2>
        <div className="flex gap-4 flex-wrap">
          <span className="flex items-center gap-2 text-sm">
            <span className="inline-block w-3 h-3 rounded-full bg-red-600" />
            Critical:{" "}
            <strong className="text-red-600">{ncr.CRITICAL || 0}</strong>
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500" />
            Major: <strong className="text-orange-500">{ncr.MAJOR || 0}</strong>
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-400" />
            Minor: <strong className="text-amber-600">{ncr.MINOR || 0}</strong>
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="inline-block w-3 h-3 rounded-full bg-slate-300" />
            Critical Path Tasks:{" "}
            <strong>{summary.critical_path_tasks || 0}</strong>
          </span>
        </div>
      </div>

      {/* Recent Agent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
        <h2 className="text-base font-semibold text-slate-700 mb-3">
          Recent Agent Activity
        </h2>
        {!summary.recent_agent_runs ||
        summary.recent_agent_runs.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No agent runs yet. Upload documents to begin.
          </p>
        ) : (
          <div className="divide-y divide-slate-50">
            {summary.recent_agent_runs.map((run) => {
              const agentColors = {
                spec_compliance: "bg-purple-100 text-purple-700",
                schedule_risk: "bg-blue-100 text-blue-700",
                rfi_knowledge: "bg-teal-100 text-teal-700",
              };
              const colorClass =
                agentColors[run.agent_name] || "bg-slate-100 text-slate-600";
              return (
                <div key={run.id} className="py-3 flex items-start gap-3">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${colorClass}`}
                  >
                    {run.agent_name.replace("_", " ")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {run.output_summary || "Completed"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {run.started_ts?.slice(0, 19).replace("T", " ")}
                    </p>
                  </div>
                  <SeverityBadge severity={run.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
        <h2 className="text-base font-semibold text-slate-700 mb-3">
          Quick Actions
        </h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate("/compliance")}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
          >
            Upload Specification
          </button>
          <button
            onClick={() => navigate("/schedule")}
            className="bg-slate-700 hover:bg-slate-800 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
          >
            Analyze Schedule Risk
          </button>
          <button
            onClick={() => navigate("/rfi")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
          >
            Open RFI Intelligence
          </button>
        </div>
      </div>
    </div>
  );
}
