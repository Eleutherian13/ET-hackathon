import { useState, useEffect } from "react";
import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Schedule() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await api.getScheduleTasks();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    try {
      setAnalyzing(true);
      setError(null);
      setStatusMsg("Schedule Risk Agent running...");
      await api.analyzeSchedule();
      setStatusMsg("✓ Analysis complete — reloading tasks");
      await loadTasks();
      setStatusMsg("");
    } catch (err) {
      setError(err.message);
      setStatusMsg("");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setImporting(true);
      setError(null);
      setStatusMsg("Importing schedule...");
      await api.importSchedule(formData);
      setStatusMsg("✓ Schedule imported");
      await loadTasks();
      setStatusMsg("");
    } catch (err) {
      setError(err.message);
      setStatusMsg("");
    } finally {
      setImporting(false);
    }
  }

  function getRiskLevel(score) {
    if (score >= 0.75) return "HIGH";
    if (score >= 0.5) return "MEDIUM";
    return "LOW";
  }

  function getRiskBg(score, float_days) {
    if (float_days === 0) return "bg-red-50 border-l-4 border-red-400";
    if (score >= 0.75) return "bg-orange-50";
    return "";
  }

  if (loading) return <LoadingSpinner message="Loading schedule tasks..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          Schedule Risk Analysis
        </h1>
        <div className="flex items-center gap-3">
          <label className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors">
            {importing ? "Importing..." : "Import Schedule CSV"}
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            {analyzing ? "Analyzing..." : "⚡ Analyze Risks"}
          </button>
        </div>
      </div>

      {(statusMsg || error) && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700 border border-red-200" : "bg-teal-50 text-teal-700 border border-teal-200"}`}
        >
          {error || statusMsg}
        </div>
      )}

      {analyzing && (
        <LoadingSpinner message="Schedule Risk Agent computing delay probabilities..." />
      )}

      {!analyzing && tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <EmptyState
            title="No schedule tasks"
            description="Import a schedule CSV or run seed_data.py to load demo schedule"
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Code
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Description
                </th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">
                  Float
                </th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">
                  Risk Score
                </th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">
                  Delay Prob
                </th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">
                  Level
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Dates
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <>
                  <tr
                    key={task.id}
                    onClick={() =>
                      setExpandedTaskId(
                        expandedTaskId === task.id ? null : task.id,
                      )
                    }
                    className={`cursor-pointer transition-colors ${getRiskBg(task.risk_score, task.total_float_days)} hover:brightness-95`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {task.task_code}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                      {task.description}
                    </td>
                    <td
                      className={`px-4 py-3 text-center font-bold ${task.total_float_days === 0 ? "text-red-600" : task.total_float_days <= 3 ? "text-amber-600" : "text-slate-500"}`}
                    >
                      {task.total_float_days}d
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                        <div
                          className={`h-1.5 rounded-full ${task.risk_score >= 0.75 ? "bg-red-500" : task.risk_score >= 0.5 ? "bg-orange-400" : "bg-green-400"}`}
                          style={{
                            width: `${Math.round(task.risk_score * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">
                        {Math.round(task.risk_score * 100)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 text-xs">
                      {task.delay_probability > 0
                        ? `${Math.round(task.delay_probability * 100)}%`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {task.risk_score > 0 && (
                        <SeverityBadge
                          severity={getRiskLevel(task.risk_score)}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {task.planned_start} → {task.planned_finish}
                    </td>
                  </tr>
                  {expandedTaskId === task.id && (
                    <tr key={`${task.id}-expanded`} className="bg-slate-800">
                      <td colSpan={7} className="px-6 py-5">
                        <div className="text-white">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-semibold text-teal-400">
                              {task.task_code} — Mitigation
                            </span>
                            <SeverityBadge
                              severity={getRiskLevel(task.risk_score)}
                            />
                          </div>
                          {task.equipment_description && (
                            <p className="text-slate-400 text-xs mb-2">
                              Equipment: {task.equipment_description}
                            </p>
                          )}
                          {task.predecessor_ids_json &&
                            JSON.parse(task.predecessor_ids_json || "[]")
                              .length > 0 && (
                              <p className="text-slate-400 text-xs mb-3">
                                Predecessors:{" "}
                                {JSON.parse(task.predecessor_ids_json).join(
                                  ", ",
                                )}
                              </p>
                            )}
                          {task.mitigation_text ? (
                            <div className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
                              {task.mitigation_text}
                            </div>
                          ) : (
                            <p className="text-slate-400 text-sm italic">
                              No mitigation generated yet. Click ⚡ Analyze
                              Risks to generate AI mitigations.
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
