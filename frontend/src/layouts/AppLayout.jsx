import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, Brain, Bot, ArrowRight, ShieldCheck } from 'lucide-react';
import AssistantModal from '../components/GeminiAssistant';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { user, isAdmin, clientId } = useAuth();

  return (
    <div className="flex min-h-screen bg-[var(--nl-canvas)] text-slate-900 font-sans antialiased">
      {/* Responsive Sidebar (Desktop sticky + Mobile slide-over) */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/80 border-b border-slate-200 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <Brain className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-base tracking-tight">NeuroLens</span>
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAssistantOpen(true)}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
              aria-label="Open AI assistant"
            >
              <Bot className="w-5 h-5 text-blue-600" />
            </button>
            {user ? (
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${
                  isAdmin ? 'badge-teal' : 'badge-blue'
                }`}
              >
                {isAdmin ? 'Admin' : clientId || 'Hospital'}
              </span>
            ) : (
              <NavLink
                to="/login"
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Sign In
              </NavLink>
            )}
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 lg:px-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Global Minimalist Apple-Style Footer */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white/50 backdrop-blur-sm py-6 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>NeuroLens Privacy-Preserving Explainable AI Research Platform</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <NavLink to="/architecture" className="hover:text-slate-900 transition-colors">
                Federated Architecture
              </NavLink>
              <NavLink to="/analyze" className="hover:text-slate-900 transition-colors">
                HiResCAM XAI
              </NavLink>
              <span>•</span>
              <span>Research Demo Only</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Gemini Assistant Modal on mobile header button */}
      <AssistantModal isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
