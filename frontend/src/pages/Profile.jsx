import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Key, Shield, Mail, Calendar, CheckCircle, Sparkles, Brain } from 'lucide-react';

const Profile = () => {
  const { user, geminiApiKey, updateGeminiApiKey } = useAuth();
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    updateGeminiApiKey(apiKeyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-cyan-400" />
          User Profile & AI Key Configuration
        </h1>
        <p className="text-sm text-slate-400">Manage practitioner account settings and Google Gemini API credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-5 h-5 text-cyan-400" />
            Practitioner Credentials
          </h3>

          <div className="space-y-4 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Full Name</span>
              <p className="text-slate-100 font-medium">{user?.name || 'Practitioner'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Email Address</span>
              <p className="text-slate-100 font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                {user?.email || 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Role</span>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 capitalize">
                {user?.role || 'Doctor'}
              </span>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 uppercase font-semibold">Account Created</span>
              <p className="text-slate-300 text-xs flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Session'}
              </p>
            </div>
          </div>
        </div>

        {/* Gemini API Key Configuration Card */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-slate-950/70 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Direct Frontend Gemini API Key
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${geminiApiKey ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
              {geminiApiKey ? 'Configured' : 'Not Set'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            NeuroLens uses your Google Gemini API Key directly in the frontend to generate clinical decision support insights and patient explanation reports.
          </p>

          <form onSubmit={handleSaveKey} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Gemini API Key successfully saved!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20"
            >
              Save Gemini API Key
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
