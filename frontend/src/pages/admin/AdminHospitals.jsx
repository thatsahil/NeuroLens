import React, { useEffect, useState } from 'react';
import { Building2, Database, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/hospitals')
      .then((res) => {
        setHospitals(res.data);
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
      <div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold badge-teal">
            Partition Network
          </span>
          <span className="text-xs font-mono text-slate-500">Local Data Sharding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Hospital Client Partitions
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Simulated institutional client workspaces participating in the NeuroLens federated training protocol.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hospitals.map((h) => (
          <div key={h.id} className="apple-card p-6 bg-white flex flex-col justify-between apple-card-hover">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold badge-teal">
                  {h.status || 'Ready'}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-lg">{h.display_name}</h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{h.id}</p>

              <div className="mt-5 space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Training Shard Count:</span>
                  <span className="font-semibold text-slate-900">{h.sample_count?.toLocaleString()} samples</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">FedAvg Weight:</span>
                  <span className="font-mono font-semibold text-blue-700">
                    {(h.fedavg_weight * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Round 1 Checkpoint:</span>
                  <span className="font-mono text-[11px] text-slate-600 truncate max-w-[140px]">
                    {h.round_1_checkpoint_hash?.slice(0, 16)}...
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Isolated Local Shard Storage</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
