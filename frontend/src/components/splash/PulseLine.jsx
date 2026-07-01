import { motion } from "framer-motion";

/**
 * Horizontal pulse line that travels left→right once.
 * After completion, callback fires.
 */
export default function PulseLine({ delay = 3.0, onComplete }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
      className="relative w-48 sm:w-64 h-px overflow-visible"
    >
      {/* Static track */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(20,184,166,0.15), transparent)" }}
      />

      {/* Traveling glow head */}
      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "200%", opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 0.9,
          delay: delay + 0.1,
          ease: [0.4, 0, 0.2, 1],
        }}
        onAnimationComplete={onComplete}
        className="absolute top-1/2 -translate-y-1/2 left-0 w-12 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, #14B8A6, #3B82F6, transparent)",
          boxShadow: "0 0 12px 2px rgba(20,184,166,0.6)",
          borderRadius: "9999px",
        }}
      />

      {/* Trailing glow dot at center of the head */}
      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "260%", opacity: [0, 1, 0] }}
        transition={{ duration: 0.9, delay: delay + 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 rounded-full"
        style={{
          background: "#14B8A6",
          boxShadow: "0 0 8px 2px rgba(20,184,166,0.8)",
          marginTop: "-3px",
        }}
      />
    </motion.div>
  );
}
