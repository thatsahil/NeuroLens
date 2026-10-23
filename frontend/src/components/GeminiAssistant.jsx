import React, { useState, useEffect } from 'react';
import { Bot, Send, Sparkles, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
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
      api.get('/assistant/status')
        .then(res => setStatus(res.data))
        .catch(() => setStatus({ enabled: false, message: 'Assistant service currently offline.' }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !status.enabled) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/assistant/summary', { query: userMsg });
      setMessages(prev => [...prev, { sender: 'assistant', text: res.data.summary }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: err.response?.data?.detail || 'An error occurred while contacting the research assistant.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[var(--nl-border)] flex flex-col h-[600px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[var(--nl-mint)]/40 border-b border-[var(--nl-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--nl-pale-blue)]/50 text-[var(--nl-text-main)]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Federated Research Assistant</h3>
              <p className="text-xs text-[var(--nl-muted-forest)]">Backend Proxied • Architecture & Lineage Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-md transition text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notice */}
        {!status.enabled && (
          <div className="px-4 py-2 bg-[var(--nl-warm-cream)]/50 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{status.message}</span>
          </div>
        )}

        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--nl-bg-canvas)]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
                  m.sender === 'user'
                    ? 'bg-[var(--nl-primary)] text-white'
                    : 'bg-white border border-[var(--nl-border)] text-[var(--nl-text-main)]'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[var(--nl-border)] rounded-lg px-4 py-2 text-xs text-gray-500 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[var(--nl-primary)]" />
                Analyzing research context...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-[var(--nl-border)] bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!status.enabled || loading}
            placeholder={status.enabled ? "Ask a question regarding the federated architecture or round status..." : "Assistant is disabled on backend"}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nl-pale-blue)] disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!status.enabled || loading || !input.trim()}
            className="px-4 py-2 bg-[var(--nl-primary)] hover:bg-[var(--nl-primary-hover)] text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-1.5 transition"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
