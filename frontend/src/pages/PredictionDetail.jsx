import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import MRIViewer from '../components/MRIViewer';
import ProbabilityChart from '../components/ProbabilityChart';
import GeminiAssistant from '../components/GeminiAssistant';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { ArrowLeft, Brain, Activity, Clock, ShieldAlert, Printer, User, CheckCircle } from 'lucide-react';

const PredictionDetail = () => {
  const { id } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPredictionDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/predictions/${id}`);
      setPrediction(res.data);

      if (res.data.patient_id) {
        try {
          const patRes = await api.get(`/patients/${res.data.patient_id}`);
          setPatient(patRes.data);
        } catch (e) {
          console.log("Could not load patient details:", e);
        }
      }
    } catch (err) {
      console.error("Failed to load prediction details:", err);
      setError("Unable to load prediction report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictionDetail();
  }, [id]);

  if (loading) return <LoadingState message="Retrieving DenseNet121 inference analysis report..." />;
  if (error) return <ErrorState title="Report Load Error" message={error} onRetry={fetchPredictionDetail} />;
  if (!prediction) return <ErrorState title="Not Found" message="Prediction report record does not exist." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link to="/predictions" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-2 transition-colors print:hidden"
        >
          <Printer className="w-4 h-4" /> Print / Export Report
        </button>
      </div>

      {/* Main Medical Safety Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400" />
        <div>
          <span className="font-semibold">AI Decision-Support Info:</span> This result is for research and decision support only and should be reviewed by a qualified medical professional prior to clinical diagnosis.
        </div>
      </div>

      {/* Patient & Model Header Summary */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              {prediction.model} v{prediction.model_version}
            </span>
            <span className="text-xs text-slate-400 font-mono">Inference Time: {prediction.inference_time_ms} ms</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            MRI Analysis: {prediction.patient_name || prediction.patient_id}
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Evaluated on {new Date(prediction.created_at).toLocaleString()} by {prediction.created_by}
          </p>
        </div>

        {/* Classification Stage Badge */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">DenseNet121 Classification</p>
            <p className="text-xl font-extrabold text-white">{prediction.predicted_class}</p>
          </div>
          <div className="text-right pl-4 border-l border-slate-800 font-mono">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Confidence</p>
            <p className="text-xl font-bold text-cyan-400">{(prediction.confidence * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Interactive MRI Viewer */}
        <MRIViewer
          imageUrl={prediction.image_url}
          patientName={prediction.patient_name}
          title="Patient Brain MRI Scan"
        />

        {/* Right Column: Stage Probabilities Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              DenseNet121 4-Stage Class Probabilities
            </h3>
            <span className="text-xs text-slate-400 font-mono">Softmax Probabilities</span>
          </div>

          <ProbabilityChart probabilities={prediction.probabilities} type="bar" />

          <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
            {Object.entries(prediction.probabilities || {}).map(([cls, prob]) => (
              <div key={cls} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">{cls}:</span>
                <span className="text-cyan-300 font-bold">{(prob * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Frontend Gemini AI Assistant Decision Support Section */}
      <GeminiAssistant predictionData={prediction} patientData={patient} />
    </div>
  );
};

export default PredictionDetail;
