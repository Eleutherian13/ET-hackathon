import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const messages = [
  "Initializing Intelligence Engine...",
  "Loading Engineering Knowledge Base...",
  "Connecting Compliance Models...",
  "Preparing Schedule Analytics...",
  "Activating AI Assistants...",
];

export default function InitializationSequence({ delay = 3.8 }) {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(showTimer);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 900);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center gap-3"
    >
      {/* Pulsing dot */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        className="w-2 h-2 rounded-full bg-[#14B8A6] flex-shrink-0"
      />

      {/* Rotating messages */}
      <div className="overflow-hidden h-5 relative">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-sm font-medium text-[#64748B] absolute whitespace-nowrap"
            style={{ fontFamily: "'Inter', 'Geist', sans-serif" }}
          >
            {messages[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
