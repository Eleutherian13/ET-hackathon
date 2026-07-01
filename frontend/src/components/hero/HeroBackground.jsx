import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function HeroBackground() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate some random coordinates for our network nodes
  const nodes = [
    { x: 15, y: 25 }, { x: 35, y: 15 }, { x: 75, y: 30 },
    { x: 85, y: 65 }, { x: 65, y: 85 }, { x: 25, y: 75 },
    { x: 50, y: 50 }, { x: 10, y: 50 }, { x: 90, y: 40 },
    { x: 45, y: 80 }
  ];

  // Connections between nodes
  const connections = [
    [0, 1], [1, 6], [0, 7], [7, 5], [5, 6],
    [6, 9], [5, 9], [6, 2], [2, 8], [8, 3],
    [3, 4], [4, 9], [4, 6]
  ];

  return (
    <div className="absolute inset-0 bg-[#F8FAFC] overflow-hidden -z-10">
      {/* Blueprint Grid - Fades in */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #64748b 1px, transparent 1px),
            linear-gradient(to bottom, #64748b 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating Gradient Meshes */}
      <motion.div
        animate={{ 
          x: [0, 30, 0],
          y: [0, -40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-3xl"
      />
      
      <motion.div
        animate={{ 
          x: [0, -30, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-teal-400/5 blur-3xl"
      />

      {/* Neural Network SVG Overlay */}
      {mounted && (
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {connections.map(([a, b], idx) => (
            <motion.line
              key={idx}
              x1={`${nodes[a].x}%`}
              y1={`${nodes[a].y}%`}
              x2={`${nodes[b].x}%`}
              y2={`${nodes[b].y}%`}
              stroke="#14B8A6"
              strokeWidth="1"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: [0.1, 0.3, 0.1], pathLength: 1 }}
              transition={{
                opacity: { duration: 4, repeat: Infinity, delay: idx * 0.2 },
                pathLength: { duration: 2, ease: "easeOut" }
              }}
            />
          ))}
          
          {nodes.map((node, idx) => (
            <motion.circle
              key={`node-${idx}`}
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="2"
              fill="#3B82F6"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.2, 0.8, 0.2], 
                scale: [1, 1.5, 1],
                cx: [`${node.x}%`, `${node.x + (idx % 2 === 0 ? 1 : -1)}%`, `${node.x}%`],
                cy: [`${node.y}%`, `${node.y + (idx % 3 === 0 ? 1 : -1)}%`, `${node.y}%`]
              }}
              transition={{
                duration: 5 + (idx % 3),
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </svg>
      )}

      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
    </div>
  );
}
