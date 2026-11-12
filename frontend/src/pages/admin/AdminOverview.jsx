import React, { useEffect, useState } from 'react';
import {
  Layers,
  Building2,
  Cpu,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  HardDrive,
  Activity,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { NavLink } from 'react-router-dom';
import api from '../../services/api';

const COLORS = ['#2563EB', '#0D9488', '#F59E0B'];

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/admin/overview')
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load federated overview.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Loading federated telemetry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
        {error}
      </div>
    );
  }

  const { kpis, active_model, hospitals, recent_audits } = data;

  const sampleDistributionData = hospitals.map((h) => ({
    name: h.display_name,
    samples: h.sample_count,
    weight: (h.fedavg_weight * 100).toFixed(1)
  }));

  const pieData = hospitals.map((h) => ({
    name: h.display_name,
    value: h.sample_count
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold badge-teal">
              Central Federation Hub
            </span>
            <span className="text-xs font-mono text-slate-500">Global Admin Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Federated Telemetry & Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time aggregate status across distributed hospital partitions and model lineage.
          </p>
        </div>

        <NavLink
          to="/analyze"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all"
        >
          <span>Run MRI Diagnostic</span>
          <ArrowRight className="w-4 h-4" />
        </NavLink>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apple-card p-5 bg-white">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Participating Clients
          </span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{kpis?.participating_hospitals}</p>
          <span className="inline-block mt-2 text-[11px] text-teal-700 font-medium">
            Alpha, Beta, Gamma
          </span>
        </div>

        <div className="apple-card p-5 bg-white">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Distributed Data
          </span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {kpis?.total_training_samples?.toLocaleString()}
          </p>
          <span className="inline-block mt-2 text-[11px] text-slate-500 font-medium">
            MRI Training Slices
          </span>
        </div>

        <div className="apple-card p-5 bg-white">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Current Federated Round
          </span>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">Round {kpis?.current_round}</p>
          <span className="inline-block mt-2 text-[11px] text-slate-500 font-medium">
            Aggregated via FedAvg
          </span>
        </div>

        <div className="apple-card p-5 bg-white">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Federation Health
          </span>
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-lg font-bold text-slate-900 capitalize">
              {kpis?.federation_status}
            </span>
          </div>
          <span className="inline-block mt-2 text-[11px] text-emerald-700 font-medium">
            All nodes synchronized
          </span>
        </div>
      </div>

      {/* Active Model & Checkpoint Spec */}
      <div className="apple-card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <span>Active Inference Checkpoint Specifications</span>
          </h2>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold badge-teal">
            {active_model?.version_tag}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Architecture</span>
            <span className="font-semibold text-slate-800">DenseNet121 Backbone</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Final Classifier</span>
            <span className="font-mono text-slate-800 font-semibold">nn.Linear(1024, 4)</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Aggregation Method</span>
            <span className="font-semibold text-slate-800">Sample-Weighted FedAvg</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Active Checkpoint SHA-256</span>
            <span className="font-mono text-slate-800 truncate block">
              {active_model?.sha256}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section: Sample Weight Breakdown & Shard Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="apple-card p-6 bg-white space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Institutional Training Volume by Shard
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleDistributionData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [val.toLocaleString(), 'Samples']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="samples" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="apple-card p-6 bg-white space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">FedAvg Aggregation Proportions</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [val.toLocaleString(), 'Samples']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Security & Audit Logs */}
      <div className="apple-card bg-white overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Recent Administrative & Diagnostic Events</span>
          </h3>
          <NavLink
            to="/admin/audit"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View Full Audit Trail
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase text-[10px] font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Client Shard</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent_audits?.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3.5 font-mono text-slate-500">
                    {new Date(a.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 font-mono font-semibold text-slate-900">
                    {a.action}
                  </td>
                  <td className="px-6 py-3.5 capitalize">{a.role}</td>
                  <td className="px-6 py-3.5 font-mono">{a.client_id || 'Global'}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        a.status === 'success' ? 'badge-teal' : 'badge-rose'
                      }`}
                    >
                      {a.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
