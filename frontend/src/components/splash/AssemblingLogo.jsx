import { motion } from "framer-motion";

/**
 * The DCPI 2×2 grid logo mark.
 * Four squares assemble themselves from the center outward.
 */
export default function AssemblingLogo({ delay = 0.5 }) {
  // Each square slides in from its own corner direction
  const squares = [
    { label: "tl", ox: -10, oy: -10, color: "rgba(255,255,255,0.95)" },
    { label: "tr", ox:  10, oy: -10, color: "rgba(255,255,255,0.60)" },
    { label: "bl", ox: -10, oy:  10, color: "rgba(255,255,255,0.60)" },
    { label: "br", ox:  10, oy:  10, color: "rgba(255,255,255,0.95)" },
  ];

  return (
    <motion.div className="flex flex-col items-center gap-4">
      {/* Glowing point that expands into the logo container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.1, borderRadius: "50%" }}
        animate={{ opacity: 1, scale: 1, borderRadius: "18px" }}
        transition={{ duration: 0.65, delay, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-16 h-16 flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #14B8A6, #0891b2)",
          boxShadow: "0 0 40px rgba(20,184,166,0.45)",
        }}
      >
        {/* Ambient glow ring that pulses */}
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: delay + 0.5 }}
          className="absolute inset-0 rounded-2xl"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 70%)" }}
        />

        {/* 2×2 grid of squares assembling */}
        <div className="relative grid grid-cols-2 gap-[3px] p-[6px] w-full h-full">
          {squares.map(({ label, ox, oy, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: ox, y: oy, scale: 0.5 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: delay + 0.25 + i * 0.06,
                ease: [0.34, 1.3, 0.64, 1],
              }}
              className="rounded-[3px]"
              style={{ background: color }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
