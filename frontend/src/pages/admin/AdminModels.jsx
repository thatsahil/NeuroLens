import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, Layers, GitCommit } from 'lucide-react';
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

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Federated Model Registry</h2>
        <p className="text-sm text-[var(--nl-muted-forest)] mt-1">
          Immutable model lineage from Global Round 0 initialization through FedAvg Global Round 1.
        </p>
      </div>

      <div className="space-y-4">
        {models.map(m => (
          <div key={m.id} className="nl-card p-6 bg-white border border-[var(--nl-border)]">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${m.is_active ? 'bg-[var(--nl-mint)] text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">{m.model_name || 'DenseNet121'}</h3>
                    <span className="font-mono text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">{m.version_tag}</span>
                    {m.is_active && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold badge-mint flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active Checkpoint
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--nl-muted-forest)] mt-1">
                    Aggregation: {m.aggregation_method} • Round {m.round}
                    {m.parent_version && ` • Parent: ${m.parent_version}`}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                Evaluation: {m.evaluation_status || 'Not evaluated'}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--nl-border)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[var(--nl-muted-forest)] block mb-0.5">SHA-256 Checksum</span>
                <span className="font-mono text-gray-800 break-all">{m.sha256}</span>
              </div>
              <div>
                <span className="text-[var(--nl-muted-forest)] block mb-0.5">Architecture Specifications</span>
                <span className="text-gray-800">DenseNet121 Backbone • Single Linear(1024, 4) Head</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
