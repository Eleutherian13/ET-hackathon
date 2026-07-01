import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Reveal, SectionLabel, AnimCounter } from "./overviewUtils";
import { Cpu } from "lucide-react";

// ─── Animated blueprint architecture visualization ────────────────────────────
function BlueprintViz() {
  const nodes = [
    { id: "specs",      label: "Specifications",    x: 50,  y: 10,  color: "#3B82F6" },
    { id: "vendor",     label: "Vendor Documents",  x: 50,  y: 30,  color: "#8B5CF6" },
    { id: "ai",         label: "AI Engine",          x: 50,  y: 52,  color: "#14B8A6", large: true },
    { id: "compliance", label: "Compliance",         x: 18,  y: 76,  color: "#22C55E" },
    { id: "schedule",   label: "Schedule Risk",      x: 50,  y: 80,  color: "#F59E0B" },
    { id: "dashboard",  label: "Dashboard",          x: 82,  y: 76,  color: "#14B8A6" },
  ];
  const edges = [
    ["specs", "ai"], ["vendor", "ai"],
    ["ai", "compliance"], ["ai", "schedule"], ["ai", "dashboard"],
  ];

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <div className="relative w-full" style={{ height: 360, background: "linear-gradient(135deg, #F0F9FF 0%, #F8FAFC 100%)", borderRadius: 20, border: "1px solid #E2E8F0", overflow: "hidden" }}>
      {/* Blueprint grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(to right,rgba(148,163,184,0.08) 1px,transparent 1px),linear-gradient(to bottom,rgba(148,163,184,0.08) 1px,transparent 1px)",
        backgroundSize: "28px 28px"
      }} />
      {/* Glow center */}
      <div className="absolute" style={{ top: "40%", left: "35%", width: 180, height: 180, background: "radial-gradient(circle,rgba(20,184,166,0.12) 0%,transparent 70%)", transform: "translate(-50%,-50%)" }} />

      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {edges.map(([a, b], i) => {
          const na = nodeMap[a], nb = nodeMap[b];
          return (
            <motion.line
              key={i}
              x1={`${na.x}%`} y1={`${na.y + 4}%`}
              x2={`${nb.x}%`} y2={`${nb.y - 4}%`}
              stroke={na.color} strokeWidth="1.5" strokeDasharray="4 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 1.2, delay: 0.4 + i * 0.2, ease: "easeOut" }}
            />
          );
        })}
        {/* Traveling dots on edges */}
        {edges.map(([a, b], i) => {
          const na = nodeMap[a], nb = nodeMap[b];
          return (
            <motion.circle
              key={`dot-${i}`}
              r="3" fill={na.color}
              animate={{
                cx: [`${na.x}%`, `${nb.x}%`],
                cy: [`${na.y + 4}%`, `${nb.y - 4}%`],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 + i * 0.4, ease: "easeInOut", repeatDelay: 1 }}
            />
          );
        })}
      </svg>

      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ position: "absolute", left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <motion.div
            animate={{ y: [0, node.large ? -5 : -3, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
              style={{
                width: node.large ? 52 : 36,
                height: node.large ? 52 : 36,
                background: `linear-gradient(135deg, ${node.color}dd, ${node.color})`,
                boxShadow: `0 4px 16px ${node.color}44`,
              }}
            >
              {node.large ? <Cpu strokeWidth={1.5} size={28} className="text-white" /> : "●"}
            </div>
            <span className="text-[9px] font-semibold text-slate-500 whitespace-nowrap">{node.label}</span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Section 1: The Intelligence Behind Every Project ─────────────────────────
export default function Section1() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-24">
      <Reveal className="text-center mb-16">
        <SectionLabel text="Platform Overview" />
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto" style={{ fontFamily: "'Inter',sans-serif" }}>
          The Intelligence Behind<br />Every Project
        </h2>
        <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
          DCPI transforms engineering documents into real-time project intelligence using AI-driven compliance analysis, schedule prediction, quality management and RFI assistance.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: heading + stats */}
        <div className="space-y-10">
          <Reveal delay={0.1}>
            <h3 className="text-2xl font-bold text-slate-900 leading-snug">
              One platform. Every engineering intelligence need.
            </h3>
            <p className="text-slate-500 mt-3 leading-relaxed text-sm">
              From specification ingestion to executive dashboards — DCPI connects every stage of your EPC workflow through a single AI intelligence layer that learns, reasons, and responds in real time.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-6">
            {[
              { val: 98,  suf: "%", label: "Compliance accuracy"   },
              { val: 40,  suf: "%", label: "Less manual review"    },
              { val: 3,   suf: "×", label: "Faster decisions"      },
              { val: 24,  suf: "/7",label: "AI availability"       },
            ].map(({ val, suf, label }, i) => (
              <Reveal key={i} delay={0.2 + i * 0.1}>
                <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Inter',sans-serif" }}>
                    <AnimCounter to={val} suffix={suf} delay={0.4 + i * 0.1} />
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">{label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Right: animated visualization */}
        <Reveal delay={0.15}>
          <BlueprintViz />
        </Reveal>
      </div>
    </section>
  );
}
