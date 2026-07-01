import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

export default function HeroButtons({ onExplore, onRunAI, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="flex flex-col sm:flex-row gap-4 items-center justify-center sm:justify-start"
    >
      <motion.button
        onClick={onExplore}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative px-6 py-3 bg-[#14B8A6] hover:bg-[#0F9D8A] text-white rounded-full font-medium flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] overflow-hidden"
      >
        <span className="relative z-10">Explore Dashboard</span>
        <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
      </motion.button>
      
      <motion.button
        onClick={onRunAI}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] rounded-full font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
      >
        <Zap size={18} className="text-[#3B82F6]" />
        <span>Run AI Intelligence</span>
      </motion.button>
    </motion.div>
  );
}
