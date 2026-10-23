import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FlaskConical, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  };

  return (
    <div className="min-h-screen bg-[var(--nl-bg-canvas)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--nl-pale-blue)] to-[var(--nl-mint)] flex items-center justify-center text-[var(--nl-primary)] shadow-sm mb-4">
          <FlaskConical className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">NeuroLens</h2>
        <p className="mt-1 text-sm text-[var(--nl-muted-forest)] font-medium">
          Federated Learning Research Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[var(--nl-border)] sm:rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Account Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@neurolens.org"
                  className="w-full px-3.5 py-2.5 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nl-pale-blue)]"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nl-pale-blue)]"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[var(--nl-primary)] hover:bg-[var(--nl-primary-hover)] text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick-select Seed Accounts for Testing/Verification */}
          <div className="mt-8 pt-6 border-t border-[var(--nl-border)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--nl-muted-forest)] mb-3 text-center">
              Seeded Research Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@neurolens.org', 'AdminSecurePassword2026!')}
                className="p-2 text-left bg-[var(--nl-bg-canvas)] hover:bg-[var(--nl-mint)]/40 border border-[var(--nl-border)] rounded-lg transition"
              >
                <p className="text-xs font-semibold text-gray-900">Administrator</p>
                <p className="text-[10px] text-gray-500 truncate">admin@neurolens.org</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('hospital1@neurolens.org', 'Hospital1Password2026!')}
                className="p-2 text-left bg-[var(--nl-bg-canvas)] hover:bg-[var(--nl-mint)]/40 border border-[var(--nl-border)] rounded-lg transition"
              >
                <p className="text-xs font-semibold text-gray-900">Hospital Alpha</p>
                <p className="text-[10px] text-gray-500 truncate">hospital1@neurolens.org</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('hospital2@neurolens.org', 'Hospital2Password2026!')}
                className="p-2 text-left bg-[var(--nl-bg-canvas)] hover:bg-[var(--nl-mint)]/40 border border-[var(--nl-border)] rounded-lg transition"
              >
                <p className="text-xs font-semibold text-gray-900">Hospital Beta</p>
                <p className="text-[10px] text-gray-500 truncate">hospital2@neurolens.org</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('hospital3@neurolens.org', 'Hospital3Password2026!')}
                className="p-2 text-left bg-[var(--nl-bg-canvas)] hover:bg-[var(--nl-mint)]/40 border border-[var(--nl-border)] rounded-lg transition"
              >
                <p className="text-xs font-semibold text-gray-900">Hospital Gamma</p>
                <p className="text-[10px] text-gray-500 truncate">hospital3@neurolens.org</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
