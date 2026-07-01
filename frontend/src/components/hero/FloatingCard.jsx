import { motion } from "framer-motion";

export default function FloatingCard({ children, delay = 0, floatOffset = 10, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={`relative ${className}`}
    >
      <motion.div
        animate={{ y: [0, -floatOffset, 0] }}
        transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }}
        className="bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(15,23,42,0.05)] rounded-2xl p-5 w-full cursor-pointer transition-shadow hover:shadow-[0_16px_48px_0_rgba(15,23,42,0.1)]"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
