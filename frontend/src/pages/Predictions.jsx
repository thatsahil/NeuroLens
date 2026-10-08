import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { History, Search, Filter, ArrowRight, Brain, Clock } from 'lucide-react';

const Predictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [filterClass, setFilterClass] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/predictions');
      setPredictions(res.data);
    } catch (err) {
      console.error("Failed to load predictions:", err);
      setError("Unable to load prediction history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const filteredPredictions = predictions.filter((p) => {
    const matchesSearch = !search || (p.patient_name && p.patient_name.toLowerCase().includes(search.toLowerCase())) || p.patient_id.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === 'ALL' || p.predicted_class === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            DenseNet121 Prediction History
          </h1>
          <p className="text-sm text-slate-400">Complete archive of MRI scan classifications and confidence evaluations</p>
        </div>

        <Link
          to="/analyze"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all self-start md:self-auto"
        >
          <Brain className="w-4 h-4" />
          New MRI Scan
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <Search className="w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by patient name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 focus:outline-none placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Dementia Stages</option>
            <option value="NonDemented">NonDemented</option>
            <option value="VeryMildDemented">VeryMildDemented</option>
            <option value="MildDemented">MildDemented</option>
            <option value="ModerateDemented">ModerateDemented</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingState message="Fetching scan prediction history..." />
      ) : error ? (
        <ErrorState title="Error Loading History" message={error} onRetry={fetchPredictions} />
      ) : filteredPredictions.length === 0 ? (
        <EmptyState
          title="No Prediction Records"
          message="No MRI prediction records match your criteria."
          actionText="Run New Scan"
          onAction={() => window.location.href = '/analyze'}
        />
      ) : (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Predicted Stage</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Latency</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPredictions.map((pred) => (
                  <tr key={pred.id || pred._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-100">{pred.patient_name || pred.patient_id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        pred.predicted_class === 'NonDemented' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        pred.predicted_class === 'VeryMildDemented' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        pred.predicted_class === 'MildDemented' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {pred.predicted_class}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan-300">{(pred.confidence * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{pred.model} v{pred.model_version}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{pred.inference_time_ms} ms</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(pred.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/predictions/${pred.id || pred._id}`}
                        className="text-xs text-cyan-400 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        View Report <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predictions;
