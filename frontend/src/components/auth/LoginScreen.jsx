import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";
import ComplianceBackground from "../compliance/ComplianceBackground.jsx";

export default function LoginScreen() {
  const { login } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="login"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#F8FAFC]"
      >
        <ComplianceBackground />
        
        {/* Animated Glows - Softened for light theme */}
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-teal-300/20 rounded-full blur-[120px] pointer-events-none"
        />
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1.1, 1, 1.1] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-indigo-300/20 rounded-full blur-[120px] pointer-events-none"
        />

        <div className="relative z-10 w-full max-w-lg px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-10 rounded-[2rem] text-center"
          >
            {/* Logo */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-teal-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-8 shadow-md"
            >
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" style={{ animationDuration: '3s' }} />
            </motion.div>

            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome to DCPI</h1>
            <p className="text-slate-600 text-sm mb-1 font-semibold">Data Centre Project Intelligence</p>
            <p className="text-slate-500 text-xs mb-10 max-w-sm mx-auto leading-relaxed">
              AI-powered platform for Engineering, Procurement and Construction teams.
            </p>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={login}
              className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">Continue to Workspace</span>
              <svg className="w-4 h-4 ml-1 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
            
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
