import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ScrollIndicator from "./ScrollIndicator";
import { ArrowRight, Zap } from "lucide-react";

// ─── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "", delay = 0, duration = 1.8 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const controls = animate(0, to, {
        duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setVal(Math.round(v)),
      });
      return () => controls.stop();
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [to, delay, duration]);
  return <>{val}{suffix}</>;
}

// ─── The neural-network SVG behind the panels ─────────────────────────────────
function NetworkSVG() {
  const nodes = [
    { cx: "20%",  cy: "28%" }, { cx: "50%",  cy: "12%" }, { cx: "80%",  cy: "30%" },
    { cx: "85%",  cy: "68%" }, { cx: "55%",  cy: "82%" }, { cx: "18%",  cy: "72%" },
    { cx: "50%",  cy: "50%" },
  ];
  const edges = [[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]];

  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50%" cy="50%" rx="45%" ry="40%" fill="url(#glow)" />
      {edges.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke="#14B8A6"
          strokeWidth="0.8"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.05, 0.25, 0.05] }}
          transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
        />
      ))}
      {nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.cx} cy={n.cy} r={i === 6 ? "5" : "3"}
          fill={i === 6 ? "#14B8A6" : "#3B82F6"}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0.3, i === 6 ? 1 : 0.7, 0.3], scale: [1, 1.4, 1] }}
          transition={{ duration: 3 + (i % 2), repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 4px ${i === 6 ? "#14B8A6" : "#3B82F6"})` }}
        />
      ))}
    </svg>
  );
}

// ─── Blueprint grid background ────────────────────────────────────────────────
function Grid() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, ease: "easeInOut" }}
      className="absolute inset-0 rounded-3xl overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(100,116,139,0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(100,116,139,0.08) 1px, transparent 1px)
        `,
        backgroundSize: "36px 36px",
      }}
    />
  );
}

// ─── Single intelligence panel ────────────────────────────────────────────────
function Panel({ children, delay, floatY = 10, x = 0, y = 0, rotate = 0, width = "w-56", glowColor = "#14B8A6", zIndex = 10 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.92, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "absolute", left: x, top: y, rotate, zIndex }}
      className={width}
    >
      <motion.div
        animate={{ y: [0, -floatY, 0] }}
        transition={{ duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.04, rotate: 0, transition: { duration: 0.25 } }}
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.6)",
          borderRadius: "16px",
          boxShadow: `0 8px 32px rgba(15,23,42,0.06), 0 0 0 0.5px rgba(255,255,255,0.8) inset, 0 1px 0 rgba(255,255,255,0.9) inset`,
        }}
      >
        {/* Moving highlight reflection */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: delay + 1 }}
          className="absolute top-0 left-0 w-1/3 h-full"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.45) 50%, transparent 60%)",
            borderRadius: "16px",
            pointerEvents: "none",
          }}
        />
        {/* Border glow */}
        <motion.div
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: delay + 0.5 }}
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `0 0 20px ${glowColor}30, inset 0 0 20px ${glowColor}08` }}
        />
        <div className="relative p-4">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// ─── Intelligence visualization ───────────────────────────────────────────────
