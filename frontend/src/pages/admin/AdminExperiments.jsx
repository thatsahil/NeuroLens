import React, { useEffect, useState } from 'react';
import { GitBranch, Plus, X, Play, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
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
    api
      .get('/experiments')
      .then((res) => {
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
      setActionMsg('Experiment trial queued successfully.');
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
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold badge-teal">
              Orchestration
            </span>
            <span className="text-xs font-mono text-slate-500">FedAvg Rounds</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Federated Rounds & Experiments
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Configure multi-hospital training iterations, hyperparameter boundaries, and trial state.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Queue Next Round</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Experiments List */}
      <div className="space-y-4">
        {experiments.map((exp) => (
          <div key={exp.id} className="apple-card p-6 bg-white border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{exp.name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      exp.status === 'completed'
                        ? 'badge-teal'
                        : exp.status === 'in_progress'
                        ? 'badge-blue'
                        : exp.status === 'cancelled'
                        ? 'badge-rose'
                        : 'badge-slate'
                    }`}
                  >
                    {exp.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{exp.description}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>Target Round: <strong className="text-slate-800">{exp.target_round}</strong></span>
                  <span>Batch Size: <strong className="text-slate-800">{exp.batch_size}</strong></span>
                  <span>Learning Rate: <strong className="font-mono text-slate-800">{exp.learning_rate}</strong></span>
                </div>
              </div>

              {exp.status === 'pending' && (
                <button
                  onClick={() => handleCancel(exp.id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Configure New Federated Round</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Experiment Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Round</label>
                  <input
                    type="number"
                    value={form.target_round}
                    onChange={(e) => setForm({ ...form, target_round: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Epochs Per Client</label>
                  <input
                    type="number"
                    value={form.epochs_per_client}
                    onChange={(e) => setForm({ ...form, epochs_per_client: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  Queue Round
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
