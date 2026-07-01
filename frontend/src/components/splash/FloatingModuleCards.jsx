import { motion } from "framer-motion";
import { Cpu, TrendingUp, ShieldCheck, MessageSquareText } from "lucide-react";

const modules = [
  {
    icon: <Cpu strokeWidth={1.75} size={24} />,
    title: "AI Compliance Intelligence",
    description:
      "Automatically compares specifications with vendor submissions and detects compliance deviations.",
    color: "#14B8A6",
    bg: "rgba(20,184,166,0.06)",
    border: "rgba(20,184,166,0.15)",
  },
  {
    icon: <TrendingUp strokeWidth={1.75} size={24} />,
    title: "Schedule Risk Intelligence",
    description:
      "Predicts delays, analyzes critical paths and generates AI-powered mitigation strategies.",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.06)",
    border: "rgba(59,130,246,0.15)",
  },
  {
    icon: <ShieldCheck strokeWidth={1.75} size={24} />,
    title: "Quality & NCR Intelligence",
    description:
      "Tracks quality issues, manages NCRs and recommends corrective actions.",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.15)",
  },
  {
    icon: <MessageSquareText strokeWidth={1.75} size={24} />,
    title: "AI RFI Intelligence",
    description:
      "Answers technical questions using project specifications, RFIs and engineering documentation.",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.15)",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function FloatingModuleCards({ delay = 3.0 }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ delayChildren: delay }}
      variants={containerVariants}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl"
    >
      {modules.map((mod, idx) => (
        <motion.div
          key={idx}
          variants={cardVariants}
          whileHover={{
            y: -6,
            boxShadow: `0 12px 32px ${mod.color}22`,
            transition: { duration: 0.2 },
          }}
          animate={{
            y: [0, idx % 2 === 0 ? -4 : 4, 0],
            transition: { duration: 4 + idx, repeat: Infinity, ease: "easeInOut" },
          }}
          className="rounded-2xl p-4 cursor-default"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${mod.border}`,
            boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
          }}
        >
          <div className="mb-3 p-1.5 rounded-lg inline-flex" style={{ backgroundColor: `${mod.color}15`, color: mod.color }}>
            {mod.icon}
          </div>
          <h4
            className="text-xs font-semibold mb-2 leading-tight"
            style={{ color: "#0F172A", fontFamily: "'Inter', sans-serif" }}
          >
            {mod.title}
          </h4>
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: "#64748B" }}
          >
            {mod.description}
          </p>
          <div
            className="mt-3 h-0.5 rounded-full w-8"
            style={{ background: mod.color, opacity: 0.5 }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
