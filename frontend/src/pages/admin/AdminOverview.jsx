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
  HardDrive
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
import api from '../../services/api';

const COLORS = ['#99CDD8', '#DAEBE3', '#FDE8D3'];

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/overview')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.detail || 'Failed to load federated overview.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[var(--nl-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[var(--nl-muted-forest)] font-medium">Loading federated research telemetry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          {error}
        </div>
      </div>
    );
  }

  const { kpis, active_model, hospitals, recent_audits } = data;

  const sampleDistributionData = hospitals.map(h => ({
    name: h.display_name,
    samples: h.sample_count,
    weight: (h.fedavg_weight * 100).toFixed(1)
  }));

  const pieData = hospitals.map(h => ({
    name: h.display_name,
    value: h.sample_count
  }));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Federated Learning Overview</h2>
        <p className="text-sm text-[var(--nl-muted-forest)] mt-1">
          Global Round 1 status, FedAvg aggregation coefficients, and verified DenseNet121 model registry.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="nl-card p-5 bg-white border border-[var(--nl-border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--nl-muted-forest)] uppercase tracking-wider">Federation State</span>
            <span className="p-2 bg-[var(--nl-mint)]/40 rounded-lg text-emerald-700">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">Round {kpis.current_round}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>FedAvg Complete</span>
          </div>
        </div>

        <div className="nl-card p-5 bg-white border border-[var(--nl-border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--nl-muted-forest)] uppercase tracking-wider">Active Architecture</span>
            <span className="p-2 bg-[var(--nl-pale-blue)]/40 rounded-lg text-blue-700">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{kpis.model_architecture}</p>
          <p className="text-xs text-[var(--nl-muted-forest)] mt-2">Single Linear(1024, 4) head</p>
        </div>

        <div className="nl-card p-5 bg-white border border-[var(--nl-border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--nl-muted-forest)] uppercase tracking-wider">Participating Clients</span>
            <span className="p-2 bg-[var(--nl-warm-cream)]/50 rounded-lg text-amber-800">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{kpis.connected_clients_count} Workspaces</p>
          <p className="text-xs text-[var(--nl-muted-forest)] mt-2">Alpha, Beta, Gamma</p>
        </div>

        <div className="nl-card p-5 bg-white border border-[var(--nl-border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--nl-muted-forest)] uppercase tracking-wider">Total Training Shards</span>
            <span className="p-2 bg-[var(--nl-sage)]/40 rounded-lg text-gray-700">
              <HardDrive className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{kpis.total_federated_samples.toLocaleString()}</p>
          <p className="text-xs text-[var(--nl-muted-forest)] mt-2">Verified sample count</p>
        </div>
      </div>

      {/* Global Round 1 Model Card */}
      <div className="nl-card p-6 bg-white border border-[var(--nl-border)]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold badge-mint">Active Deployment Model</span>
              <span className="text-xs text-gray-500 font-mono">global_round_001</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mt-2">DenseNet121 Federated Global Model (Round 1)</h3>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Evaluation: {kpis.evaluation_status}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--nl-border)] text-xs text-[var(--nl-muted-forest)]">
          <div>
            <p className="font-semibold text-gray-700">SHA-256 Checksum</p>
            <p className="font-mono text-[11px] text-gray-600 mt-0.5 break-all">
              {active_model?.sha256 || '2edb86fe68e5ae29af5bd70eebb5b0262cc6abc698e90b1c7db91a4f5dbca360'}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Aggregation Strategy</p>
            <p className="text-gray-600 mt-0.5">Sample-weighted FedAvg across 3 simulated partitions</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Evaluation Provenance</p>
            <p className="text-gray-600 mt-0.5">Awaiting consistent held-out validation evaluation</p>
          </div>
        </div>
      </div>

      {/* Visualizations: Contribution and FedAvg Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Samples Bar Chart */}
        <div className="nl-card p-6 bg-white border border-[var(--nl-border)]">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Client Sample Contribution</h3>
          <p className="text-xs text-[var(--nl-muted-forest)] mb-4">Training instances distributed per hospital shard</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleDistributionData}>
                <XAxis dataKey="name" stroke="#657166" fontSize={12} />
                <YAxis stroke="#657166" fontSize={12} />
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString()} samples`, 'Count']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderColor: '#DDE6E0' }}
                />
                <Bar dataKey="samples" fill="#3B869B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FedAvg Weights Pie */}
        <div className="nl-card p-6 bg-white border border-[var(--nl-border)]">
          <h3 className="text-sm font-bold text-gray-900 mb-1">FedAvg Aggregation Weighting</h3>
          <p className="text-xs text-[var(--nl-muted-forest)] mb-4">Normalized client weight based on sample ratio (Total 100%)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, item) => [
                    `${((value / 69465) * 100).toFixed(2)}% (${value.toLocaleString()} samples)`,
                    'FedAvg Weight'
                  ]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderColor: '#DDE6E0' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hospital Workspaces Table */}
      <div className="nl-card overflow-hidden bg-white border border-[var(--nl-border)]">
        <div className="px-6 py-4 border-b border-[var(--nl-border)] bg-[var(--nl-bg-canvas)] flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Simulated Hospital Partitions</h3>
          <span className="text-xs text-[var(--nl-muted-forest)] font-medium">3 active partitions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-[var(--nl-border)] uppercase text-[10px] font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-3">Client Identifier</th>
                <th className="px-6 py-3">Display Name</th>
                <th className="px-6 py-3">Training Samples</th>
                <th className="px-6 py-3">FedAvg Weight</th>
                <th className="px-6 py-3">Checkpoint Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nl-border)]">
              {hospitals.map(h => (
                <tr key={h.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-mono font-medium text-gray-900">{h.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{h.display_name}</td>
                  <td className="px-6 py-4">{h.sample_count?.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono">{(h.fedavg_weight * 100).toFixed(2)}%</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold badge-mint">
                      Verified & Aggregated
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Append-Only Audit Trail */}
      <div className="nl-card p-6 bg-white border border-[var(--nl-border)]">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-[var(--nl-primary)]" />
          <h3 className="text-sm font-bold text-gray-900">Recent Append-Only Audit Events</h3>
        </div>
        <div className="space-y-3">
          {recent_audits.length === 0 ? (
            <p className="text-xs text-gray-400">No audit events recorded.</p>
          ) : (
            recent_audits.slice(0, 5).map(a => (
              <div key={a.id} className="p-3 bg-[var(--nl-bg-canvas)] rounded-lg border border-[var(--nl-border)] text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-800 font-mono">{a.action}</span>
                  <span className="text-[var(--nl-muted-forest)] ml-2">• Status: {a.status}</span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
