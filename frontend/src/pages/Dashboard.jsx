import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import ProbabilityChart from '../components/ProbabilityChart';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Users, FileScan, Activity, ShieldAlert, ArrowRight, Brain, Sparkles, PlusCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, predsRes] = await Promise.all([
        api.get('/reports/stats'),
        api.get('/predictions')
      ]);
      setStats(statsRes.data);
      setRecentPredictions(predsRes.data.slice(0, 5));
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError("Failed to load clinical analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingState message="Calculating clinical analytics & MRI metrics..." />;
  if (error) return <ErrorState title="Dashboard Error" message={error} onRetry={fetchDashboardData} />;

  const probabilitiesFormat = stats?.class_counts ? {
    NonDemented: (stats.class_counts.NonDemented || 0) / (stats.total_scans || 1),
    VeryMildDemented: (stats.class_counts.VeryMildDemented || 0) / (stats.total_scans || 1),
    MildDemented: (stats.class_counts.MildDemented || 0) / (stats.total_scans || 1),
    ModerateDemented: (stats.class_counts.ModerateDemented || 0) / (stats.total_scans || 1)
  } : {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              DenseNet121 Production Model
            </span>
            <span className="text-xs text-slate-400 font-mono">99.04% Test Accuracy Benchmark</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clinical Decision Support Dashboard</h1>
          <p className="text-sm text-slate-400">Real-time Alzheimer's MRI classification & patient cohort analysis</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/patients"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            Add Patient
          </Link>
          <Link
            to="/analyze"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <FileScan className="w-4 h-4" />
            Upload & Analyze Scan
          </Link>
        </div>
      </div>

      {/* Medical Safety Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400" />
        <div>
          <span className="font-semibold">Medical Safety & Clinical Notice:</span> NeuroLens AI outputs are decision-support tools meant for research and clinical assistance. Predictions must be evaluated by a qualified medical professional prior to diagnosis or treatment.
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Registered Patients"
          value={stats?.total_patients || 0}
          subtitle="Monitored in cohort"
          icon={Users}
          color="cyan"
        />
        <StatsCard
          title="Total Scans Processed"
          value={stats?.total_scans || 0}
          subtitle="DenseNet121 inferences"
          icon={FileScan}
          color="emerald"
        />
        <StatsCard
          title="Detected Demented Cases"
          value={(stats?.class_counts?.MildDemented || 0) + (stats?.class_counts?.ModerateDemented || 0) + (stats?.class_counts?.VeryMildDemented || 0)}
          subtitle="Mild, Very Mild, or Moderate"
          icon={Brain}
          color="amber"
        />
        <StatsCard
          title="Model Health & Accuracy"
          value="99.04%"
          subtitle="Weighted F1 Score: 99.04%"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Analytics & Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Class Stage Distribution
            </h3>
            <span className="text-xs text-slate-400">Cohort Breakdown</span>
          </div>
          <ProbabilityChart probabilities={probabilitiesFormat} type="bar" />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Stage Proportions
            </h3>
            <span className="text-xs text-slate-400">Relative Ratio</span>
          </div>
          <ProbabilityChart probabilities={probabilitiesFormat} type="pie" />
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-100">Recent MRI Scans</h3>
          <Link to="/predictions" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium">
            View All Scans <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPredictions.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No recent MRI scan analyses recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Predicted Stage</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Inference Time</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentPredictions.map((pred) => (
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
                    <td className="px-4 py-3 font-mono text-slate-400">{pred.inference_time_ms} ms</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(pred.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/predictions/${pred.id || pred._id}`}
                        className="text-xs text-cyan-400 hover:underline font-medium"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
