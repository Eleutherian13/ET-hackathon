import { motion, AnimatePresence } from "framer-motion";
import { X, Search, FileText, CheckCircle, Zap, ShieldAlert, FileSpreadsheet } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext.jsx";

const NOTIFICATIONS = [
  { id: 1, type: "upload", title: "Specification uploaded", time: "10 mins ago", icon: <FileText strokeWidth={1.75} size={16} />, color: "text-slate-500", bg: "bg-white border border-slate-200" },
  { id: 2, type: "compliance", title: "Compliance analysis completed", time: "1 hour ago", icon: <CheckCircle strokeWidth={1.75} size={16} />, color: "text-slate-500", bg: "bg-white border border-slate-200" },
  { id: 3, type: "ncr", title: "Critical deviation detected", time: "2 hours ago", icon: <ShieldAlert strokeWidth={1.75} size={16} />, color: "text-slate-500", bg: "bg-white border border-slate-200" },
  { id: 4, type: "schedule", title: "Schedule risks analyzed", time: "Yesterday", icon: <FileSpreadsheet strokeWidth={1.75} size={16} />, color: "text-slate-500", bg: "bg-white border border-slate-200" },
  { id: 5, type: "rfi", title: "AI generated RFI response", time: "Yesterday", icon: <Zap strokeWidth={1.75} size={16} />, color: "text-slate-500", bg: "bg-white border border-slate-200" },
];

export default function NotificationDrawer() {
  const { isNotificationsOpen, toggleNotifications } = useWorkspace();

  return (
    <AnimatePresence>
      {isNotificationsOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleNotifications}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] z-50 flex flex-col border-l border-white/50"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
              <button 
                onClick={toggleNotifications}
                className="p-2 bg-slate-50 text-slate-500 hover:text-slate-900 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Actions */}
            <div className="p-4 border-b border-slate-50 flex gap-2 items-center">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search notifications..." 
                  className="w-full bg-slate-50/50 border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 text-slate-700"
                />
              </div>
              <button className="text-xs font-semibold text-teal-600 whitespace-nowrap hover:underline">
                Mark all read
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 ml-2">Today</h3>
                <div className="space-y-2">
                  {NOTIFICATIONS.slice(0,3).map(n => (
                    <div key={n.id} className="flex gap-3 p-3 rounded-2xl bg-white hover:bg-slate-50 transition-colors cursor-pointer group shadow-sm border border-slate-100">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.bg} ${n.color}`}>
                        {n.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                      </div>
                      <div className="ml-auto flex items-center">
                        <div className="w-2 h-2 rounded-full bg-teal-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 ml-2">Yesterday</h3>
                <div className="space-y-2">
                  {NOTIFICATIONS.slice(3).map(n => (
                    <div key={n.id} className="flex gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer opacity-80 hover:opacity-100 border border-transparent hover:border-slate-100">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.bg} ${n.color}`}>
                        {n.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
