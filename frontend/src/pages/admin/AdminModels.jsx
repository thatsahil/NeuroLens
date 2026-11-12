import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, Layers, GitCommit, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export default function AdminModels() {
  const [models, setModels] = useState([]);
  const [activeModel, setActiveModel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/models'), api.get('/models/active')])
      .then(([modelsRes, activeRes]) => {
        setModels(modelsRes.data);
        setActiveModel(activeRes.data);
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
            Immutable Lineage
          </span>
          <span className="text-xs font-mono text-slate-500">DenseNet121 • Weights Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Federated Model Registry
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Complete lineage and architectural checkpoints from Global Round 0 through FedAvg Round 1.
        </p>
      </div>

      <div className="space-y-4">
        {models.map((m) => (
          <div key={m.id} className="apple-card p-6 bg-white border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-2xl ${
                    m.is_active
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-slate-50 text-slate-500 border border-slate-200'
                  }`}
                >
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{m.model_name || 'DenseNet121'}</h3>
                    <span className="font-mono text-xs px-2.5 py-0.5 bg-slate-100 rounded-lg text-slate-600">
                      {m.version_tag}
                    </span>
                    {m.is_active && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold badge-teal flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active Checkpoint
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Aggregation: <strong className="text-slate-700">{m.aggregation_method}</strong> • Round {m.round}
                    {m.parent_version && ` • Parent: ${m.parent_version}`}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl text-xs font-medium badge-amber self-start">
                Evaluation: {m.evaluation_status || 'Not evaluated'}
              </span>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">SHA-256 Checksum</span>
                <span className="font-mono text-slate-800 break-all">{m.sha256}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Architecture Specifications</span>
                <span className="text-slate-800 font-medium">DenseNet121 • Single Linear(1024, 4) Head</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
