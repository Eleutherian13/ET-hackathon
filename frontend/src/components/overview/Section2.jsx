import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Reveal, SectionLabel } from "./overviewUtils";
import { FileText, Package, Cpu, ShieldCheck, TrendingUp, MessageSquareText, LayoutDashboard } from "lucide-react";

const pipeline = [
  { icon: <FileText strokeWidth={1.75} size={24} />, label: "Specification Documents", color: "#3B82F6",  desc: "Uploaded & indexed" },
  { icon: <Package strokeWidth={1.75} size={24} />, label: "Vendor Submittals",        color: "#8B5CF6",  desc: "Compared against specs" },
  { icon: <Cpu strokeWidth={1.75} size={32} />, label: "AI Intelligence Engine",   color: "#14B8A6",  desc: "Analyzes & reasons",  large: true },
  { icon: <ShieldCheck strokeWidth={1.75} size={24} />, label: "Compliance Analysis",       color: "#22C55E",  desc: "Deviations detected" },
  { icon: <TrendingUp strokeWidth={1.75} size={24} />, label: "Schedule Risk Prediction",  color: "#F59E0B",  desc: "Delays forecasted"   },
  { icon: <MessageSquareText strokeWidth={1.75} size={24} />, label: "RFI Knowledge Base",        color: "#EF4444",  desc: "Questions answered"  },
  { icon: <LayoutDashboard strokeWidth={1.75} size={24} />, label: "Executive Dashboard",        color: "#14B8A6",  desc: "Live intelligence"  },
];

export default function Section2() {
  return (
    <section className="py-24 overflow-hidden" style={{ background: "linear-gradient(180deg,#F8FAFC 0%,#EFF6FF 50%,#F8FAFC 100%)" }}>
      <div className="max-w-6xl mx-auto px-4">
        <Reveal className="text-center mb-16">
          <SectionLabel text="Intelligence Pipeline" />
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Inter',sans-serif" }}>
            How Intelligence Flows
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Every document you upload triggers a chain of intelligent processes. Watch the data travel.
          </p>
        </Reveal>

        {/* Horizontal scrollable pipeline on mobile, row on desktop */}
        <div className="flex flex-col items-center gap-0">
          {pipeline.map((step, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="flex flex-col items-center">
                {/* Node card */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative flex flex-col items-center text-center px-6 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm w-64"
                  style={{ boxShadow: step.large ? `0 0 0 2px ${step.color}40, 0 8px 24px ${step.color}18` : undefined }}
                >
                  {/* Shimmer sweep on hover */}
                  <div className="mb-3 flex items-center justify-center p-2 rounded-xl" style={{ backgroundColor: `${step.color}10`, color: step.color }}>
                    {step.icon}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{step.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{step.desc}</div>

                  {/* Pulsing dot for active nodes */}
                  {step.large && (
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -right-1.5 -top-1.5 w-4 h-4 rounded-full"
                      style={{ background: step.color }}
                    />
                  )}
                </motion.div>

                {/* Connector arrow between nodes */}
                {i < pipeline.length - 1 && (
                  <div className="flex flex-col items-center my-1">
                    {/* Animated traveling dot */}
                    <div className="relative w-px h-8 bg-slate-200 overflow-visible">
                      <motion.div
                        animate={{ y: ["0%", "100%"], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                        style={{ background: pipeline[i].color }}
                      />
                    </div>
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M4 6L0 0h8L4 6z" fill="#CBD5E1" />
                    </svg>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
