import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Paperclip, Mic, FileText, Search, Plus, 
  MessageSquare, BrainCircuit, Maximize2, Copy, 
  BookOpen, FolderClosed, Zap, ShieldAlert
} from "lucide-react";
import api from "../api/client.js";
import SeverityBadge from "../components/SeverityBadge.jsx";
import ComplianceBackground from "../components/compliance/ComplianceBackground.jsx";
import RfiThinkingTimeline from "../components/chat/RfiThinkingTimeline.jsx";

const DEMO_QUESTIONS = [
  "Has the efficiency deviation for this UPS been raised as an RFI before?",
  "What is the resolution for battery autonomy below specification?",
  "Is IP31 rating mandatory for UPS in an air-conditioned room?",
  "What are the THDi compliance requirements for this UPS?",
];

export default function RFIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [currentSources, setCurrentSources] = useState([]);
  const [currentPrecedents, setCurrentPrecedents] = useState([]);
  const [rfis, setRfis] = useState([]);
  
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    api
      .getRFIs()
      .then((data) => setRfis(data.rfis || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleInput = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  async function sendMessage(queryText) {
    const text = (queryText || input).trim();
    if (!text || sending) return;
    
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const data = await api.queryRFI(text);
      const assistantMsg = {
        role: "assistant",
        content: data.answer,
        confidence: data.confidence,
        precedent_rfis: data.precedent_rfis || [],
        sources: data.sources || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setCurrentSources(data.sources || []);
      setCurrentPrecedents(data.precedent_rfis || []);
    } catch (err) {
      const errMsg = {
        role: "assistant",
        content: `**Error:** ${err.message}\n\nPlease check that the backend is running and the API key is set.`,
        confidence: 0,
        precedent_rfis: [],
        sources: [],
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Helper to format basic markdown-like response styling
  const formatResponseContent = (content) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={i} className="font-bold text-slate-800 mt-3 mb-1">{line.replace(/\*\*/g, '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 list-disc text-slate-700">{line.substring(2)}</li>;
      }
      return <p key={i} className="text-slate-700 leading-relaxed mb-2">{line}</p>;
    });
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-slate-50">
      <ComplianceBackground />

      {/* ─── Premium Header ────────────────────────────────────────────── */}
      <header className="h-20 flex-shrink-0 border-b border-white/20 bg-white/40 backdrop-blur-md px-6 flex items-center justify-between relative z-20">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            RFI Intelligence <span className="bg-indigo-100 text-indigo-700 text-[10px] uppercase px-2 py-0.5 rounded-full tracking-widest font-bold">Workspace</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Ask technical questions across specifications, standards, and historical data.
          </p>
        </div>
        
        <div className="hidden md:flex gap-2">
          {[
            { label: "Project Specs", icon: <BookOpen size={14} /> },
            { label: "Engineering Standards", icon: <FileText size={14} /> },
            { label: "Historical RFIs", icon: <FolderClosed size={14} /> },
            { label: "AI Engine", icon: <BrainCircuit size={14} /> }
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-white/60 border border-slate-200/60 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 shadow-sm">
              <span className="text-indigo-500">{badge.icon}</span>
              {badge.label}
            </div>
          ))}
        </div>
      </header>

      {/* ─── Main Workspace ────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative z-10 p-4 gap-4 max-w-[1600px] mx-auto w-full">
        
        {/* Left Panel: Conversation History */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-4 hidden lg:flex">
          <button 
            onClick={() => { setMessages([]); setCurrentSources([]); setCurrentPrecedents([]); setInput(""); }}
            className="w-full bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200/60 rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-800 transition-all shadow-sm hover:shadow"
          >
            <Plus size={18} /> New Query
          </button>

          <div className="flex-1 bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-4 overflow-y-auto custom-scrollbar shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Search size={12} /> Historical RFIs
            </h2>
            
            {rfis.length === 0 ? (
              <p className="text-xs text-slate-400 p-2 text-center bg-slate-50/50 rounded-lg">No history available</p>
            ) : (
              <div className="space-y-1">
                {rfis.map((rfi) => (
                  <div
                    key={rfi.id}
                    onClick={() => sendMessage(`Explain the resolution for: ${rfi.title}`)}
                    className="cursor-pointer rounded-xl p-2.5 hover:bg-white/80 transition-all group border border-transparent hover:border-slate-200/50 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} className="text-slate-400 group-hover:text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{rfi.rfi_code}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">{rfi.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Chat Area */}
        <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden relative">
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm rotate-3">
                  <BrainCircuit size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">How can I assist you today?</h2>
                <p className="text-slate-500 mb-8 max-w-md">I am your AI engineering assistant. I can cross-reference specifications, analyze vendor deviations, and search historical RFIs.</p>
                
                <div className="flex flex-wrap justify-center gap-2">
                  {DEMO_QUESTIONS.map((q, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage(q)}
                      className="bg-white/80 hover:bg-white border border-slate-200/60 rounded-full px-4 py-2.5 text-xs font-medium text-slate-600 shadow-sm hover:shadow transition-all text-left"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'user' ? (
                    <div className="bg-slate-900 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-2xl text-[15px] shadow-sm font-medium">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full max-w-4xl flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-shrink-0 items-center justify-center text-white shadow-sm mt-1">
                        <BrainCircuit size={16} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="bg-white/80 border border-slate-100 rounded-2xl rounded-tl-sm p-6 shadow-sm">
                          
                          {/* Response Header */}
                          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                            <span className="font-bold text-slate-800 flex items-center gap-2">
                              DCPI Knowledge Engine
                              <CheckCircle size={14} className="text-indigo-500" />
                            </span>
                            <div className="flex gap-2">
                              {msg.confidence != null && (
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 ${
                                  msg.confidence >= 0.8 ? "bg-green-100 text-green-700" : msg.confidence >= 0.6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                }`}>
                                  <ShieldAlert size={12} /> {Math.round(msg.confidence * 100)}% Confidence
                                </span>
                              )}
                              <button className="text-slate-400 hover:text-slate-600 p-1"><Copy size={14} /></button>
                              <button className="text-slate-400 hover:text-slate-600 p-1"><Maximize2 size={14} /></button>
                            </div>
                          </div>

                          {/* Response Body */}
                          <div className="text-[15px] text-slate-700 leading-relaxed">
                            {formatResponseContent(msg.content)}
                          </div>

                          {/* Related Precedents Inline */}
                          {msg.precedent_rfis && msg.precedent_rfis.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-slate-100">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
                                <Search size={14} /> Referenced Historical Data
                              </h4>
                              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {msg.precedent_rfis.map((p, j) => (
                                  <div key={j} className="bg-slate-50 border border-slate-200 rounded-xl p-3 min-w-[250px] max-w-[300px] flex-shrink-0 cursor-pointer hover:bg-slate-100 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs font-bold text-slate-700">{p.rfi_code}</span>
                                      <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 px-1.5 rounded">
                                        {Math.round(p.similarity_score * 100)}% Match
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 line-clamp-2">{p.resolution_summary}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {sending && <RfiThinkingTimeline />}
            
            <div ref={chatEndRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/50 backdrop-blur-xl border-t border-white/60">
            <div className="max-w-4xl mx-auto relative bg-white border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-2xl flex items-end p-2 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300">
              <button className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-xl mb-0.5">
                <Paperclip size={20} />
              </button>
              
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask an engineering question..."
                className="flex-1 max-h-40 min-h-[44px] bg-transparent border-0 px-4 py-3 text-[15px] resize-none focus:ring-0 text-slate-800 placeholder-slate-400 custom-scrollbar"
                rows={1}
              />
              
              <div className="flex gap-1 mb-0.5">
                <button className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors rounded-xl hidden sm:block">
                  <Mic size={20} />
                </button>
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                    input.trim() && !sending 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Send size={18} className={input.trim() && !sending ? 'translate-x-0.5 -translate-y-0.5' : ''} />
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">AI can make mistakes. Verify critical engineering parameters against official documentation.</p>
          </div>
        </div>

        {/* Right Panel: Dynamic Knowledge Sources */}
        <div className="w-80 flex-shrink-0 hidden xl:flex flex-col gap-4">
          <div className="flex-1 bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Zap size={16} className="text-amber-500" />
              Knowledge Base
            </h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {!currentSources.length && !currentPrecedents.length ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3">
                  <BookOpen size={32} className="text-slate-400" />
                  <p className="text-sm font-medium text-slate-500">Sources will appear here based on your query.</p>
                </div>
              ) : (
                <>
                  {/* Extracted Clauses */}
                  {currentSources.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Referenced Specifications</h4>
                      <div className="space-y-2">
                        {currentSources.map((src, i) => (
                          <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-indigo-300 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="text-[11px] font-bold font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {src.clause_number || `CLAUSE-${i+1}`}
                              </span>
                              <span className="text-[10px] font-bold text-green-500">
                                {Math.round((src.score || 0) * 100)}% Match
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">{src.text_preview}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Precedent RFIs */}
                  {currentPrecedents.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Related RFI Data</h4>
                      <div className="space-y-2">
                        {currentPrecedents.map((p, i) => (
                          <div key={i} className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3 shadow-sm hover:bg-amber-50 transition-colors cursor-pointer">
                            <h5 className="text-[11px] font-bold text-amber-800 mb-1">{p.rfi_code}</h5>
                            <p className="text-[11px] text-amber-700/80 line-clamp-2 leading-relaxed">{p.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
