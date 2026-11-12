import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/overview');
      } else {
        navigate('/hospital/overview');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (accEmail, accPass) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[var(--nl-canvas)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4 transform hover:scale-105 transition-transform">
          <Brain className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">NeuroLens</h1>
        <p className="mt-1.5 text-sm text-slate-500 font-medium">
          Federated Learning & Explainable AI Research Platform
        </p>
      </div>

      {/* Main Glass Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="apple-card p-8 bg-white border border-slate-200 shadow-xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Institutional Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@neurolens.org"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password-input"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Pre-fill Selector for Verified Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3 text-center">
              Quick Research Roles
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@neurolens.org', 'AdminSecurePassword2026!')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all cursor-pointer group"
              >
                <span className="font-semibold text-xs text-slate-800 group-hover:text-blue-700 block">
                  Central Admin
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">Global Scope</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickFill('hospital1@neurolens.org', 'Hospital1Password2026!')
                }
                className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-left transition-all cursor-pointer group"
              >
                <span className="font-semibold text-xs text-slate-800 group-hover:text-teal-700 block">
                  Hospital Alpha
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">hospital_1 Shard</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickFill('hospital2@neurolens.org', 'Hospital2Password2026!')
                }
                className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-left transition-all cursor-pointer group"
              >
                <span className="font-semibold text-xs text-slate-800 group-hover:text-teal-700 block">
                  Hospital Beta
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">hospital_2 Shard</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickFill('hospital3@neurolens.org', 'Hospital3Password2026!')
                }
                className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-left transition-all cursor-pointer group"
              >
                <span className="font-semibold text-xs text-slate-800 group-hover:text-teal-700 block">
                  Hospital Gamma
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">hospital_3 Shard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Role-based access strictly isolated per HIPAA & GDPR guidelines.</span>
        </div>
      </div>
    </div>
  );
}
