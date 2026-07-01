import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BrainCircuit } from "lucide-react";

const STAGES = [
  "Searching Project Specifications...",
  "Checking Historical RFIs...",
  "Comparing Engineering Standards...",
  "Synthesizing Engineering Answer..."
];

export default function RfiThinkingTimeline() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (currentStage >= STAGES.length - 1) return;
    const timer = setTimeout(() => {
      setCurrentStage(prev => prev + 1);
    }, 1500 + Math.random() * 1000);
    return () => clearTimeout(timer);
  }, [currentStage]);

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full px-4 my-6">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex flex-shrink-0 items-center justify-center text-indigo-500 mt-1">
          <BrainCircuit size={16} />
        </div>
        
        <div className="flex-1 space-y-3 pt-2">
          {STAGES.map((stage, idx) => {
            const isCompleted = currentStage > idx;
            const isActive = currentStage === idx;
            const isPending = currentStage < idx;
            
            if (isPending) return null; // Only show active and completed stages to simulate progressive thought

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
                className="flex items-center gap-3"
              >
                {isActive ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-3.5 h-3.5 border-2 border-indigo-200 border-t-indigo-600 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-200 flex-shrink-0" />
                )}
                <span className={`text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-slate-500'}`}>
                  {stage}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
