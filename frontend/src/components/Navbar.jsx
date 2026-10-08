import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, LogOut, User, Sparkles, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout, geminiApiKey } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              NeuroLens
            </span>
            <span className="text-[10px] text-slate-400 tracking-widest font-mono uppercase">DenseNet121 MRI AI</span>
          </div>
        </Link>

        {/* User / Settings / Status */}
        <div className="flex items-center gap-4">
          {/* Gemini AI Status Badge */}
          <Link to="/profile" className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:border-cyan-500/40 transition-colors">
            <Sparkles className={`w-3.5 h-3.5 ${geminiApiKey ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Gemini AI:</span>
            <span className={`font-medium ${geminiApiKey ? 'text-emerald-400' : 'text-slate-400'}`}>
              {geminiApiKey ? 'Ready' : 'Configure Key'}
            </span>
          </Link>

          {/* User Badge */}
          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="flex flex-col text-right hidden md:block">
                <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                <span className="text-[11px] text-cyan-400 capitalize flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3 h-3" /> {user.role}
                </span>
              </div>
              
              <Link to="/profile" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                <User className="w-5 h-5" />
              </Link>
              
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
