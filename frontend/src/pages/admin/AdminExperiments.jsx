import React, { useEffect, useState } from 'react';
import { GitBranch, Plus, X, Play, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function AdminExperiments() {
  const [experiments, setExperiments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: 'Federated Round 2 Trial',
    description: 'Scheduled validation iteration with sample-weighted FedAvg',
    target_round: 2,
    participating_clients: ['hospital_1', 'hospital_2', 'hospital_3'],
    epochs_per_client: 3,
    batch_size: 32,
    learning_rate: 0.0001
  });
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchExperiments = () => {
    api.get('/experiments')
      .then(res => {
        setExperiments(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/experiments', form);
      setShowModal(false);
      setActionMsg('Experiment queued successfully. Note: app does not auto-train without explicit worker execution.');
      fetchExperiments();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create experiment');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this queued experiment?')) return;
    try {
      await api.post(`/experiments/${id}/cancel`);
      fetchExperiments();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel experiment');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Federated Rounds & Experiments</h2>
          <p className="text-sm text-[var(--nl-muted-forest)] mt-1">
            Configure future federation rounds. No training runs automatically on startup.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[var(--nl-primary)] hover:bg-[var(--nl-primary-hover)] text-white text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Configure Future Round
        </button>
      </div>

      {actionMsg && (
        <div className="p-4 bg-[var(--nl-mint)]/40 border border-emerald-300 rounded-xl text-emerald-900 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Experiments List */}
      <div className="space-y-4">
        {experiments.map(exp => (
          <div key={exp.id} className="nl-card p-6 bg-white border border-[var(--nl-border)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-base">{exp.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    exp.status === 'completed' ? 'badge-mint' :
                    exp.status === 'queued' ? 'badge-blue' :
                    exp.status === 'cancelled' ? 'badge-coral' : 'badge-sage'
                  }`}>
                    {exp.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[var(--nl-muted-forest)] mt-1">
                  Target Round: {exp.current_round} • Aggregation: {exp.aggregation_method} • Parent: {exp.parent_model}
                </p>
              </div>

              {exp.status === 'queued' && (
                <button
                  onClick={() => handleCancel(exp.id)}
                  className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition"
                >
                  Cancel Run
                </button>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--nl-border)] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
              <div>
                <span className="text-[var(--nl-muted-forest)] block">Participating Shards</span>
                <span className="font-semibold text-gray-900">{exp.participating_clients?.join(', ')}</span>
              </div>
              <div>
                <span className="text-[var(--nl-muted-forest)] block">Local Epochs</span>
                <span className="font-semibold text-gray-900">{exp.epochs_per_client || 3} epochs</span>
              </div>
              <div>
                <span className="text-[var(--nl-muted-forest)] block">Batch Size</span>
                <span className="font-semibold text-gray-900">{exp.batch_size || 32}</span>
              </div>
              <div>
                <span className="text-[var(--nl-muted-forest)] block">Created At</span>
                <span className="text-gray-900">{new Date(exp.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Experiment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-[var(--nl-border)] overflow-hidden">
            <div className="px-6 py-4 bg-[var(--nl-mint)]/40 border-b border-[var(--nl-border)] flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Configure Future Federation Round</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Experiment Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nl-pale-blue)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Target Round Index</label>
                <input
                  type="number"
                  min="2"
                  value={form.target_round}
                  onChange={e => setForm({ ...form, target_round: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nl-pale-blue)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Epochs Per Client</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.epochs_per_client}
                    onChange={e => setForm({ ...form, epochs_per_client: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nl-pale-blue)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Batch Size</label>
                  <input
                    type="number"
                    value={form.batch_size}
                    onChange={e => setForm({ ...form, batch_size: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nl-pale-blue)]"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <span>Notice: Creating this configuration registers a queued round. Automatic execution on startup is strictly disabled.</span>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[var(--nl-border)]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--nl-primary)] hover:bg-[var(--nl-primary-hover)] text-white text-sm font-semibold rounded-lg shadow-sm"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
