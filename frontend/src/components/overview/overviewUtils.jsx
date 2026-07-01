import { useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform, animate } from "framer-motion";

// ─── Shared helpers ──────────────────────────────────────────────────────────
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  return { ref, inView };
}

export function AnimCounter({ to, suffix = "", prefix = "", duration = 1.6, delay = 0 }) {
  const [val, setVal] = useState(0);
  const { ref, inView } = useScrollReveal();
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => {
      const controls = animate(0, to, {
        duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setVal(Math.round(v)),
      });
      return () => controls.stop();
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [inView, to, delay, duration]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

// Fade-up + blur reveal triggered by scroll
export function Reveal({ children, delay = 0, className = "" }) {
  const { ref, inView } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Section label chip ───────────────────────────────────────────────────────
export function SectionLabel({ text }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-200 bg-teal-50 mb-4">
      <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
      <span className="text-[11px] font-semibold tracking-widest uppercase text-teal-700">{text}</span>
    </div>
  );
}
