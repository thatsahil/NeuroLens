import React, { useEffect, useState } from 'react';
import { Building2, Cpu, HardDrive, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import api from '../../services/api';

export default function HospitalOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/hospitals/me')
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold badge-teal">
              Institutional Partition
            </span>
            <span className="font-mono text-xs text-slate-500">{data?.client_id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            {data?.display_name} Workspace
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Isolated local client partition for federated MRI research. Only institutional data is visible.
          </p>
        </div>

        <NavLink
          to="/analyze"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all"
        >
          <span>Run Local MRI Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </NavLink>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="apple-card p-6 bg-white">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Local Shard Samples
          </span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {data?.sample_count?.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-2">Patient MRI slices in client shard</p>
        </div>

        <div className="apple-card p-6 bg-white">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            FedAvg Contribution Weight
          </span>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">
            {(data?.fedavg_weight * 100).toFixed(2)}%
          </p>
          <p className="text-xs text-slate-500 mt-2">Aggregation coefficient for Round 1</p>
        </div>

        <div className="apple-card p-6 bg-white">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Client Readiness State
          </span>
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-lg font-bold text-slate-900 capitalize">{data?.status}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Weights synchronized and verified</p>
        </div>
      </div>

      <div className="apple-card p-6 bg-white space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Synchronized Global Checkpoint</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
          <div>
            <span className="text-slate-400 block mb-0.5">Model Identifier</span>
            <span className="font-mono text-slate-800 font-semibold">
              {data?.active_global_model?.version_tag} (DenseNet121)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Verified SHA-256</span>
            <span className="font-mono text-slate-800 break-all">
              {data?.active_global_model?.sha256}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
        <span>Privacy Notice: {data?.evaluation_caveat}</span>
      </div>
    </div>
  );
}
