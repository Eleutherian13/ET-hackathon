import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { User, ActivitySquare, Bell, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useWorkspace } from "../../context/WorkspaceContext.jsx";

export default function ProfileDropdown({ isOpen, onClose }) {
  const { logout } = useAuth();
  const { toggleNotifications } = useWorkspace();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-14 w-64 bg-white/90 backdrop-blur-2xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  EK
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Engineering Team</p>
                  <p className="text-[11px] text-slate-500 font-medium">Enterprise Workspace</p>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="p-2 space-y-1">
              <Link to="/activity" onClick={onClose} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                <ActivitySquare size={16} /> Activity Center
              </Link>
              
              <button 
                onClick={() => { onClose(); toggleNotifications(); }} 
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
              >
                <Bell size={16} /> Notifications
              </button>

              <Link to="/settings" onClick={onClose} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                <Settings size={16} /> Workspace Settings
              </Link>
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-slate-100">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
