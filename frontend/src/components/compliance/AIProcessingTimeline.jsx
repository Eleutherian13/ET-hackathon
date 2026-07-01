import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

const STEPS = [
  "Reading Specification...",
  "Extracting Requirements...",
  "Comparing Vendor Submission...",
  "Detecting Deviations...",
  "Generating Compliance Report..."
];

export default function AIProcessingTimeline() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= STEPS.length) return;
    // Advance steps randomly to simulate AI thinking
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 1200 + Math.random() * 1500);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="card p-8 bg-white/60 backdrop-blur-xl border border-white/50 relative overflow-hidden">
      {/* Animated processing glow */}
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -right-24 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl"
      />
      
      <div className="flex items-center gap-4 mb-8">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-slate-100 border-t-teal-500 rounded-full"
        />
        <div>
          <h3 className="text-xl font-bold text-slate-800">Intelligence Engine Running</h3>
          <p className="text-sm text-slate-500">Cross-referencing documents via AI embeddings</p>
        </div>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > idx;
          const isActive = currentStep === idx;
          
          return (
            <div key={idx} className="relative">
              {/* Timeline dot */}
              <div 
                className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 bg-white transition-colors duration-500 flex items-center justify-center ${
                  isCompleted ? "border-teal-500 text-teal-500" : isActive ? "border-blue-500" : "border-slate-200"
                }`}
              >
                {isCompleted && <CheckCircle size={10} strokeWidth={4} />}
                {isActive && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} 
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  />
                )}
              </div>
              
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isCompleted || isActive ? 1 : 0.4, x: 0 }}
                transition={{ duration: 0.5 }}
                className="pl-2"
              >
                <span className={`text-sm font-semibold ${isCompleted ? "text-slate-800" : isActive ? "text-blue-600" : "text-slate-400"}`}>
                  {step}
                </span>
                
                {/* Active progress bar */}
                {isActive && (
                  <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden max-w-xs">
                    <motion.div 
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "90%" }}
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
