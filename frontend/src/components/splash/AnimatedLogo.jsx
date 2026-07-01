import { motion } from "framer-motion";

export default function AnimatedLogo({ delay = 0.8 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-3"
    >
      {/* Logo mark */}
      <motion.div
        animate={{ boxShadow: ["0 0 0px rgba(20,184,166,0)", "0 0 30px rgba(20,184,166,0.3)", "0 0 0px rgba(20,184,166,0)"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0F9D8A] flex items-center justify-center shadow-lg"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="4" width="10" height="10" rx="2" fill="white" opacity="0.9" />
          <rect x="18" y="4" width="10" height="10" rx="2" fill="white" opacity="0.6" />
          <rect x="4" y="18" width="10" height="10" rx="2" fill="white" opacity="0.6" />
          <rect x="18" y="18" width="10" height="10" rx="2" fill="white" opacity="0.9" />
          <circle cx="16" cy="16" r="2.5" fill="white" opacity="1" />
        </svg>
      </motion.div>

      {/* DCPI wordmark */}
      <div className="text-center">
        <div
          className="text-3xl font-bold tracking-tight text-[#0F172A]"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}
        >
          DCPI
        </div>
        <div
          className="text-xs font-medium tracking-[0.18em] uppercase text-[#64748B] mt-1"
        >
          Data Centre Project Intelligence
        </div>
      </div>
    </motion.div>
  );
}
