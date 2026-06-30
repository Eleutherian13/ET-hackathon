import { useState, useEffect, useRef } from "react";
import api from "../api/client.js";
import SeverityBadge from "../components/SeverityBadge.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

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

  useEffect(() => {
    api
      .getRFIs()
      .then((data) => setRfis(data.rfis || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(queryText) {
    const text = (queryText || input).trim();
    if (!text || sending) return;
    setInput("");

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
        content: `Error: ${err.message}. Please check that the backend is running and the Anthropic API key is set.`,
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

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        RFI Intelligence
      </h1>
      <div className="flex gap-4 h-[calc(100%-4rem)]">
        {/* Left: RFI list */}
        <div className="w-56 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-100 overflow-y-auto p-4">
          <h2 className="font-semibold text-slate-600 text-sm mb-3">
            Project RFIs ({rfis.length})
          </h2>
          {rfis.length === 0 ? (
            <p className="text-slate-400 text-xs">
              No RFIs found. Run seed_data.py first.
            </p>
          ) : (
            <div className="space-y-2">
              {rfis.map((rfi) => (
                <div
                  key={rfi.id}
                  onClick={() =>
                    setInput(`Explain the resolution for: ${rfi.title}`)
                  }
                  className="cursor-pointer rounded-lg p-2 hover:bg-slate-50 transition-colors"
                >
                  <p className="text-xs font-semibold text-teal-600">
                    {rfi.rfi_code}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                    {rfi.title}
                  </p>
                  <SeverityBadge severity={rfi.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Centre: Chat */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-4">
                <p className="text-slate-500 text-sm">
                  Ask a question about the project specifications, RFIs, or
                  technical requirements.
                </p>
                <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                  {DEMO_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-left text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg px-3 py-2 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "user" ? (
                  <div className="bg-teal-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-md text-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-2xl w-full">
                    <div className="bg-slate-50 border-l-4 border-teal-500 rounded-r-2xl px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-teal-700">
                          DCPI Intelligence
                        </span>
                        {msg.confidence != null && msg.confidence > 0 && (
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              msg.confidence >= 0.8
                                ? "bg-green-100 text-green-700"
                                : msg.confidence >= 0.6
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            Confidence: {Math.round(msg.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                      {msg.precedent_rfis && msg.precedent_rfis.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {msg.precedent_rfis.map((p, j) => (
                            <div
                              key={j}
                              className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs"
                            >
                              <span className="font-semibold text-amber-700">
                                📂 Precedent: {p.rfi_code}
                              </span>
                              <span className="text-slate-500 ml-2">
                                · Similarity{" "}
                                {Math.round(p.similarity_score * 100)}%
                              </span>
                              <p className="text-slate-600 mt-1 line-clamp-2">
                                {p.resolution_summary}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about specifications, RFI history, or technical requirements... (Enter to send)"
                rows={2}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || sending}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold px-5 rounded-xl transition-colors text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Right: Sources sidebar */}
        <div className="w-56 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-100 overflow-y-auto p-4">
          <h2 className="font-semibold text-slate-600 text-sm mb-3">Sources</h2>
          {currentSources.length === 0 ? (
            <p className="text-slate-400 text-xs">
              Citations will appear after your first query.
            </p>
          ) : (
            <div className="space-y-3">
              {currentSources.slice(0, 6).map((src, i) => (
                <div
                  key={i}
                  className="border border-slate-100 rounded-lg p-2.5"
                >
                  <p className="text-xs font-semibold text-slate-600">
                    {src.clause_number || "Source " + (i + 1)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {src.text_preview}
                  </p>
                  <div className="mt-1.5">
                    <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                      <span>Similarity</span>
                      <span>{Math.round((src.score || 0) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1">
                      <div
                        className="bg-teal-400 h-1 rounded-full"
                        style={{
                          width: `${Math.round((src.score || 0) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {currentPrecedents.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-xs font-semibold text-amber-700 mb-2">
                    Precedent RFIs
                  </h3>
                  {currentPrecedents.map((p, i) => (
                    <div
                      key={i}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs mb-2"
                    >
                      <p className="font-semibold text-amber-700">
                        {p.rfi_code}
                      </p>
                      <p className="text-slate-500 line-clamp-2 mt-0.5">
                        {p.title}
                      </p>
                      <p className="text-slate-400 mt-0.5">
                        Sim: {Math.round(p.similarity_score * 100)}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
