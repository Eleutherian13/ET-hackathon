import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";

export default function NCRDetail() {
  const { ncrId } = useParams();
  const navigate = useNavigate();
  const [ncr, setNcr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getNcrDetail(ncrId);
        setNcr(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ncrId]);

  if (loading) return <LoadingSpinner message="Loading NCR detail..." />;
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <strong>Error:</strong> {error}
        <button onClick={() => navigate(-1)} className="ml-4 text-sm underline">
          ← Go back
        </button>
      </div>
    );
  if (!ncr) return null;

  const actions = (() => {
    try {
      return JSON.parse(ncr.actions_json || "[]");
    } catch {
      return [];
    }
  })();

  const scheduleImpact = (() => {
    try {
      return JSON.parse(ncr.schedule_impact_json || "{}");
    } catch {
      return {};
    }
  })();

  const wConformPct =
    ncr.w_conform != null ? Math.round(ncr.w_conform * 100) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1"
        >
          ← Back
        </button>
        <span className="text-slate-400 text-xs">
          {ncr.raised_ts?.slice(0, 19).replace("T", " ")}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-start gap-3 mb-2">
          <SeverityBadge severity={ncr.severity} />
          <SeverityBadge severity={ncr.status} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 mt-2">{ncr.title}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {ncr.vendor_name} · {ncr.po_number} · Due: {ncr.due_date}
        </p>
      </div>

      {/* Deviation Details */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-700 mb-4">Deviation Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">
              Attribute
            </div>
            <div className="font-semibold text-slate-800 mt-1">
              {ncr.attribute_name?.replace(/_/g, " ")}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">
              Specified Value
            </div>
            <div className="font-semibold text-green-700 mt-1">
              {ncr.specified_value}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">
              Submitted Value
            </div>
            <div className="font-semibold text-red-700 mt-1">
              {ncr.submitted_value}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">
              Deviation
            </div>
            <div className="font-semibold text-slate-800 mt-1">
              {ncr.deviation_pct != null
                ? `${ncr.deviation_pct.toFixed(1)}%`
                : "Type mismatch"}
            </div>
          </div>
        </div>
        {wConformPct != null && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-500 font-medium">
                Conformance Weight (w_conform)
              </span>
              <span className="font-semibold text-slate-700">
                {wConformPct}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${wConformPct >= 70 ? "bg-green-500" : wConformPct >= 40 ? "bg-amber-400" : "bg-red-500"}`}
                style={{ width: `${wConformPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Spec Reference */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-700 mb-2">
          Specification Reference
        </h2>
        <p className="text-slate-700 font-mono text-sm">
          {ncr.spec_clause_ref || ncr.clause_number || "N/A"}
          {ncr.clause_title && ` — ${ncr.clause_title}`}
        </p>
        {ncr.page_ref && (
          <p className="text-slate-500 text-xs mt-1">
            Page ref: {ncr.page_ref}
          </p>
        )}
        {ncr.description && (
          <p className="text-slate-600 text-sm mt-3 whitespace-pre-wrap">
            {ncr.description}
          </p>
        )}
      </div>

      {/* Schedule Impact */}
      {scheduleImpact &&
        scheduleImpact.tasks &&
        scheduleImpact.tasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-700 mb-3">
              Schedule Impact
            </h2>
            <div className="flex items-center gap-3 mb-3">
              <SeverityBadge severity={scheduleImpact.risk_level || "LOW"} />
              <span className="text-sm text-slate-600">
                Min float:{" "}
                <strong>{scheduleImpact.min_float_days ?? "N/A"}</strong> days
                {scheduleImpact.days_until_required != null &&
                  ` · First task in ${scheduleImpact.days_until_required} days`}
              </span>
            </div>
            <div className="space-y-2">
              {scheduleImpact.tasks.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between rounded px-3 py-2 text-sm ${t.float_days === 0 ? "bg-red-50 border-l-4 border-red-400" : "bg-slate-50"}`}
                >
                  <span className="font-mono text-xs text-slate-500">
                    {t.code}
                  </span>
                  <span className="text-slate-700">{t.description}</span>
                  <span
                    className={`font-semibold ${t.float_days === 0 ? "text-red-600" : "text-slate-600"}`}
                  >
                    {t.float_days}d float
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Recommended Actions */}
      {actions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-700 mb-3">
            Recommended Actions
          </h2>
          <ol className="space-y-3">
            {actions.map((action, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-xs">
                  {i + 1}
                </span>
                <span className="text-slate-700">{action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {ncr.assigned_to && (
        <p className="text-xs text-slate-400 text-right">
          Assigned to: {ncr.assigned_to}
        </p>
      )}
    </div>
  );
}
