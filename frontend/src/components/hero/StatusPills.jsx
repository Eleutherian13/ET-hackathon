import { motion } from "framer-motion";

export default function StatusPills({ delay = 0 }) {
  const pills = [
    "AI Monitoring Active",
    "Compliance Intelligence Ready",
    "Schedule Prediction Ready",
    "RFI Knowledge Base Loaded"
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-wrap justify-center sm:justify-start gap-3 my-8 max-w-lg"
    >
      {pills.map((pill, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: delay + idx * 0.15, ease: "easeOut" }}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-md border border-[#22C55E]/30 shadow-[0_4px_12px_rgba(34,197,94,0.08)] rounded-full"
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
            className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.8)]"
          />
          <span className="text-xs font-medium text-[#0F172A]">{pill}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
