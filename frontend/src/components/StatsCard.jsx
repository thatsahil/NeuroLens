import React from 'react';

const StatsCard = ({ title, value, subtitle, icon: Icon, color = "cyan", trend }) => {
  const colorMap = {
    cyan: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
    emerald: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    amber: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
    rose: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400",
    purple: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400"
  };

  const style = colorMap[color] || colorMap.cyan;

  return (
    <div className={`p-6 rounded-2xl glass-panel bg-gradient-to-br ${style} border backdrop-blur-md relative overflow-hidden transition-transform duration-200 hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold tracking-tight text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 shadow-inner">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
