import { motion } from "framer-motion";

export default function BlueprintBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base background */}
      <div className="absolute inset-0 bg-[#F8FAFC]" />

      {/* Blueprint Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(100,116,139,0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(100,116,139,0.07) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
        }}
      />

      {/* Subtle dot grid overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(148,163,184,0.25) 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
          backgroundPosition: "22px 22px",
        }}
      />

      {/* Radial gradient top-left */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)" }}
      />

      {/* Radial gradient bottom-right */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)" }}
      />

      {/* Center glow */}
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(20,184,166,0.04) 0%, transparent 70%)" }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
