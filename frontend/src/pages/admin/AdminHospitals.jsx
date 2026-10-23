import React, { useEffect, useState } from 'react';
import { Building2, Database, ShieldAlert, Cpu } from 'lucide-react';
import api from '../../services/api';

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/hospitals')
      .then(res => {
        setHospitals(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Hospital Client Partitions</h2>
        <p className="text-sm text-[var(--nl-muted-forest)] mt-1">
          Simulated institutional client workspaces participating in the NeuroLens federated training protocol.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hospitals.map(h => (
          <div key={h.id} className="nl-card p-6 bg-white border border-[var(--nl-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 bg-[var(--nl-mint)]/40 rounded-xl text-[var(--nl-primary)]">
                  <Building2 className="w-5 h-5" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold badge-mint">
                  {h.status || 'Ready'}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{h.display_name}</h3>
              <p className="text-xs font-mono text-[var(--nl-muted-forest)] mt-0.5">{h.id}</p>

              <div className="mt-5 space-y-3 pt-4 border-t border-[var(--nl-border)] text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="text-[var(--nl-muted-forest)]">Training Shard Count:</span>
                  <span className="font-semibold text-gray-900">{h.sample_count?.toLocaleString()} samples</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nl-muted-forest)]">FedAvg Weight:</span>
                  <span className="font-mono font-semibold text-gray-900">{(h.fedavg_weight * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nl-muted-forest)]">Round 1 Checkpoint:</span>
                  <span className="font-mono text-[10px] text-gray-500 truncate max-w-[130px]">
                    {h.round_1_checkpoint_hash?.slice(0, 16)}...
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--nl-border)] text-[11px] text-[var(--nl-muted-forest)] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Simulated single-machine partition.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
