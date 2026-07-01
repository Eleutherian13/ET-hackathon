import { motion } from "framer-motion";
import { FileText, CheckCircle, Zap, ShieldAlert, FileSpreadsheet, Search, Filter } from "lucide-react";
import ComplianceBackground from "../components/compliance/ComplianceBackground.jsx";

const EVENTS = [
  { id: 1, type: "ncr", title: "Critical Deviation Detected", doc: "Vendor-Submittal-UPS-01.pdf", time: "10 mins ago", icon: <ShieldAlert strokeWidth={1.75} size={18} />, color: "text-teal-600", border: "border-teal-200" },
  { id: 2, type: "compliance", title: "Compliance Analysis Completed", doc: "Project-Specs-Electrical.pdf", time: "1 hour ago", icon: <CheckCircle strokeWidth={1.75} size={18} />, color: "text-slate-500", border: "border-slate-200" },
  { id: 3, type: "rfi", title: "AI Generated RFI Response", doc: "RFI-ELEC-042", time: "2 hours ago", icon: <Zap strokeWidth={1.75} size={18} />, color: "text-slate-500", border: "border-slate-200" },
  { id: 4, type: "schedule", title: "Risk Analysis Completed", doc: "Baseline-Schedule.mpp", time: "Yesterday", icon: <FileSpreadsheet strokeWidth={1.75} size={18} />, color: "text-slate-500", border: "border-slate-200" },
  { id: 5, type: "upload", title: "Specification Uploaded", doc: "Project-Specs-Electrical.pdf", time: "Yesterday", icon: <FileText strokeWidth={1.75} size={18} />, color: "text-slate-500", border: "border-slate-200" },
  { id: 6, type: "upload", title: "Vendor Submittal Uploaded", doc: "Vendor-Submittal-UPS-01.pdf", time: "Yesterday", icon: <FileText strokeWidth={1.75} size={18} />, color: "text-slate-500", border: "border-slate-200" },
];

export default function ActivityCenter() {
  return (
    <div className="min-h-screen relative pb-24">
      <ComplianceBackground />
      
      <div className="max-w-4xl mx-auto pt-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Activity Center</h1>
            <p className="text-slate-500 mt-2">Track all AI actions, uploads, and intelligence events across the platform.</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search activity..." 
                className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm w-full md:w-64"
              />
            </div>
            <button className="p-2 bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors shadow-sm">
              <Filter size={20} />
            </button>
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="bg-white/50 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="relative pl-6 md:pl-10">
            {/* Vertical Line */}
            <div className="absolute top-4 bottom-4 left-6 md:left-10 w-px bg-slate-200 ml-[11px]" />
            
            <div className="space-y-8">
              {EVENTS.map((event, idx) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="relative group cursor-pointer"
                >
                  {/* Timeline Node */}
                  <div className={`absolute -left-6 md:-left-10 w-6 h-6 rounded-full bg-white border-2 ${event.border} flex items-center justify-center shadow-sm z-10 group-hover:scale-125 transition-transform duration-300 ml-1.5`}>
                    <div className={`w-2 h-2 rounded-full ${event.color} bg-current`} />
                  </div>
                  
                  {/* Event Card */}
                  <div className="pl-6">
                    <div className="bg-white/80 border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center gap-4">
                      
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-50 border border-slate-100 ${event.color}`}>
                        {event.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-slate-800">{event.title}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {event.time}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 truncate">
                          Ref: <span className="text-indigo-500">{event.doc}</span>
                        </p>
                      </div>
                      
                      <div className="hidden md:block text-right">
                        <button className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors">
                          View Details &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 text-center relative z-10">
              <button className="bg-slate-100 text-slate-500 hover:text-slate-700 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-colors border border-slate-200 shadow-sm">
                Load Older Activity
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
