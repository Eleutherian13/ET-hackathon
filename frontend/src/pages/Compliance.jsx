import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Compliance() {
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
  const navigate = useNavigate();

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
      setStatus(
        `✓ Specification ready — ${data.clauses_extracted} clauses extracted`,
      );
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
      setStatus(
        `✓ Submittal ready — ${data.attributes_extracted} attributes extracted`,
      );
    } catch (err) {
      setError(err.message);
      setStatus("");
    } finally {
      setUploadingSubm(false);
    }
  }

  async function handleRunCheck() {
    if (!currentPoId) {
      setError(
        "No purchase order to check. Upload a submittal first or use seeded PO.",
      );
      return;
    }
    try {
      setRunningCheck(true);
      setError(null);
      setSelectedNcr(null);
      setStatus("Running Spec Compliance Agent...");
      const data = await api.runComplianceCheck(currentPoId);
      setResults(data);
      setStatus(
        `✓ Check complete — ${data.summary?.total || 0} deviations found`,
      );
    } catch (err) {
      setError(err.message);
      setStatus("");
    } finally {
      setRunningCheck(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Specification Compliance
      </h1>

      <div className="flex gap-6">
        {/* Left panel — Upload */}
        <div className="w-80 flex-shrink-0 space-y-4">
          {/* Spec upload */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-700 mb-3">
              1. Specification PDF
            </h2>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSpecFile(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            {specFile && (
              <p className="text-xs text-slate-500 mt-1 truncate">
                {specFile.name}
              </p>
            )}
            <button
              onClick={handleSpecUpload}
              disabled={!specFile || uploadingSpec}
              className="mt-3 w-full bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {uploadingSpec ? "Uploading..." : "Upload Specification"}
            </button>
          </div>

          {/* Submittal upload */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-700 mb-3">
              2. Vendor Submittal PDF
            </h2>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSubmFile(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            {submFile && (
              <p className="text-xs text-slate-500 mt-1 truncate">
                {submFile.name}
              </p>
            )}
            <input
              type="text"
              placeholder="Vendor name"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <input
              type="text"
              placeholder="PO number"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button
              onClick={handleSubmittalUpload}
              disabled={!submFile || uploadingSubm}
              className="mt-3 w-full bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {uploadingSubm ? "Uploading..." : "Upload Submittal"}
            </button>
          </div>

          {/* Run check */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-700 mb-2">
              3. Run Compliance Check
            </h2>
            <p className="text-xs text-slate-400 mb-3">
              Using PO:{" "}
              <code className="bg-slate-100 px-1 rounded">{currentPoId}</code>
            </p>
            <button
              onClick={handleRunCheck}
              disabled={runningCheck}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              {runningCheck ? "Running Agent..." : "Run Compliance Check"}
            </button>
          </div>

          {/* Status */}
          {(status || error) && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700 border border-red-200" : "bg-teal-50 text-teal-700 border border-teal-200"}`}
            >
              {error || status}
            </div>
          )}
        </div>

        {/* Right panel — Results */}
        <div className="flex-1 min-w-0">
          {runningCheck ? (
            <LoadingSpinner message="Spec Compliance Agent running — comparing requirements..." />
          ) : results ? (
            <div className="space-y-4">
              {/* Summary bar */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <SeverityBadge
                      severity={
                        results.compliance_status === "COMPLIANT"
                          ? "PASS"
                          : "CRITICAL"
                      }
                    />
                    <span className="font-semibold text-slate-700">
                      {results.vendor_name || "Vendor"}
                    </span>
                    <span className="text-slate-400 text-sm">·</span>
                    <span className="text-slate-500 text-sm">
                      {results.po_number}
                    </span>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span className="text-red-600 font-semibold">
                      {results.summary?.critical || 0} CRITICAL
                    </span>
                    <span className="text-orange-500 font-semibold">
                      {results.summary?.major || 0} MAJOR
                    </span>
                    <span className="text-amber-600 font-semibold">
                      {results.summary?.minor || 0} MINOR
                    </span>
                  </div>
                </div>
              </div>

              {/* Deviations table */}
              {results.deviations && results.deviations.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">
                          Attribute
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">
                          Specified
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">
                          Submitted
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">
                          Deviation
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">
                          Severity
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">
                          NCR
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {results.deviations.map((dev) => (
                        <tr
                          key={dev.id}
                          onClick={() =>
                            setSelectedNcr(dev.ncr_id ? { ...dev } : null)
                          }
                          className={`cursor-pointer transition-colors ${
                            dev.severity === "CRITICAL"
                              ? "bg-red-50 hover:bg-red-100"
                              : dev.severity === "MAJOR"
                                ? "bg-orange-50 hover:bg-orange-100"
                                : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-slate-700">
                            {dev.attribute_name?.replace(/_/g, " ")}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {dev.specified_value}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {dev.submitted_value}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {dev.deviation_pct != null
                              ? `${dev.deviation_pct.toFixed(1)}%`
                              : "Mismatch"}
                          </td>
                          <td className="px-4 py-3">
                            <SeverityBadge severity={dev.severity} />
                          </td>
                          <td className="px-4 py-3">
                            {dev.ncr_id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/ncr/${dev.ncr_id}`);
                                }}
                                className="text-teal-600 hover:text-teal-800 text-xs underline"
                              >
                                View NCR
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <p className="text-green-700 font-semibold">
                    ✓ All requirements compliant
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    No deviations detected
                  </p>
                </div>
              )}

              {/* NCR inline panel */}
              {selectedNcr && selectedNcr.ncr_id && (
                <div className="bg-slate-800 text-white rounded-xl shadow-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <SeverityBadge severity={selectedNcr.severity} />
                      <h3 className="font-semibold mt-2 text-lg">
                        {selectedNcr.attribute_name
                          ?.replace(/_/g, " ")
                          .toUpperCase()}{" "}
                        — Non-Conformance
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedNcr(null)}
                      className="text-slate-400 hover:text-white text-xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-slate-400">Specified:</span>
                      <span className="ml-2 font-semibold text-green-400">
                        {selectedNcr.specified_value}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Submitted:</span>
                      <span className="ml-2 font-semibold text-red-400">
                        {selectedNcr.submitted_value}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Clause:</span>
                      <span className="ml-2">{selectedNcr.clause_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">W_conform:</span>
                      <span className="ml-2">
                        {(selectedNcr.w_conform * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-300 mb-3">
                    {selectedNcr.justification}
                  </div>
                  <div className="bg-slate-700 rounded p-3 text-sm">
                    <span className="text-slate-400 font-semibold">
                      Recommended Action:{" "}
                    </span>
                    {selectedNcr.recommended_action}
                  </div>
                  <button
                    onClick={() => navigate(`/ncr/${selectedNcr.ncr_id}`)}
                    className="mt-3 text-teal-400 hover:text-teal-200 text-sm underline"
                  >
                    View Full NCR →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 h-64">
              <EmptyState
                title="No compliance results yet"
                description="Upload a specification and vendor submittal, then click Run Compliance Check"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
