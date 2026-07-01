import { motion } from "framer-motion";

export default function LogoutAnimation() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80"
    >
      <div className="text-center relative z-10">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20"
        >
          <span className="text-white font-black text-2xl tracking-tighter">DC</span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Thank You
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-slate-400 font-medium text-sm"
        >
          See you again.
        </motion.p>
      </div>
    </motion.div>
  );
}
