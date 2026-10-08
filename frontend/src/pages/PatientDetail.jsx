import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { User, Calendar, Phone, FileScan, ArrowLeft, Brain, Activity, Clock } from 'lucide-react';

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatientDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [patRes, predsRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/predictions/patient/${id}`)
      ]);
      setPatient(patRes.data);
      setPredictions(predsRes.data);
    } catch (err) {
      console.error("Error fetching patient details:", err);
      setError("Unable to load patient details or prediction history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  if (loading) return <LoadingState message="Loading patient clinical history..." />;
  if (error) return <ErrorState title="Patient Record Error" message={error} onRetry={fetchPatientDetails} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Back Link */}
      <Link to="/patients" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Patient Directory
      </Link>

      {/* Patient Profile Card Header */}
      {patient && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{patient.name}</h1>
                <p className="text-xs text-slate-400 font-mono">Patient Record ID: {patient.id || patient._id}</p>
              </div>
            </div>

            <Link
              to={`/analyze?patientId=${patient.id || patient._id}`}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all self-start md:self-auto"
            >
              <FileScan className="w-4 h-4" />
              Analyze New Scan for Patient
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-sm">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block">Age</span>
              <span className="text-slate-100 font-medium">{patient.age} Years</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block">Gender</span>
              <span className="text-slate-100 font-medium">{patient.gender}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block">Contact</span>
              <span className="text-slate-100 font-medium">{patient.contact || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block">Registered</span>
              <span className="text-slate-100 font-medium">{new Date(patient.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Longitudinal Prediction History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          Longitudinal MRI Prediction History ({predictions.length})
        </h3>

        {predictions.length === 0 ? (
          <EmptyState
            title="No MRI Scans Recorded"
            message="No MRI scan analyses have been uploaded for this patient yet."
            actionText="Upload First Scan"
            onAction={() => window.location.href = `/analyze?patientId=${patient.id || patient._id}`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictions.map((pred) => (
              <div key={pred.id || pred._id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    pred.predicted_class === 'NonDemented' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    pred.predicted_class === 'VeryMildDemented' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    pred.predicted_class === 'MildDemented' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {pred.predicted_class}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" /> {new Date(pred.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-800/80">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Confidence Score</p>
                    <p className="text-base font-bold text-cyan-300 font-mono">{(pred.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-xs text-slate-400">DenseNet121 Speed</p>
                    <p className="text-xs font-mono text-slate-300">{pred.inference_time_ms} ms</p>
                  </div>
                </div>

                <Link
                  to={`/predictions/${pred.id || pred._id}`}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors block text-center"
                >
                  View Full MRI Analysis Report
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;
