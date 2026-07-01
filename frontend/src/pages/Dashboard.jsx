import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ChevronRight, ArrowRight, Zap, BarChart3, AlertCircle, FileText } from "lucide-react";
import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import DashboardHero from "../components/hero/DashboardHero.jsx";
import ProductWalkthrough from "../components/overview/ProductWalkthrough.jsx";

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
      <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 text-danger">
        <strong>Error loading dashboard:</strong> {error}
        <button onClick={fetchSummary} className="ml-4 text-sm underline hover:no-underline">
          Retry
        </button>
      </div>
    );
  if (!summary) return null;

  const ncr = summary.open_ncr_count || {};
  const health = summary.project_health_score || 0;
  const healthColor = health >= 70 ? "success" : health >= 40 ? "warning" : "danger";
  const healthBgColor = health >= 70 ? "from-success/10 to-success/5" : health >= 40 ? "from-warning/10 to-warning/5" : "from-danger/10 to-danger/5";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <DashboardHero summary={summary} healthScore={health} />

      {/* ─── Interactive Product Walkthrough ───────────────────────── */}
      <ProductWalkthrough />

      {/* ─── Live Project Intelligence Cards ─────────────────────── */}
      <motion.div
        className="max-w-6xl mx-auto space-y-8 pb-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -100px 0px" }}
        variants={containerVariants}
      >
        {/* Header with Refresh */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-end mb-4"
        >
          <button
            onClick={fetchSummary}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <span>Refresh</span>
            <ChevronRight size={18} />
          </button>
        </motion.div>

        {/* Health Metrics Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Critical NCRs */}
          <motion.div
            whileHover={{ y: -4 }}
            className="card card-hover p-6 group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Critical NCRs</p>
                <p className="text-4xl font-bold text-danger mt-2">
                  {ncr.CRITICAL || 0}
                </p>
                <p className="text-text-muted text-xs mt-2">Action required</p>
              </div>
              <AlertCircle className="text-danger/60 group-hover:text-danger transition-colors" size={24} />
            </div>
          </motion.div>

          {/* At-Risk Tasks */}
          <motion.div
            whileHover={{ y: -4 }}
            className="card card-hover p-6 group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">At-Risk Tasks</p>
                <p className="text-4xl font-bold text-warning mt-2">
                  {summary.at_risk_tasks || 0}
                </p>
                <p className="text-text-muted text-xs mt-2">Risk score &gt; 50%</p>
              </div>
              <BarChart3 className="text-warning/60 group-hover:text-warning transition-colors" size={24} />
            </div>
          </motion.div>

          {/* Health Score */}
          <motion.div
            whileHover={{ y: -4 }}
            className={`card card-hover p-6 group cursor-pointer bg-gradient-to-br ${healthBgColor}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Health Score</p>
                <p className={`text-4xl font-bold mt-2 ${healthColor === 'success' ? 'text-success' : healthColor === 'warning' ? 'text-warning' : 'text-danger'}`}>
                  {health.toFixed(0)}%
                </p>
                <p className="text-text-muted text-xs mt-2">Project status</p>
              </div>
              <Zap className={`${healthColor === 'success' ? 'text-success' : healthColor === 'warning' ? 'text-warning' : 'text-danger'}/60 group-hover:opacity-100 transition-opacity`} size={24} />
            </div>
          </motion.div>

          {/* Documents */}
          <motion.div
            whileHover={{ y: -4 }}
            className="card card-hover p-6 group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Documents</p>
                <p className="text-4xl font-bold text-primary mt-2">
                  {summary.total_documents || 0}
                </p>
                <p className="text-text-muted text-xs mt-2">
                  {summary.compliance_checks_run || 0} checks run
                </p>
              </div>
              <FileText className="text-primary/60 group-hover:text-primary transition-colors" size={24} />
            </div>
          </motion.div>
        </motion.div>

        {/* NCR Distribution */}
        <motion.div variants={itemVariants} className="card p-6">
          <h3 className="text-lg font-semibold text-text mb-6">NCR Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-danger">{ncr.CRITICAL || 0}</div>
              <div className="text-text-muted text-sm mt-2">Critical</div>
              <div className="w-full h-1 bg-danger/20 rounded-full mt-3">
                <div className="h-full bg-danger rounded-full" style={{width: `${Math.min((ncr.CRITICAL || 0) * 20, 100)}%`}} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{ncr.MAJOR || 0}</div>
              <div className="text-text-muted text-sm mt-2">Major</div>
              <div className="w-full h-1 bg-warning/20 rounded-full mt-3">
                <div className="h-full bg-warning rounded-full" style={{width: `${Math.min((ncr.MAJOR || 0) * 20, 100)}%`}} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{ncr.MINOR || 0}</div>
              <div className="text-text-muted text-sm mt-2">Minor</div>
              <div className="w-full h-1 bg-accent/20 rounded-full mt-3">
                <div className="h-full bg-accent rounded-full" style={{width: `${Math.min((ncr.MINOR || 0) * 20, 100)}%`}} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-600">{summary.critical_path_tasks || 0}</div>
              <div className="text-text-muted text-sm mt-2">Critical Path</div>
              <div className="w-full h-1 bg-slate-200 rounded-full mt-3">
                <div className="h-full bg-slate-400 rounded-full" style={{width: `${Math.min((summary.critical_path_tasks || 0) * 10, 100)}%`}} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent AI Activity */}
        <motion.div variants={itemVariants} className="card p-6">
          <h3 className="text-lg font-semibold text-text mb-6">Recent AI Activity</h3>
          {!summary.recent_agent_runs || summary.recent_agent_runs.length === 0 ? (
            <p className="text-text-muted text-center py-8">
              No agent runs yet. Upload documents to begin.
            </p>
          ) : (
            <div className="space-y-3">
              {summary.recent_agent_runs.slice(0, 5).map((run, idx) => {
                const agentColors = {
                  spec_compliance: { bg: "bg-primary/10", text: "text-primary", label: "Spec Compliance" },
                  schedule_risk: { bg: "bg-accent/10", text: "text-accent", label: "Schedule Risk" },
                  rfi_knowledge: { bg: "bg-success/10", text: "text-success", label: "RFI Knowledge" },
                };
                const colors = agentColors[run.agent_name] || { bg: "bg-slate-100", text: "text-slate-600", label: run.agent_name.replace("_", " ") };
                
                return (
                  <motion.div
                    key={run.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className={`${colors.bg} px-3 py-1 rounded-full flex-shrink-0`}>
                      <span className={`text-xs font-semibold ${colors.text}`}>
                        {colors.label}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-text truncate">
                        {run.output_summary || "Completed"}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {run.started_ts?.slice(0, 19).replace("T", " ")}
                      </p>
                    </div>
                    <SeverityBadge severity={run.status} />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.button
            whileHover={{ y: -4 }}
            onClick={() => navigate("/compliance")}
            className="card card-hover p-8 text-center group cursor-pointer"
          >
            <FileText className="w-12 h-12 text-primary/60 group-hover:text-primary transition-colors mx-auto mb-4" />
            <h4 className="font-semibold text-text mb-2">Upload Specification</h4>
            <p className="text-sm text-text-muted">Run compliance checks</p>
          </motion.button>

          <motion.button
            whileHover={{ y: -4 }}
            onClick={() => navigate("/schedule")}
            className="card card-hover p-8 text-center group cursor-pointer"
          >
            <BarChart3 className="w-12 h-12 text-accent/60 group-hover:text-accent transition-colors mx-auto mb-4" />
            <h4 className="font-semibold text-text mb-2">Analyze Schedule Risk</h4>
            <p className="text-sm text-text-muted">Predict delays</p>
          </motion.button>

          <motion.button
            whileHover={{ y: -4 }}
            onClick={() => navigate("/rfi")}
            className="card card-hover p-8 text-center group cursor-pointer"
          >
            <Zap className="w-12 h-12 text-success/60 group-hover:text-success transition-colors mx-auto mb-4" />
            <h4 className="font-semibold text-text mb-2">Open RFI Intelligence</h4>
            <p className="text-sm text-text-muted">AI assistance</p>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
