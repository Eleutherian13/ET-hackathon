import { motion } from "framer-motion";
import { Reveal, SectionLabel } from "./overviewUtils";

// ─── Animated compliance panel ─────────────────────────────────────────────
function CompliancePanel() {
  const rows = [
    { spec: "ISO 27001 §6.2", status: "PASS", pct: 96 },
    { spec: "MEP Cooling Spec §4.3", status: "FAIL", pct: 62 },
    { spec: "Tier III Uptime §2.1", status: "PASS", pct: 99 },
    { spec: "UPS Efficiency §8.1", status: "WARN", pct: 78 },
    { spec: "Cable Tray §5.7", status: "PASS", pct: 94 },
  ];
  const colors = { PASS: "#22C55E", FAIL: "#EF4444", WARN: "#F59E0B" };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-premium overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <span className="text-sm font-semibold text-slate-700">Compliance Analysis</span>
        <div className="flex items-center gap-1.5">
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {rows.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <div className="flex-1">
              <div className="text-xs font-medium text-slate-700 mb-1">{row.spec}</div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${row.pct}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{ background: colors[row.status] }}
                />
              </div>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: colors[row.status], background: `${colors[row.status]}18` }}
            >
              {row.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Animated schedule timeline ───────────────────────────────────────────────
function SchedulePanel() {
  const tasks = [
    { label: "Site Preparation",     start: 0,  width: 25, risk: 0.1 },
    { label: "MEP Installation",     start: 20, width: 40, risk: 0.8 },
    { label: "UPS Commissioning",    start: 35, width: 35, risk: 0.6 },
    { label: "Cooling System Test",  start: 55, width: 30, risk: 0.3 },
    { label: "IT Infrastructure",    start: 65, width: 25, risk: 0.9 },
  ];
  const riskColor = (r) => r >= 0.7 ? "#EF4444" : r >= 0.5 ? "#F59E0B" : "#22C55E";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-premium overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-700">Schedule Risk Analysis</span>
        <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-semibold">AI Predicted</span>
      </div>
      <div className="p-4 space-y-3">
        {tasks.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="text-[10px] text-slate-500 w-32 flex-shrink-0 truncate">{t.label}</div>
            <div className="flex-1 relative h-5 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${t.width}%` }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-0 bottom-0 rounded-lg"
                style={{
                  left: `${t.start}%`,
                  background: riskColor(t.risk),
                  opacity: 0.75,
                }}
              />
            </div>
            <span className="text-[10px] font-semibold w-8 text-right" style={{ color: riskColor(t.risk) }}>
              {Math.round(t.risk * 100)}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Animated RFI chat panel ──────────────────────────────────────────────────
function RFIPanel() {
  const messages = [
    { role: "user", text: "What are the THDi compliance requirements for this UPS?" },
    { role: "ai",   text: "Per Spec §8.1: THDi must not exceed 5% at full load. Current vendor submission shows 8.2% — flagged as non-compliant.", conf: 94 },
    { role: "user", text: "Has this been raised as an RFI before?" },
    { role: "ai",   text: "Yes — RFI-024 (2024-03-12): Similar deviation resolved by specifying input filter installation.", conf: 87 },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-premium overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
          <span className="text-[10px] text-white font-bold">AI</span>
        </div>
        <span className="text-sm font-semibold text-slate-700">RFI Intelligence</span>
      </div>
      <div className="p-4 space-y-3 max-h-56 overflow-y-auto">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.25, duration: 0.45 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "user" ? (
              <div className="bg-teal-600 text-white rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%] text-xs">
                {m.text}
              </div>
            ) : (
              <div className="bg-slate-50 border-l-2 border-teal-400 rounded-r-xl px-3 py-2 max-w-[85%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-teal-700">DCPI Intelligence</span>
                  <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">{m.conf}% confident</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{m.text}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Alternating showcase row ─────────────────────────────────────────────────
function ShowcaseRow({ label, title, description, panel, flip = false }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${flip ? "lg:[direction:rtl]" : ""}`}>
      <div className="lg:[direction:ltr]">
        <Reveal>
          <SectionLabel text={label} />
          <h3 className="text-2xl font-bold text-slate-900 mb-4 leading-snug">{title}</h3>
          <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
        </Reveal>
      </div>
      <Reveal delay={0.15} className="lg:[direction:ltr]">
        {panel}
      </Reveal>
    </div>
  );
}

// ─── Section 3: Platform Capabilities ────────────────────────────────────────
export default function Section3() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-24 space-y-24">
      <Reveal className="text-center">
        <SectionLabel text="Platform Capabilities" />
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Inter',sans-serif" }}>
          Every Capability. Live.
        </h2>
      </Reveal>

      <ShowcaseRow
        label="AI Compliance Intelligence"
        title="Detect deviations before they become NCRs"
        description="DCPI automatically compares every vendor submittal against your project specifications using AI embeddings. Clause-level deviations are flagged instantly with confidence scores, saving weeks of manual review."
        panel={<CompliancePanel />}
        flip={false}
      />

      <ShowcaseRow
        label="Schedule Risk Prediction"
        title="Know which tasks will delay your project — before they do"
        description="The AI analyzes float, predecessor chains, and historical project data to compute delay probability for every critical path task. Mitigation strategies are generated automatically."
        panel={<SchedulePanel />}
        flip={true}
      />

      <ShowcaseRow
        label="RFI Intelligence"
        title="Answer technical questions in seconds, not days"
        description="DCPI maintains a semantic knowledge base of all project specifications and historical RFIs. Engineers get accurate, cited answers instantly — with precedent matching from past projects."
        panel={<RFIPanel />}
        flip={false}
      />
    </section>
  );
}
