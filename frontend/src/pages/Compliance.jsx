import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Settings, Play, ChevronRight, ShieldAlert, CheckCircle, Activity, Box } from "lucide-react";
import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ComplianceBackground from "../components/compliance/ComplianceBackground.jsx";
import ComplianceUploadCard from "../components/compliance/ComplianceUploadCard.jsx";
import AIProcessingTimeline from "../components/compliance/AIProcessingTimeline.jsx";

// ─── KPI Counters ─────────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = "" }) {
  // Simplified counter for KPIs
  return <span>{value}{suffix}</span>;
}

export default function Compliance() {
  // ORIGINAL STATE
  const [specFile, setSpecFile] = useState(null);
  const [submFile, setSubmFile] = useState(null);
  const [vendorName, setVendorName] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [equipmentItemId, setEquipmentItemId] = useState("eq-ups-moda-001");
  const [uploadingSpec, setUploadingSpec] = useState(false);
  const [uploadingSubm, setUploadingSubm] = useState(false);
  const [specDocId, setSpecDocId] = useState(null);
  const [currentPoId, setCurrentPoId] = useState("po-ps1500-001");
  const [runningCheck, setRunningCheck] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedNcr, setSelectedNcr] = useState(null);
  const [status, setStatus] = useState("");
  const [equipmentList, setEquipmentList] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .getEquipmentItems()
      .then((data) => setEquipmentList(data.equipment_items || []))
      .catch(() => {});
  }, []);

  // ORIGINAL API LOGIC
  async function handleSpecUpload() {
    if (!specFile) return;
    const formData = new FormData();
    formData.append("file", specFile);
    try {
      setUploadingSpec(true);
      setError(null);
      setStatus("Extracting and parsing specification...");
      const data = await api.uploadSpecification(formData);
      setSpecDocId(data.document_id);
      setStatus(`✓ Specification ready — ${data.clauses_extracted} clauses extracted`);
    } catch (err) {
      setError(err.message);
      setStatus("");
    } finally {
      setUploadingSpec(false);
    }
  }

  async function handleSubmittalUpload() {
    if (!submFile || !vendorName || !poNumber) {
      setError("Please provide submittal file, vendor name, and PO number");
      return;
    }
    const formData = new FormData();
    formData.append("file", submFile);
    formData.append("vendor_name", vendorName);
    formData.append("po_number", poNumber);
    formData.append("equipment_item_id", equipmentItemId);
    try {
      setUploadingSubm(true);
      setError(null);
      setStatus("Parsing vendor submittal attributes...");
      const data = await api.uploadSubmittal(formData);
      setCurrentPoId(data.po_id);
      setStatus(`✓ Submittal ready — ${data.attributes_extracted} attributes extracted`);
    } catch (err) {
      setError(err.message);
      setStatus("");
    } finally {
      setUploadingSubm(false);
    }
  }

  async function handleRunCheck() {
    if (!currentPoId) {
      setError("No purchase order to check. Upload a submittal first or use seeded PO.");
      return;
    }
    try {
      setRunningCheck(true);
      setError(null);
      setSelectedNcr(null);
      setStatus("Running Spec Compliance Agent...");
      const data = await api.runComplianceCheck(currentPoId);
      setResults(data);
      setStatus(`✓ Check complete — ${data.summary?.total || 0} deviations found`);
    } catch (err) {
      setError(err.message);
      setStatus("");
    } finally {
      setRunningCheck(false);
    }
  }

  // Determine Workflow State
  const specCompleted = !!specDocId;
  const submCompleted = submFile && currentPoId !== "po-ps1500-001" && !uploadingSubm && status.includes("Submittal ready");
  const step2Active = specCompleted;
  const step3Active = specCompleted && (submCompleted || currentPoId === "po-ps1500-001"); // Allow default PO if seeded

  return (
    <div className="min-h-screen relative pb-24">
      <ComplianceBackground />
      
      <div className="max-w-7xl mx-auto px-4 pt-12 relative z-10">
        
        {/* ─── Hero Section ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-200 bg-teal-50/80 backdrop-blur-sm mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-teal-700">Workspace</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            Compliance Intelligence
          </h1>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl">
            Compare project specifications with vendor submissions using AI to instantly identify deviations, ensure compliance and generate intelligent recommendations.
          </p>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Documents Processed", val: 124, icon: <FileText size={18} /> },
              { label: "Compliance Accuracy", val: 98, suffix: "%", icon: <CheckCircle size={18} /> },
              { label: "Critical Deviations", val: results?.summary?.critical || 3, icon: <ShieldAlert size={18} /> },
              { label: "AI Status", val: "Online", icon: <Activity size={18} /> }
            ].map((kpi, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -2 }}
                className="bg-white/60 backdrop-blur-md border border-white/40 p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
              >
                <div className="text-teal-600 mb-2">{kpi.icon}</div>
                <div className="text-2xl font-bold text-slate-800"><AnimatedCounter value={kpi.val} suffix={kpi.suffix} /></div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{kpi.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Global Error/Status Toast */}
        <AnimatePresence>
          {(error || status) && !runningCheck && !uploadingSpec && !uploadingSubm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`mb-8 p-4 rounded-xl border backdrop-blur-md font-medium text-sm shadow-sm ${
                error ? "bg-red-50/80 border-red-200 text-red-700" : "bg-teal-50/80 border-teal-200 text-teal-700"
              }`}
            >
              {error || status}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ─── Left Panel: 3-Step Workflow ───────────────────────────── */}
          <div className="lg:col-span-4 space-y-6 relative">
            {/* Connecting progress line */}
            <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-slate-200/50 z-0" />
            
            <ComplianceUploadCard 
              stepNumber="1"
              title="Upload Specification"
              description="Master requirements document"
              color="#3B82F6"
              file={specFile}
              setFile={setSpecFile}
              onUpload={handleSpecUpload}
              isUploading={uploadingSpec}
              isActive={true}
              isCompleted={specCompleted}
            />

            <ComplianceUploadCard 
              stepNumber="2"
              title="Vendor Submission"
              description="Submittal PDF to compare against spec"
              color="#8B5CF6"
              file={submFile}
              setFile={setSubmFile}
              onUpload={handleSubmittalUpload}
              isUploading={uploadingSubm}
              isActive={step2Active}
              isCompleted={submCompleted}
            >
              <div className="grid grid-cols-2 gap-3 mt-2">
                <input
                  type="text"
                  placeholder="Vendor Name"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="bg-white/60 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 w-full"
                />
                <input
                  type="text"
                  placeholder="PO Number"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="bg-white/60 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 w-full"
                />
              </div>
              <select
                value={equipmentItemId}
                onChange={(e) => setEquipmentItemId(e.target.value)}
                className="bg-white/60 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 w-full mt-1"
              >
                {equipmentList.length === 0 ? (
                  <option value="eq-ups-moda-001">EQ-UPS-MODA-001 (default)</option>
                ) : (
                  equipmentList.map((eq) => <option key={eq.id} value={eq.id}>{eq.item_code} — {eq.description}</option>)
                )}
              </select>
            </ComplianceUploadCard>

            <motion.div 
              className={`relative z-10 transition-all duration-300 ${!step3Active ? "opacity-40 pointer-events-none" : ""}`}
            >
              <button
                onClick={handleRunCheck}
                disabled={runningCheck || !step3Active}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <Play fill="currentColor" size={20} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">Run AI Compliance</h3>
                  <p className="text-slate-400 text-xs font-medium">Extract, compare, and analyze</p>
                </div>
              </button>
            </motion.div>
          </div>

          {/* ─── Center Panel: Results Dashboard ───────────────────────── */}
          <div className="lg:col-span-5 relative">
            <AnimatePresence mode="wait">
              {runningCheck ? (
                <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, filter: "blur(10px)" }}>
                  <AIProcessingTimeline />
                </motion.div>
              ) : results ? (
                <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  
                  {/* Results Header Card */}
                  <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-xl">
                          {results.compliance_status === "COMPLIANT" ? "A+" : "C"}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-800">Compliance Report</h2>
                          <p className="text-sm text-slate-500">PO: {results.po_number}</p>
                        </div>
                      </div>
                      <SeverityBadge severity={results.compliance_status === "COMPLIANT" ? "PASS" : "CRITICAL"} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-red-500">{results.summary?.critical || 0}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 mt-1">Critical</div>
                      </div>
                      <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-amber-500">{results.summary?.major || 0}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mt-1">Major</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-slate-500">{results.summary?.minor || 0}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Minor</div>
                      </div>
                    </div>
                  </div>

                  {/* Deviations List */}
                  {results.deviations && results.deviations.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-700 text-sm pl-2 uppercase tracking-wider">Detected Deviations</h3>
                      {results.deviations.map((dev, idx) => (
                        <motion.div 
                          key={dev.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          onClick={() => setSelectedNcr(dev.ncr_id ? dev : null)}
                          className={`bg-white/80 backdrop-blur-md border rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${
                            selectedNcr?.id === dev.id ? "ring-2 ring-blue-400 border-transparent shadow-lg" : "border-slate-200"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="font-mono text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-600">
                              {dev.clause_number || "CLAUSE-UNK"}
                            </div>
                            <SeverityBadge severity={dev.severity} />
                          </div>
                          <h4 className="font-bold text-slate-800 mb-2">{dev.attribute_name?.replace(/_/g, " ")}</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Specified</span>
                              <span className="text-slate-700 font-medium">{dev.specified_value}</span>
                            </div>
                            <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                              <span className="text-[10px] text-red-400 font-bold uppercase block mb-1">Submitted</span>
                              <span className="text-red-700 font-medium">{dev.submitted_value}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-teal-50/50 border border-teal-100 rounded-3xl p-8 text-center">
                      <CheckCircle className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-teal-800">100% Compliant</h3>
                      <p className="text-teal-600 mt-2">No deviations found in this submission.</p>
                    </div>
                  )}

                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[400px] flex items-center justify-center bg-white/30 backdrop-blur-sm border border-white/40 rounded-3xl border-dashed">
                  <div className="text-center opacity-50">
                    <Box size={48} className="mx-auto mb-4 text-slate-400" />
                    <p className="text-lg font-medium text-slate-500">Workspace Ready</p>
                    <p className="text-sm text-slate-400">Complete the workflow on the left</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Right Panel: Intelligence Viewer ──────────────────────── */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col h-[700px]">
              {/* Fake PDF Toolbar */}
              <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs font-mono text-slate-400">AI Document Viewer</span>
              </div>
              
              {/* Document Content */}
              <div className="flex-1 p-6 relative overflow-hidden bg-slate-100">
                {!selectedNcr ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
                    <FileText size={40} className="mb-4 opacity-50" />
                    <p className="text-sm font-medium">Select a deviation to view AI insights and source citations.</p>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col">
                    {/* Mocked PDF text showing highlight */}
                    <div className="bg-white rounded shadow-sm p-4 text-[10px] leading-relaxed text-slate-300 font-serif relative overflow-hidden h-48 mb-4 border border-slate-200">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      <br/><br/>
                      <span className="bg-yellow-200/50 text-slate-800 font-bold px-1 rounded relative inline-block">
                        {selectedNcr.clause_number}: {selectedNcr.specified_value}
                        <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -left-1 -right-1 -top-1 -bottom-1 border border-yellow-400 rounded pointer-events-none" />
                      </span>
                      <br/><br/>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </div>

                    {/* AI Insights Panel */}
                    <div className="flex-1 bg-slate-800 rounded-2xl p-5 text-white shadow-inner flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <h4 className="font-bold text-sm">AI Insights</h4>
                      </div>
                      
                      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar text-sm">
                        <div>
                          <span className="text-slate-400 text-xs block mb-1">Deviation Rationale</span>
                          <p className="text-slate-200">{selectedNcr.justification}</p>
                        </div>
                        
                        <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-xl">
                          <span className="text-blue-300 text-xs font-bold uppercase tracking-wider block mb-1">Recommendation</span>
                          <p className="text-blue-100">{selectedNcr.recommended_action}</p>
                        </div>

                        <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl">
                          <span className="text-slate-400 text-xs">AI Confidence</span>
                          <span className="font-bold text-green-400">{(selectedNcr.w_conform * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => navigate(`/ncr/${selectedNcr.ncr_id}`)}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                      >
                        Open Full NCR
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
