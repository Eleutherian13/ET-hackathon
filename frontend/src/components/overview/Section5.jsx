import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Reveal, SectionLabel } from "./overviewUtils";

export default function Section5() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <section ref={ref} className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Animated divider line */}
        <div className="flex items-center gap-6 mb-20">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 h-px origin-left"
            style={{ background: "linear-gradient(90deg, transparent, #14B8A6, #3B82F6, transparent)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center px-4 flex-shrink-0"
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-2.5 h-2.5 rounded-full bg-teal-500 mx-auto mb-3"
              style={{ boxShadow: "0 0 12px rgba(20,184,166,0.6)" }}
            />
            <div className="text-xs font-bold tracking-widest uppercase text-slate-400">Live Intelligence</div>
          </motion.div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 h-px origin-right"
            style={{ background: "linear-gradient(90deg, transparent, #3B82F6, #14B8A6, transparent)" }}
          />
        </div>

        {/* Heading that fades in as dashboard cards approach */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-4"
        >
          <SectionLabel text="Project ZENITH" />
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Inter',sans-serif" }}>
            Live Project Intelligence
          </h2>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto text-sm">
            Real-time data from your active project. Every metric updates as your AI agents process new information.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
