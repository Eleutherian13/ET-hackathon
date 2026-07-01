import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

const STEPS = [
  "Reading Schedule Data...",
  "Building Dependency Graph...",
  "Calculating Float & Sequences...",
  "Finding Critical Path...",
  "Predicting Project Delays...",
  "Generating AI Mitigation Plan..."
];

export default function ScheduleAITimeline() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= STEPS.length) return;
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 1000 + Math.random() * 1200);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="card p-10 bg-white/60 backdrop-blur-xl border border-white/50 relative overflow-hidden">
      {/* Animated processing glow */}
      <motion.div 
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-32 w-64 h-64 bg-amber-400/20 rounded-full blur-[80px]"
      />
      
      <div className="flex items-center gap-5 mb-10">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-slate-100 border-t-amber-500 rounded-full shadow-lg"
        />
        <div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">AI Schedule Intelligence Engine</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Simulating thousands of monte carlo project paths...</p>
        </div>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 max-w-2xl">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > idx;
          const isActive = currentStep === idx;
          
          return (
            <div key={idx} className="relative">
              {/* Timeline dot */}
              <div 
                className={`absolute -left-[33px] w-5 h-5 rounded-full border-2 bg-white transition-colors duration-500 flex items-center justify-center ${
                  isCompleted ? "border-amber-500 text-amber-500" : isActive ? "border-blue-500" : "border-slate-200"
                }`}
              >
                {isCompleted && <CheckCircle size={12} strokeWidth={4} />}
                {isActive && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} 
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                )}
              </div>
              
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isCompleted || isActive ? 1 : 0.4, x: 0 }}
                transition={{ duration: 0.5 }}
                className="pl-4"
              >
                <span className={`text-base font-semibold ${isCompleted ? "text-slate-800" : isActive ? "text-blue-600" : "text-slate-400"}`}>
                  {step}
                </span>
                
                {/* Active progress bar */}
                {isActive && (
                  <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "95%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
