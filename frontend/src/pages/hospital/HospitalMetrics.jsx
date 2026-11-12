import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Database, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function HospitalMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/hospitals/me/metrics')
      .then((res) => {
        setMetrics(res.data);
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
            Local Partition Metrics
          </span>
          <span className="font-mono text-xs text-slate-500">
            {metrics?.client_id || 'hospital_shard'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Class Distribution & Evaluation Status
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Detailed class breakdown and verified local metrics for this hospital shard.
        </p>
      </div>

      <div className="apple-card p-6 bg-white space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">
          Target Diagnostic Classes (DenseNet121)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {metrics &&
            Object.entries(metrics.classes).map(([className, status]) => (
              <div
                key={className}
                className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl"
              >
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                  Class Label
                </span>
                <p className="font-bold text-slate-900 text-sm mt-1">{className}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold badge-teal">
                  {status}
                </span>
              </div>
            ))}
        </div>
      </div>

      <div className="apple-card p-6 bg-white space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Local Loss & Accuracy Curve</h3>
        </div>
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h4 className="font-semibold text-slate-800 text-sm">
            Status: {metrics?.local_evaluation_status || 'Not evaluated'}
          </h4>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            {metrics?.note ||
              'No local loss/accuracy curve is derived without an explicit evaluation protocol execution.'}
          </p>
        </div>
      </div>
    </div>
  );
}
