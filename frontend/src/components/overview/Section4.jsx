import { motion } from "framer-motion";
import { Reveal, SectionLabel, AnimCounter } from "./overviewUtils";
import { ShieldCheck, Zap, TrendingUp, Bot } from "lucide-react";

const metrics = [
  { val: 98,  suf: "%", label: "Compliance Accuracy",     color: "#22C55E", icon: <ShieldCheck strokeWidth={1.75} size={28} /> },
  { val: 40,  suf: "%", label: "Reduced Manual Review",   color: "#14B8A6", icon: <Zap strokeWidth={1.75} size={28} /> },
  { val: 3,   suf: "×", label: "Faster Decision Making",  color: "#3B82F6", icon: <TrendingUp strokeWidth={1.75} size={28} /> },
  { val: 24,  suf: "/7",label: "AI Knowledge Assistant",  color: "#8B5CF6", icon: <Bot strokeWidth={1.75} size={28} /> },
];

function GlassMetricCard({ val, suf, label, color, icon, delay }) {
  return (
    <Reveal delay={delay}>
      <motion.div
        whileHover={{ y: -8, boxShadow: `0 20px 40px ${color}22` }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-8 text-center cursor-default"
        style={{ backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)" }}
      >
        {/* Moving shimmer reflection */}
        <motion.div
          animate={{ x: ["-120%", "220%"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: delay + 1 }}
          className="absolute top-0 left-0 w-1/3 h-full pointer-events-none"
          style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.55) 50%,transparent 60%)" }}
        />
        {/* Glow orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-2xl opacity-20"
          style={{ background: color }} />

        <div className="mb-3 flex items-center justify-center p-3 rounded-2xl mx-auto inline-flex" style={{ backgroundColor: `${color}15`, color: color }}>
          {icon}
        </div>
        <div className="text-5xl font-bold tracking-tight mb-2" style={{ color, fontFamily: "'Inter',sans-serif" }}>
          <AnimCounter to={val} suffix={suf} delay={delay + 0.3} />
        </div>
        <div className="text-sm font-medium text-slate-500">{label}</div>

        {/* Bottom accent bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.4, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
      </motion.div>
    </Reveal>
  );
}

export default function Section4() {
  return (
    <section className="py-24" style={{ background: "linear-gradient(180deg,#F8FAFC 0%,#EEF2FF 100%)" }}>
      <div className="max-w-6xl mx-auto px-4">
        <Reveal className="text-center mb-16">
          <SectionLabel text="Enterprise Benefits" />
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Inter',sans-serif" }}>
            Measurable Results
          </h2>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto">
            DCPI delivers enterprise-grade AI intelligence with outcomes you can present to any board.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <GlassMetricCard key={i} {...m} delay={i * 0.12} />
          ))}
        </div>
      </div>
    </section>
  );
}
