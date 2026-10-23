import React, { useEffect, useState } from 'react';
import { Building2, Cpu, HardDrive, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function HospitalOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/hospitals/me')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-[var(--nl-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold badge-mint">Authenticated Client Workspace</span>
          <span className="font-mono text-xs text-gray-500">{data?.client_id}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">{data?.display_name} Workspace</h2>
        <p className="text-sm text-[var(--nl-muted-forest)] mt-1">
          Local client partition for federated MRI Alzheimer's research. Only your institution's data and parameters are visible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="nl-card p-6 bg-white border border-[var(--nl-border)]">
          <span className="text-xs font-semibold text-[var(--nl-muted-forest)] uppercase">Local Shard Samples</span>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data?.sample_count?.toLocaleString()}</p>
          <p className="text-xs text-[var(--nl-muted-forest)] mt-2">Training items in client partition</p>
        </div>

        <div className="nl-card p-6 bg-white border border-[var(--nl-border)]">
          <span className="text-xs font-semibold text-[var(--nl-muted-forest)] uppercase">FedAvg Weight</span>
          <p className="text-3xl font-bold text-gray-900 mt-2">{(data?.fedavg_weight * 100).toFixed(2)}%</p>
          <p className="text-xs text-[var(--nl-muted-forest)] mt-2">Contribution ratio in Round 1 aggregation</p>
        </div>

        <div className="nl-card p-6 bg-white border border-[var(--nl-border)]">
          <span className="text-xs font-semibold text-[var(--nl-muted-forest)] uppercase">Client Readiness</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="p-1 rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="text-lg font-bold text-gray-900 capitalize">{data?.status}</span>
          </div>
          <p className="text-xs text-[var(--nl-muted-forest)] mt-2">Model weights verified and ready</p>
        </div>
      </div>

      <div className="nl-card p-6 bg-white border border-[var(--nl-border)]">
        <h3 className="font-bold text-gray-900 text-base mb-3">Current Active Global Model</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[var(--nl-muted-forest)] block mb-0.5">Global Checkpoint</span>
            <span className="font-mono text-gray-800 font-semibold">{data?.active_global_model?.version_tag} (DenseNet121)</span>
          </div>
          <div>
            <span className="text-[var(--nl-muted-forest)] block mb-0.5">Global Checkpoint SHA-256</span>
            <span className="font-mono text-gray-800 break-all">{data?.active_global_model?.sha256}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[var(--nl-warm-cream)]/50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
        <span>Privacy Notice: {data?.evaluation_caveat}</span>
      </div>
    </div>
  );
}
