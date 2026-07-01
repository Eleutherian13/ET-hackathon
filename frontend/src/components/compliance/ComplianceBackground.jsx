import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AmbientParticles({ count = 15 }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const duration = 20 + Math.random() * 30;
        const size = 2 + Math.random() * 3;
        const opacity = 0.1 + Math.random() * 0.4;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#14B8A6]"
            style={{ width: size, height: size, left: `${startX}%`, top: `${startY}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, opacity, opacity, 0],
              scale: [0, 1, 1, 0],
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * -100 - 50],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        );
      })}
    </div>
  );
}

export default function ComplianceBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-50">
      {/* Light Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-multiply" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      
      {/* Blueprint Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(100,116,139,1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(100,116,139,1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 10%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 10%, transparent 80%)"
        }}
      />
      
      {/* Radial Glows */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] rounded-full bg-[#14B8A6] blur-[100px] pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
        className="absolute top-[20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-[#3B82F6] blur-[120px] pointer-events-none"
      />
      
      <AmbientParticles count={25} />
    </div>
  );
}
