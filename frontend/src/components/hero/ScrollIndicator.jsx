import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function ScrollIndicator({ onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
      onClick={onClick}
    >
      <span className="text-xs uppercase tracking-[0.2em] font-medium">Scroll</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown size={20} />
      </motion.div>
    </motion.div>
  );
}
