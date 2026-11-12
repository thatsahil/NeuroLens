import React, { useState, useEffect } from 'react';
import { Bot, Send, Sparkles, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function AssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello. I am the NeuroLens Federated Research Assistant. I can assist with queries regarding Global Round 1 aggregation, FedAvg coefficients, DenseNet121 architecture, and client partitions.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ enabled: false, message: 'Checking assistant...' });

  useEffect(() => {
    if (isOpen) {
      api
        .get('/assistant/status')
        .then((res) => setStatus(res.data))
        .catch(() => setStatus({ enabled: false, message: 'Assistant service currently offline.' }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !status.enabled) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/assistant/summary', { query: userMsg });
      setMessages((prev) => [...prev, { sender: 'assistant', text: res.data.summary }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text:
            err.response?.data?.detail ||
            'An error occurred while contacting the research assistant.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                NeuroLens Research Assistant
              </h3>
              <p className="text-[11px] text-slate-500">
                Backend Proxied • Architecture & Lineage Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notice if disabled */}
        {!status.enabled && (
          <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200/80 text-[11px] text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{status.message}</span>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {m.sender === 'user' ? 'U' : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-3.5 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing federated telemetry...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              status.enabled
                ? 'Ask about FedAvg weights, DenseNet121, or hospital shards...'
                : 'Assistant offline...'
            }
            disabled={loading || !status.enabled}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || !status.enabled}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
