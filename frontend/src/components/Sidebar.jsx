import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  Cpu,
  ShieldCheck,
  Activity,
  LogOut,
  Bot,
  Layers,
  FlaskConical,
  Brain
} from 'lucide-react';
import AssistantModal from './GeminiAssistant';

export default function Sidebar() {
  const { user, isAdmin, isHospital, clientId, logout } = useAuth();
  const navigate = useNavigate();
  const [isAssistantOpen, setAssistantOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className="w-64 bg-white border-r border-[var(--nl-border)] flex flex-col justify-between h-screen shrink-0 sticky top-0">
        <div>
          {/* Logo / Brand */}
          <div className="p-6 border-b border-[var(--nl-border)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--nl-pale-blue)] to-[var(--nl-mint)] flex items-center justify-center text-[var(--nl-primary)] font-bold shadow-sm">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">NeuroLens</h1>
              <p className="text-[11px] text-[var(--nl-muted-forest)] uppercase tracking-wider font-semibold">Federated FL Lab</p>
            </div>
          </div>

          {/* User Badge */}
          <div className="p-4 mx-4 my-3 rounded-lg bg-[var(--nl-bg-canvas)] border border-[var(--nl-border)]">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.name || 'Researcher'}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${isAdmin ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
              <p className="text-[11px] text-[var(--nl-muted-forest)] font-medium">
                {isAdmin ? 'System Administrator' : `Hospital Client (${clientId})`}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {/* Universal MRI Analysis with HiResCAM Link */}
            <p className="px-3 py-1.5 text-[11px] font-semibold text-[var(--nl-muted-forest)] uppercase tracking-wider">
              Diagnostic & XAI
            </p>
            <NavLink
              to="/analyze"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-[var(--nl-mint)]/60 text-[var(--nl-text-main)] font-semibold border border-[var(--nl-border-strong)]'
                    : 'text-gray-600 hover:bg-[var(--nl-bg-canvas)]'
                }`
              }
            >
              <Brain className="w-4 h-4 text-[var(--nl-primary)]" />
              MRI Scan & HiResCAM
            </NavLink>

            {isAdmin && (
              <>
                <p className="px-3 pt-3 py-1.5 text-[11px] font-semibold text-[var(--nl-muted-forest)] uppercase tracking-wider">
                  Admin Platform
                </p>
                <NavLink
                  to="/admin/overview"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-[var(--nl-mint)]/60 text-[var(--nl-text-main)] font-semibold border border-[var(--nl-border-strong)]'
                        : 'text-gray-600 hover:bg-[var(--nl-bg-canvas)]'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--nl-primary)]" />
                  Federation Overview
                </NavLink>

                <NavLink
                  to="/admin/hospitals"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-[var(--nl-mint)]/60 text-[var(--nl-text-main)] font-semibold border border-[var(--nl-border-strong)]'
                        : 'text-gray-600 hover:bg-[var(--nl-bg-canvas)]'
                    }`
                  }
                >
                  <Building2 className="w-4 h-4 text-[var(--nl-primary)]" />
                  Hospital Clients
                </NavLink>

                <NavLink
                  to="/admin/models"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-[var(--nl-mint)]/60 text-[var(--nl-text-main)] font-semibold border border-[var(--nl-border-strong)]'
                        : 'text-gray-600 hover:bg-[var(--nl-bg-canvas)]'
                    }`
                  }
                >
                  <Cpu className="w-4 h-4 text-[var(--nl-primary)]" />
                  Model Registry
                </NavLink>

                <NavLink
                  to="/admin/experiments"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-[var(--nl-mint)]/60 text-[var(--nl-text-main)] font-semibold border border-[var(--nl-border-strong)]'
                        : 'text-gray-600 hover:bg-[var(--nl-bg-canvas)]'
                    }`
                  }
                >
                  <GitBranch className="w-4 h-4 text-[var(--nl-primary)]" />
                  Rounds & Experiments
                </NavLink>

                <NavLink
                  to="/admin/audit"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-[var(--nl-mint)]/60 text-[var(--nl-text-main)] font-semibold border border-[var(--nl-border-strong)]'
                        : 'text-gray-600 hover:bg-[var(--nl-bg-canvas)]'
                    }`
                  }
                >
                  <ShieldCheck className="w-4 h-4 text-[var(--nl-primary)]" />
                  Security & Audit
                </NavLink>
              </>
            )}

            {isHospital && (
              <>
                <p className="px-3 pt-3 py-1.5 text-[11px] font-semibold text-[var(--nl-muted-forest)] uppercase tracking-wider">
                  Client Workspace
                </p>
                <NavLink
                  to="/hospital/overview"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-[var(--nl-mint)]/60 text-[var(--nl-text-main)] font-semibold border border-[var(--nl-border-strong)]'
                        : 'text-gray-600 hover:bg-[var(--nl-bg-canvas)]'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--nl-primary)]" />
                  Client Overview
                </NavLink>

                <NavLink
                  to="/hospital/metrics"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-[var(--nl-mint)]/60 text-[var(--nl-text-main)] font-semibold border border-[var(--nl-border-strong)]'
                        : 'text-gray-600 hover:bg-[var(--nl-bg-canvas)]'
                    }`
                  }
                >
                  <Activity className="w-4 h-4 text-[var(--nl-primary)]" />
                  Local Shard Metrics
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--nl-border)] space-y-2">
          <button
            onClick={() => setAssistantOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-[var(--nl-pale-blue)]/30 hover:bg-[var(--nl-pale-blue)]/50 border border-[var(--nl-pale-blue)] transition cursor-pointer"
          >
            <Bot className="w-4 h-4 text-[var(--nl-primary)]" />
            AI Research Chatbot
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <AssistantModal isOpen={isAssistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
}
