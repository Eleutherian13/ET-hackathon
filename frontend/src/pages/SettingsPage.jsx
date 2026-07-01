import { motion } from "framer-motion";
import { Monitor, Bell, BrainCircuit, Layout, Info, User, Check, Zap, Server, Shield } from "lucide-react";
import ComplianceBackground from "../components/compliance/ComplianceBackground.jsx";

export default function SettingsPage() {
  const settingsSections = [
    {
      id: "appearance",
      title: "Appearance",
      icon: <Monitor size={18} />,
      items: [
        { name: "Accent Color", type: "color", value: "#4F46E5" },
        { name: "Animation Level", type: "select", options: ["Reduced", "Standard", "Full"], value: "Full" },
        { name: "Compact Layout", type: "toggle", value: false },
      ]
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: <Bell size={18} />,
      items: [
        { name: "Desktop Notifications", type: "toggle", value: true },
        { name: "Sound Effects", type: "toggle", value: false },
        { name: "Badge Counter", type: "toggle", value: true },
        { name: "Email Alerts", type: "toggle", value: false, disabled: true },
      ]
    },
    {
      id: "ai",
      title: "AI Preferences",
      icon: <BrainCircuit size={18} />,
      items: [
        { name: "Streaming Responses", type: "toggle", value: true },
        { name: "Show Confidence Scores", type: "toggle", value: true },
        { name: "Auto-expand Citations", type: "toggle", value: false },
        { name: "Engine Speed vs Quality", type: "slider", value: 80 },
      ]
    },
    {
      id: "workspace",
      title: "Workspace Health",
      icon: <Layout size={18} />,
      items: [
        { name: "Frontend Version", type: "text", value: "v1.0.0 (Demo)" },
        { name: "Backend Status", type: "status", value: "Online", color: "text-emerald-500" },
        { name: "API Health", type: "status", value: "99.9% Uptime", color: "text-emerald-500" },
        { name: "Storage Usage", type: "progress", value: 45, label: "4.5GB / 10GB" },
      ]
    }
  ];

  return (
    <div className="min-h-screen relative pb-24">
      <ComplianceBackground />
      
      <div className="max-w-4xl mx-auto pt-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Workspace Settings</h1>
          <p className="text-slate-500 mt-2">Manage your DCPI experience, appearance, and AI preferences.</p>
        </motion.div>

        <div className="space-y-8">
          {settingsSections.map((section, idx) => (
            <motion.div 
              key={section.id}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 * idx }}
              className="bg-white/60 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-sm"
            >
              <div className="px-6 py-4 border-b border-slate-200/50 bg-slate-50/50 flex items-center gap-3">
                <div className="text-teal-500">{section.icon}</div>
                <h2 className="font-bold text-slate-800">{section.title}</h2>
              </div>
              
              <div className="divide-y divide-slate-100">
                {section.items.map((item, i) => (
                  <div key={i} className="px-6 py-5 flex items-center justify-between hover:bg-white/40 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                      {item.disabled && <p className="text-[10px] text-slate-400 mt-0.5">Currently disabled in demo mode</p>}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {item.type === 'toggle' && (
                        <button className={`w-11 h-6 rounded-full transition-colors relative ${item.value ? 'bg-teal-500' : 'bg-slate-300'} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <motion.div 
                            layout 
                            className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5" 
                            animate={{ left: item.value ? '22px' : '2px' }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </button>
                      )}
                      
                      {item.type === 'select' && (
                        <select className="bg-slate-100 border-none rounded-lg text-sm font-medium text-slate-700 py-2 pl-3 pr-8 focus:ring-2 focus:ring-teal-500">
                          {item.options.map(o => <option key={o}>{o}</option>)}
                        </select>
                      )}
                      
                      {item.type === 'color' && (
                        <div className="w-8 h-8 rounded-full shadow-inner border border-slate-200 flex items-center justify-center" style={{ backgroundColor: item.value }}>
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                      
                      {item.type === 'text' && (
                        <span className="text-sm font-mono text-slate-500">{item.value}</span>
                      )}
                      
                      {item.type === 'status' && (
                        <span className={`text-sm font-bold flex items-center gap-1.5 ${item.color}`}>
                          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                          {item.value}
                        </span>
                      )}
                      
                      {item.type === 'slider' && (
                        <div className="w-32 flex items-center gap-3">
                          <div className="h-1.5 w-full bg-slate-200 rounded-full relative">
                            <div className="absolute top-0 left-0 h-full bg-teal-500 rounded-full" style={{ width: `${item.value}%` }} />
                            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border border-slate-300 rounded-full shadow-sm" style={{ left: `calc(${item.value}% - 8px)` }} />
                          </div>
                        </div>
                      )}

                      {item.type === 'progress' && (
                        <div className="w-48 text-right">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                            <span>Usage</span>
                            <span>{item.label}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
          
          {/* About Section */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center pb-12 pt-8 text-sm text-slate-400">
            <div className="flex justify-center gap-2 mb-2">
              <Zap size={16} /> <Server size={16} /> <Shield size={16} />
            </div>
            <p className="font-semibold text-slate-500">DCPI Enterprise Architecture</p>
            <p>Hackathon Build v1.0 • Demo Data Only</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
