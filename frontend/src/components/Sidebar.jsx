import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Cpu,
  GitBranch,
  ShieldCheck,
  Activity,
  LogOut,
  Bot,
  Brain,
  Home,
  Network,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import AssistantModal from './GeminiAssistant';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, isHospital, clientId, logout } = useAuth();
  const navigate = useNavigate();
  const [isAssistantOpen, setAssistantOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Logo / Header */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight block leading-tight">
                NeuroLens
              </span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Explainable AI
              </span>
            </div>
          </NavLink>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Workspace Status Pill */}
        {user && (
          <div className="mx-4 my-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 truncate">
                {user?.name || 'Researcher'}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                  isAdmin ? 'badge-teal' : 'badge-blue'
                }`}
              >
                {isAdmin ? 'Central Admin' : clientId || 'Hospital'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-1">
              {user?.email}
            </p>
          </div>
        )}

        {/* Navigation Groups */}
        <nav className="px-3 pt-3 space-y-6">
          {/* Universal Diagnostic & Public Hub */}
          <div>
            <p className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Diagnostic & Research
            </p>
            <div className="space-y-1">
              <NavLink to="/" onClick={onClose} className={navItemClass}>
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  <span>Platform Overview</span>
                </div>
              </NavLink>

              <NavLink to="/analyze" onClick={onClose} className={navItemClass}>
                <div className="flex items-center gap-3">
                  <Brain className="w-4 h-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
                  <span>MRI Scan & HiResCAM</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-700">
                  XAI
                </span>
              </NavLink>

              <NavLink to="/architecture" onClick={onClose} className={navItemClass}>
                <div className="flex items-center gap-3">
                  <Network className="w-4 h-4 text-teal-600 group-hover:text-teal-700 transition-colors" />
                  <span>Federated Architecture</span>
                </div>
              </NavLink>
            </div>
          </div>

          {/* Admin Platform Workspace */}
          {isAdmin && (
            <div>
              <p className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Admin Federation
              </p>
              <div className="space-y-1">
                <NavLink to="/admin/overview" onClick={onClose} className={navItemClass}>
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>Global Telemetry</span>
                  </div>
                </NavLink>

                <NavLink to="/admin/hospitals" onClick={onClose} className={navItemClass}>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>Hospital Partitions</span>
                  </div>
                </NavLink>

                <NavLink to="/admin/models" onClick={onClose} className={navItemClass}>
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>Model Registry</span>
                  </div>
                </NavLink>

                <NavLink to="/admin/experiments" onClick={onClose} className={navItemClass}>
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>Rounds & Trials</span>
                  </div>
                </NavLink>

                <NavLink to="/admin/audit" onClick={onClose} className={navItemClass}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>Security Audit</span>
                  </div>
                </NavLink>
              </div>
            </div>
          )}

          {/* Hospital Partition Workspace */}
          {isHospital && (
            <div>
              <p className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Institutional Client
              </p>
              <div className="space-y-1">
                <NavLink to="/hospital/overview" onClick={onClose} className={navItemClass}>
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>Client Workspace</span>
                  </div>
                </NavLink>

                <NavLink to="/hospital/metrics" onClick={onClose} className={navItemClass}>
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>Local Shard Metrics</span>
                  </div>
                </NavLink>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200/80 space-y-2">
        <button
          onClick={() => {
            if (onClose) onClose();
            setAssistantOpen(true);
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50/70 hover:text-blue-700 border border-slate-200 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Bot className="w-4 h-4 text-blue-600" />
            <span>AI Research Assistant</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        </button>

        {user ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <NavLink
            to="/login"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <span>Sign In</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </NavLink>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/95 border-r border-slate-200/80 h-screen sticky top-0 shrink-0 z-30 backdrop-blur-md">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Gemini Research Assistant Modal */}
      <AssistantModal isOpen={isAssistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
}
