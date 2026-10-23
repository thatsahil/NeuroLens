import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Database } from 'lucide-react';
import api from '../../services/api';

export default function HospitalMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/hospitals/me/metrics')
      .then(res => {
        setMetrics(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Local Shard Class & Metric Breakdown</h2>
        <p className="text-sm text-[var(--nl-muted-forest)] mt-1">
          Detailed class breakdown and verified local metrics for {metrics?.client_id || 'client partition'}.
        </p>
      </div>

      <div className="nl-card p-6 bg-white border border-[var(--nl-border)]">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Local Class Distribution (DenseNet121 Target Classes)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics && Object.entries(metrics.classes).map(([className, status]) => (
            <div key={className} className="p-4 bg-[var(--nl-bg-canvas)] border border-[var(--nl-border)] rounded-xl">
              <span className="text-xs text-[var(--nl-muted-forest)] block font-medium">Class Target</span>
              <p className="font-bold text-gray-900 text-sm mt-1">{className}</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold badge-mint">
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="nl-card p-6 bg-white border border-[var(--nl-border)]">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-[var(--nl-primary)]" />
          <h3 className="font-bold text-gray-900 text-sm">Local Training Loss / Accuracy History</h3>
        </div>
        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-800 text-sm">Evaluation Status: {metrics?.local_evaluation_status || 'Not evaluated'}</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            {metrics?.note || 'No local loss/accuracy curve is derived without an explicit evaluation protocol execution.'}
          </p>
        </div>
      </div>
    </div>
  );
}