function IntelligenceViz({ summary, healthScore }) {
  return (
    <div className="relative w-full h-full" style={{ minHeight: "480px" }}>
      <Grid />
      <NetworkSVG />

      {/* Ambient glows */}
      <div className="absolute top-[20%] left-[30%] w-64 h-64 rounded-full bg-[#14B8A6]/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[15%] right-[10%] w-48 h-48 rounded-full bg-[#3B82F6]/8 blur-3xl pointer-events-none" />

      {/* Panel 1 — Compliance Intelligence (top-left, slight tilt) */}
      <Panel delay={0.6} floatY={8} x="2%" y="4%" rotate={-2} width="w-52" glowColor="#14B8A6" zIndex={12}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[#14B8A6]/12 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L1 4v3c0 3.3 2.6 6.3 6 7 3.4-.7 6-3.7 6-7V4L7 1z" stroke="#14B8A6" strokeWidth="1.2" fill="none" />
              <path d="M4.5 7l1.8 1.8L9.5 5" stroke="#14B8A6" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold tracking-wide text-[#0F172A]">Compliance</span>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#22C55E]" style={{ boxShadow: "0 0 6px #22C55E" }} />
        </div>
        <div className="space-y-1.5">
          {["ISO 27001", "Tier III", "MEP Specs"].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: ["60%", "95%", "88%"][i] }}
                  transition={{ duration: 1.2, delay: 1.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-[#14B8A6]"
                />
              </div>
              <span className="text-[10px] text-[#64748B] w-6 text-right">{["60", "95", "88"][i]}%</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10px] text-[#64748B]">
          <Counter to={147} delay={1.4} /> checks run
        </div>
      </Panel>

      {/* Panel 2 — Schedule Risk (top-right, wider, slight positive tilt) */}
      <Panel delay={0.9} floatY={12} x="42%" y="1%" rotate={1.5} width="w-60" glowColor="#F59E0B" zIndex={11}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/12 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="1,10 4,6 7,8 10,3 13,5" stroke="#F59E0B" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold tracking-wide text-[#0F172A]">Schedule Risk</span>
          <span className="ml-auto text-[10px] font-medium text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded-full">Live</span>
        </div>
        {/* Mini sparkline */}
        <svg viewBox="0 0 100 30" className="w-full mb-2">
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,20 L15,16 L30,22 L45,12 L60,18 L75,8 L90,14 L100,10" stroke="#F59E0B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M0,20 L15,16 L30,22 L45,12 L60,18 L75,8 L90,14 L100,10 L100,30 L0,30Z" fill="url(#sg)" />
          <motion.circle
            cx="100" cy="10" r="2.5"
            fill="#F59E0B"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </svg>
        <div className="flex justify-between text-[10px] text-[#64748B]">
          <span><Counter to={summary?.at_risk_tasks || 12} delay={1.6} /> at-risk</span>
          <span>+3 predicted</span>
        </div>
      </Panel>

      {/* Panel 3 — Project Health (center-left, large, no tilt) */}
      <Panel delay={1.2} floatY={6} x="8%" y="46%" rotate={0} width="w-56" glowColor="#22C55E" zIndex={13}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#22C55E]/12 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="#22C55E" strokeWidth="1.2" />
              <path d="M4 7l2 2 4-4" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-[#0F172A]">Project Health</span>
        </div>
        {/* Circular arc indicator */}
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#E2E8F0" strokeWidth="5" />
              <motion.circle
                cx="28" cy="28" r="22"
                fill="none" stroke="#22C55E" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 22}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - (healthScore || 78) / 100) }}
                transition={{ duration: 1.4, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#0F172A]">
              <Counter to={healthScore || 78} suffix="%" delay={1.8} duration={1.4} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-[#64748B]">Critical NCRs</div>
            <div className="text-lg font-bold text-[#EF4444]">
              <Counter to={summary?.open_ncr_count?.CRITICAL || 3} delay={2.0} />
            </div>
            <div className="text-[10px] text-[#22C55E]">↓ 2 resolved</div>
          </div>
        </div>
      </Panel>

      {/* Panel 4 — RFI Intelligence (right, tilted) */}
      <Panel delay={1.5} floatY={14} x="45%" y="48%" rotate={-1} width="w-52" glowColor="#3B82F6" zIndex={10}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/12 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="10" rx="2" stroke="#3B82F6" strokeWidth="1.1" />
              <path d="M1 5h12" stroke="#3B82F6" strokeWidth="0.8" opacity="0.4" />
              <path d="M4 8.5h2M4 8.5L3 10l1.5-.5" stroke="#3B82F6" strokeWidth="1" strokeLinecap="round" />
              <circle cx="10.5" cy="8.5" r="1.5" stroke="#3B82F6" strokeWidth="0.9" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-[#0F172A]">RFI Intelligence</span>
        </div>
        {/* Mock chat bubbles */}
        <div className="space-y-2">
          <div className="bg-[#3B82F6]/8 rounded-xl rounded-tl-sm px-3 py-2 text-[10px] text-[#0F172A] max-w-[90%]">
            What are the cooling specs for Zone B?
          </div>
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.5 }}
            className="bg-[#14B8A6]/10 rounded-xl rounded-tr-sm px-3 py-2 text-[10px] text-[#0F172A] max-w-[90%] ml-auto"
          >
            Per Spec §4.3: N+1 CRAC units...
          </motion.div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[0.3, 0.5, 0.7].map((d, i) => (
              <motion.div key={i} animate={{ scaleY: [1, 2.5, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: d, ease: "easeInOut" }}
                className="w-0.5 h-2 bg-[#3B82F6]/60 rounded-full" />
            ))}
          </div>
          <span className="text-[10px] text-[#64748B]">AI answering…</span>
        </div>
      </Panel>
    </div>
  );
}

// ─── Hero logo mark ───────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        animate={{ boxShadow: ["0 0 0px rgba(20,184,166,0)", "0 0 24px rgba(20,184,166,0.35)", "0 0 0px rgba(20,184,166,0)"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0891b2] flex items-center justify-center shadow-md"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" opacity="0.95" />
          <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" opacity="0.55" />
          <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" opacity="0.55" />
          <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" opacity="0.95" />
        </svg>
      </motion.div>
      <div>
        <div className="text-sm font-bold tracking-tight text-[#0F172A]" style={{ fontFamily: "'Inter',sans-serif" }}>DCPI</div>
        <div className="text-[10px] text-[#64748B] tracking-widest uppercase">Intelligence Platform</div>
      </div>
    </div>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────
export default function DashboardHero({ summary, healthScore }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const opacity  = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const yOffset  = useTransform(scrollYProgress, [0, 1],    [0, -120]);
  const blurVal  = useTransform(scrollYProgress, [0, 0.5],  ["blur(0px)", "blur(8px)"]);

  const handleExplore = () => window.scrollTo({ top: window.innerHeight, behavior: "smooth" });

  // Headline words
  const words = ["The AI Engine", "for Data Centre", "Project Intelligence"];

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity, y: yOffset, filter: blurVal, background: "#F8FAFC" }}
      className="relative w-full min-h-screen flex items-center overflow-hidden"
    >
      {/* Blueprint grid full-page */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(100,116,139,0.055) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(100,116,139,0.055) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
        }}
      />
      {/* Corner soft glows */}
      <div className="absolute top-0 left-0 w-[50vw] h-[50vh] rounded-full bg-[#14B8A6]/4 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vh] rounded-full bg-[#3B82F6]/4 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-0 items-center pt-20 pb-12">

        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 relative z-20">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <LogoMark />
          </motion.div>

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-2 w-fit"
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#22C55E]"
              style={{ boxShadow: "0 0 8px #22C55E" }}
            />
            <span className="text-xs font-medium text-[#64748B] tracking-wide">AI Intelligence Active</span>
          </motion.div>

          {/* Headline */}
          <div>
            {words.map((line, lineIdx) => (
              <div key={lineIdx} className="overflow-hidden">
                <motion.div
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.75, delay: 0.45 + lineIdx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h1
                    className={`font-bold leading-[1.08] tracking-tight text-[#0F172A] ${
                      lineIdx === 0 ? "text-4xl sm:text-5xl lg:text-6xl" : "text-4xl sm:text-5xl lg:text-6xl"
                    } ${lineIdx === 2 ? "text-[#14B8A6]" : ""}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {line}
                  </h1>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
            className="text-base text-[#64748B] leading-relaxed max-w-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            From compliance deviations to schedule risk — DCPI transforms
            construction documents into real-time, actionable intelligence.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex flex-wrap gap-3 items-center"
          >
            <motion.button
              onClick={handleExplore}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #14B8A6, #0891b2)", boxShadow: "0 4px 20px rgba(20,184,166,0.35)" }}
            >
              <span className="relative z-10">Explore Dashboard</span>
              <ArrowRight size={15} className="relative z-10" />
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                className="absolute inset-0"
                style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)" }}
              />
            </motion.button>

            <motion.button
              onClick={() => navigate("/rfi")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#0F172A] bg-white border border-[#E2E8F0]"
              style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}
            >
              <Zap size={15} className="text-[#3B82F6]" />
              <span>Ask AI</span>
            </motion.button>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.4 }}
            className="flex items-center gap-6 pt-2"
          >
            {[
              { label: "Compliance Checks", value: summary?.compliance_checks_run || "—" },
              { label: "Documents Indexed", value: summary?.total_documents || "—" },
              { label: "Health Score", value: healthScore ? `${Math.round(healthScore)}%` : "—" },
            ].map(({ label, value }, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-sm font-bold text-[#0F172A]">{value}</span>
                <span className="text-[10px] text-[#94A3B8] tracking-wide">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN — asymmetric intelligence viz ───────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative hidden lg:block"
          style={{ height: "520px" }}
        >
          <IntelligenceViz summary={summary} healthScore={healthScore} />
        </motion.div>
      </div>

      <ScrollIndicator delay={2.0} onClick={handleExplore} />
    </motion.section>
  );
}
