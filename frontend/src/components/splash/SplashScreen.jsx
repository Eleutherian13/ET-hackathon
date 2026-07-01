import { useState } from "react";
import { motion } from "framer-motion";
import AssemblingLogo from "./AssemblingLogo";
import PulseLine from "./PulseLine";
import { AmbientParticles, useTagline } from "./splashUtils";

// ─── Subtle blueprint grid ────────────────────────────────────────────────────
function SplashGrid({ bright }) {
  return (
    <motion.div
      initial={{ opacity: 0.10 }}
      animate={{ opacity: bright ? 0.22 : 0.10 }}
      transition={{ duration: 1.0, ease: "easeInOut" }}
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(100,116,139,1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(100,116,139,1) 1px, transparent 1px)
        `,
        backgroundSize: "44px 44px",
      }}
    />
  );
}

// ─── "DCPI" letters appearing one by one ─────────────────────────────────────
function DCPILetters({ delay = 1.2 }) {
  const letters = ["D", "C", "P", "I"];
  return (
    <div
      className="flex items-end gap-[2px]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {letters.map((l, i) => (
        <motion.span
          key={l}
          initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.55,
            delay: delay + i * 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] text-[#0F172A]"
        >
          {l}
        </motion.span>
      ))}
    </div>
  );
}

// ─── Subtitle — DATA CENTRE PROJECT INTELLIGENCE ──────────────────────────────
function Subtitle({ delay = 1.8 }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="text-[11px] sm:text-xs uppercase tracking-[0.32em] font-medium text-[#94A3B8]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      Data Centre Project Intelligence
    </motion.p>
  );
}

// ─── Tagline blur-reveal ──────────────────────────────────────────────────────
function Tagline({ text, delay = 2.3 }) {
  const words = text.split(" ");
  return (
    <p
      className="text-sm sm:text-base text-[#64748B] max-w-xs sm:max-w-sm text-center leading-relaxed"
      style={{ fontFamily: "'Inter', sans-serif" }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{
            duration: 0.45,
            delay: delay + i * 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

// ─── Radial soft glow behind content ─────────────────────────────────────────
function CenterGlow({ bright }) {
  return (
    <motion.div
      initial={{ opacity: 0.2 }}
      animate={{ opacity: bright ? 0.5 : 0.2 }}
      transition={{ duration: 1.0, ease: "easeInOut" }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
      style={{
        background: "radial-gradient(ellipse at center, rgba(20,184,166,0.10) 0%, transparent 68%)",
      }}
    />
  );
}

// ─── Corner engineering marks ─────────────────────────────────────────────────
function CornerMark({ pos }) {
  const cls = {
    tl: "top-8 left-8",
    tr: "top-8 right-8",
    bl: "bottom-8 left-8",
    br: "bottom-8 right-8",
  }[pos];

  const paths = {
    tl: "M0 40 L0 0 L40 0",
    tr: "M40 40 L40 0 L0 0",
    bl: "M0 0 L0 40 L40 40",
    br: "M40 0 L40 40 L0 40",
  };
  const dots = { tl: [0, 0], tr: [40, 0], bl: [0, 40], br: [40, 40] };
  const color = pos === "tl" || pos === "br" ? "#14B8A6" : "#3B82F6";
  const [cx, cy] = dots[pos];

  return (
    <div className={`absolute ${cls} opacity-20`}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d={paths[pos]} stroke={color} strokeWidth="1.2" fill="none" />
        <circle cx={cx} cy={cy} r="2" fill={color} />
      </svg>
    </div>
  );
}

// ─── Main SplashScreen ────────────────────────────────────────────────────────
export default function SplashScreen() {
  const [gridBright, setGridBright] = useState(false);
  const tagline = useTagline();

  // Called when the pulse line animation completes at ~3.0s
  const handlePulseComplete = () => setGridBright(true);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.03,
        filter: "blur(14px)",
        transition: { duration: 0.85, ease: [0.4, 0, 1, 1] },
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: "#F8FAFC" }}
    >
      {/* === LAYERS === */}
      <SplashGrid bright={gridBright} />
      <CenterGlow bright={gridBright} />
      <AmbientParticles />

      {/* Corner marks */}
      {["tl", "tr", "bl", "br"].map((pos) => <CornerMark key={pos} pos={pos} />)}

      {/* === CONTENT (vertically stacked, centered) === */}
      <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6">

        {/* 0.4s → Logo assembles */}
        <AssemblingLogo delay={0.4} />

        {/* 0.8s → DCPI letters */}
        <DCPILetters delay={0.8} />

        {/* 1.2s → subtitle */}
        <Subtitle delay={1.2} />

        {/* thin divider that appears between subtitle and tagline */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-8 h-px bg-[#E2E8F0] origin-center"
        />

        {/* 1.6s → tagline */}
        <Tagline text={tagline} delay={1.6} />

        {/* 2.3s → pulse line */}
        <div className="mt-2">
          <PulseLine delay={2.3} onComplete={handlePulseComplete} />
        </div>
      </div>
    </motion.div>
  );
}
