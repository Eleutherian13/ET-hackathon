import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Reveal, SectionLabel, AnimCounter } from "./overviewUtils";
import { FileText, Package, Cpu, ShieldCheck, TrendingUp, MessageSquareText, LayoutDashboard } from "lucide-react";

// ─── Flow Pipeline Node ────────────────────────────────────────────────────────
function FlowNode({ icon, label, delay = 0, isLast = false, color = "#14B8A6", large = false }) {
  return (
    <div className="flex flex-col items-center relative w-full">
      <Reveal delay={delay} className="z-10">
        <motion.div
          whileHover={{ scale: 1.05, boxShadow: `0 10px 30px -10px ${color}` }}
          className={`flex items-center gap-4 bg-white/80 backdrop-blur-xl border border-white/60 p-4 rounded-2xl shadow-sm relative overflow-hidden`}
          style={{ width: large ? 320 : 280, boxShadow: large ? `0 0 0 2px ${color}40, 0 10px 40px -10px ${color}60` : undefined }}
        >
          {/* Subtle animated gradient background for large nodes */}
          {large && (
            <motion.div
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: `linear-gradient(120deg, transparent, ${color}20, transparent)` }}
            />
          )}
          <div className="flex items-center justify-center p-2 rounded-xl" style={{ backgroundColor: `${color}10`, color: color }}>
            {icon}
          </div>
          <div className="font-semibold text-slate-800 text-sm">{label}</div>
        </motion.div>
      </Reveal>

      {!isLast && (
        <div className="h-16 w-12 relative flex justify-center py-2">
          {/* SVG Line that draws itself */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <motion.line
              x1="50%" y1="0%" x2="50%" y2="100%"
              stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 1, delay: delay + 0.2 }}
            />
          </svg>
          {/* Traveling particle */}
          <motion.div
            className="absolute left-1/2 -ml-1 w-2 h-2 rounded-full z-20"
            style={{ background: color, boxShadow: `0 0 10px ${color}` }}
            initial={{ top: "0%", opacity: 0 }}
            animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: delay + 0.5, ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Pipeline Section ──────────────────────────────────────────────────────────
function PipelineSection() {
  const steps = [
    { icon: <FileText strokeWidth={1.75} size={24} />, label: "Specification Documents", color: "#3B82F6" },
    { icon: <Package strokeWidth={1.75} size={24} />, label: "Vendor Submittals", color: "#8B5CF6" },
    { icon: <Cpu strokeWidth={1.75} size={32} />, label: "AI Intelligence Engine", color: "#14B8A6", large: true },
    { icon: <ShieldCheck strokeWidth={1.75} size={24} />, label: "Compliance Analysis", color: "#22C55E" },
    { icon: <TrendingUp strokeWidth={1.75} size={24} />, label: "Schedule Risk Intelligence", color: "#F59E0B" },
    { icon: <MessageSquareText strokeWidth={1.75} size={24} />, label: "RFI Intelligence", color: "#EF4444" },
    { icon: <LayoutDashboard strokeWidth={1.75} size={24} />, label: "Executive Dashboard", color: "#14B8A6" },
  ];

  return (
    <div className="py-32 relative">
      <div className="absolute inset-0 bg-slate-50/50" style={{ backgroundImage: "radial-gradient(#E2E8F0 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.5 }} />
      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <Reveal>
          <SectionLabel text="Workflow" />
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            How Intelligence Flows
          </h2>
          <p className="text-slate-500 mt-4 text-lg">
            Every engineering document becomes actionable intelligence through AI.
          </p>
        </Reveal>

        <div className="mt-20 flex flex-col items-center">
          {steps.map((step, i) => (
            <FlowNode key={i} {...step} delay={0.1 * i} isLast={i === steps.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Showcase Panels ───────────────────────────────────────────────────────────
function GlassPanel({ children, glowColor = "#14B8A6" }) {
  const ref = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative rounded-3xl border border-white/50 bg-white/40 p-6 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-md"
    >
      {/* Hover glow effect tracking mouse */}
      <motion.div
        className="absolute pointer-events-none rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          width: 300, height: 300,
          background: `radial-gradient(circle, ${glowColor}20 0%, transparent 70%)`,
          left: mousePos.x - 150, top: mousePos.y - 150,
        }}
      />
      {children}
    </motion.div>
  );
}

function ShowcaseRow({ label, title, description, panel, flip = false }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${flip ? "lg:[direction:rtl]" : ""}`}>
      <div className="lg:[direction:ltr]">
        <Reveal>
          <SectionLabel text={label} />
          <h3 className="text-3xl font-bold text-slate-900 mb-4 leading-snug">{title}</h3>
          <p className="text-slate-500 leading-relaxed text-lg">{description}</p>
        </Reveal>
      </div>
      <Reveal delay={0.2} className="lg:[direction:ltr] group">
        {panel}
      </Reveal>
    </div>
  );
}

// ─── The 4 specific showcase panels ─────────────────────────────────────────────
function ComplianceDashboard() {
  return (
    <GlassPanel glowColor="#22C55E">
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
          <span className="font-semibold text-slate-700">Clause Deviation Scan</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">PASS 98%</span>
        </div>
        {[
          { c: "Cooling Load §4.1", s: "Match", col: "text-green-600 bg-green-50" },
          { c: "UPS Harmonics §8.2", s: "Deviation Detected", col: "text-amber-600 bg-amber-50" },
          { c: "Fire Suppression §2.4", s: "Match", col: "text-green-600 bg-green-50" },
        ].map((row, i) => (
          <motion.div key={i} initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-white/60 shadow-sm">
            <span className="text-sm font-medium text-slate-700">{row.c}</span>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${row.col}`}>{row.s}</span>
          </motion.div>
        ))}
      </div>
    </GlassPanel>
  );
}

function ScheduleVisualization() {
  return (
    <GlassPanel glowColor="#F59E0B">
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
          <span className="font-semibold text-slate-700">Predictive Critical Path</span>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">14 Days at Risk</span>
        </div>
        <div className="relative h-32 mt-4 border-l-2 border-slate-200 ml-4 space-y-6">
          {[
            { label: "Site Prep", progress: "100%", color: "#22C55E", delay: 0 },
            { label: "MEP Delivery", progress: "60%", color: "#3B82F6", delay: 0.2 },
            { label: "Commissioning", progress: "20%", color: "#EF4444", delay: 0.4 },
          ].map((task, i) => (
            <motion.div key={i} className="relative pl-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: task.delay }}>
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full shadow-sm" style={{ background: task.color }} />
              <div className="text-xs font-semibold text-slate-700 mb-1">{task.label}</div>
              <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: task.progress }} viewport={{ once: true }} transition={{ duration: 1, delay: task.delay + 0.2 }} className="h-full rounded-full shadow-sm" style={{ background: task.color }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}

function AIChat() {
  return (
    <GlassPanel glowColor="#8B5CF6">
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
          <span className="font-semibold text-slate-700">Engineering Copilot</span>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold flex items-center gap-1"><span className="animate-pulse w-1.5 h-1.5 bg-purple-500 rounded-full inline-block"></span> Online</span>
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex justify-end mt-4">
          <div className="bg-slate-800 text-white text-xs p-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-md">What is the required chiller capacity?</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="flex justify-start mt-2">
          <div className="bg-white/80 border border-slate-200 text-slate-700 text-xs p-3 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm">
            <span className="font-bold text-teal-600 block mb-1">DCPI Intelligence</span>
            According to Mechanical Spec §3.2, the minimum N+1 chiller capacity is 1,200 RT per unit. Vendor submitted 1,150 RT.
          </div>
        </motion.div>
      </div>
    </GlassPanel>
  );
}

function QualityDashboard() {
  return (
    <GlassPanel glowColor="#3B82F6">
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
          <span className="font-semibold text-slate-700">Quality NCR Tracker</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">3 Open Critical</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-white/60 border border-white/40 p-4 rounded-xl text-center shadow-sm">
            <div className="text-3xl font-bold text-slate-800"><AnimCounter to={42} /></div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Total NCRs</div>
          </motion.div>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white/60 border border-white/40 p-4 rounded-xl text-center shadow-sm">
            <div className="text-3xl font-bold text-red-500"><AnimCounter to={3} /></div>
            <div className="text-[10px] text-red-500/70 font-semibold uppercase tracking-wider mt-1">Critical Priority</div>
          </motion.div>
        </div>
      </div>
    </GlassPanel>
  );
}

// ─── Divider Section ───────────────────────────────────────────────────────────
function LiveDashboardDivider() {
  return (
    <div className="pt-8 pb-8 max-w-4xl mx-auto px-4 text-center">
      <Reveal>
        <div className="flex items-center justify-center gap-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.8)]"
          />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        </div>
        <h2 className="text-4xl font-bold text-slate-900 mt-8 mb-4 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
          Live Project Dashboard
        </h2>
        <p className="text-slate-500 text-lg">
          Real-time metrics and intelligence for the active project phase.
        </p>
      </Reveal>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────
export default function ProductWalkthrough() {
  return (
    <div className="bg-slate-50/30 overflow-hidden border-t border-slate-200/50">
      <PipelineSection />

      <section className="max-w-6xl mx-auto px-4 pt-32 pb-16 space-y-32">
        <ShowcaseRow
          label="Automated Review"
          title="Detect compliance issues instantly."
          description="Upload thousands of pages of specifications. DCPI's AI embeddings cross-reference every vendor submittal to flag deviations before they become costly rework."
          panel={<ComplianceDashboard />}
          flip={false}
        />
        <ShowcaseRow
          label="Risk Mitigation"
          title="See schedule delays before they happen."
          description="By analyzing historical delays and live vendor updates, the predictive engine identifies critical path risks so you can resequence work proactively."
          panel={<ScheduleVisualization />}
          flip={true}
        />
        <ShowcaseRow
          label="Knowledge Graph"
          title="Your project's technical copilot."
          description="Stop digging through PDFs. Ask complex engineering questions and get instantly cited answers backed by your project's unique specification corpus."
          panel={<AIChat />}
          flip={false}
        />
        <ShowcaseRow
          label="Quality Control"
          title="Resolve NCRs with unprecedented speed."
          description="Track every Non-Conformance Report with AI-generated root cause analysis and automated resolution workflows seamlessly tied to your project health."
          panel={<QualityDashboard />}
          flip={true}
        />
      </section>

      <LiveDashboardDivider />
    </div>
  );
}
