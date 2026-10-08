import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileScan, History, UserCog, Sparkles, BrainCircuit } from 'lucide-react';


const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/analyze', label: 'Upload & Analyze MRI', icon: FileScan },
    { to: '/predictions', label: 'Scan History', icon: History },
    { to: '/profile', label: 'User Profile & AI Key', icon: UserCog },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 bg-slate-950/60 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 tracking-wider uppercase">
          Clinical Navigation
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Model Spec Card */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
          <BrainCircuit className="w-4 h-4" />
          <span>DenseNet121 Engine</span>
        </div>
        <div className="text-[11px] text-slate-400 space-y-1 font-mono">
          <p>Accuracy: <span className="text-emerald-400">99.04%</span></p>
          <p>Classes: <span>4 Demented Stages</span></p>
          <p>Status: <span className="text-cyan-300">Ready (Eval)</span></p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
