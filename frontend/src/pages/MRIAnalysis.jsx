import React, { useState } from 'react';
import {
  Upload,
  Brain,
  Sparkles,
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle2,
  FileSearch,
  Eye
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '../services/api';

export default function MRIAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/mri/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.analysis);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process MRI scan.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? Object.entries(result.probabilities).map(([name, prob]) => ({
        name,
        confidence: (prob * 100).toFixed(1)
      }))
    : [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold badge-mint">Explainable AI (XAI)</span>
          <span className="text-xs font-mono text-gray-500">HiResCAM • DenseNet121</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">MRI Scan Classification & Explainability</h2>
        <p className="text-sm text-[var(--nl-muted-forest)] mt-1">
          Upload any axial brain MRI slice to obtain 4-class classification probabilities and generate high-resolution class activation heatmaps.
        </p>
      </div>

      {/* Upload & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dropzone Card */}
        <div className="nl-card p-6 bg-white border border-[var(--nl-border)] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-3">Upload MRI Scan</h3>
            
            <div className="border-2 border-dashed border-[var(--nl-border-strong)] rounded-xl p-8 text-center hover:bg-[var(--nl-bg-canvas)] transition cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 text-[var(--nl-primary)] mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-800">
                {selectedFile ? selectedFile.name : 'Select or drop an MRI slice'}
              </p>
              <p className="text-xs text-[var(--nl-muted-forest)] mt-1">Supports JPEG, PNG format</p>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className="w-full py-2.5 px-4 bg-[var(--nl-primary)] hover:bg-[var(--nl-primary-hover)] text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating HiResCAM Analysis...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analyze with HiResCAM
                </>
              )}
            </button>
          </div>
        </div>

        {/* Visual Inspection Card */}
        <div className="nl-card p-6 bg-white border border-[var(--nl-border)]">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Visual Comparison: Input vs. HiResCAM</h3>
          
          <div className="grid grid-cols-2 gap-4 h-64">
            {/* Input Preview */}
            <div className="h-full bg-[var(--nl-bg-canvas)] rounded-xl border border-[var(--nl-border)] flex flex-col items-center justify-center overflow-hidden p-2">
              {previewUrl ? (
                <img src={previewUrl} alt="MRI Input" className="max-h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center text-gray-400 text-xs">
                  <Eye className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  No image selected
                </div>
              )}
              <span className="text-[10px] font-semibold text-gray-500 mt-1 uppercase">Input MRI Slice</span>
            </div>

            {/* HiResCAM Heatmap */}
            <div className="h-full bg-[var(--nl-bg-canvas)] rounded-xl border border-[var(--nl-border)] flex flex-col items-center justify-center overflow-hidden p-2">
              {result?.hirescam_heatmap_base64 ? (
                <img
                  src={result.hirescam_heatmap_base64}
                  alt="HiResCAM Overlay"
                  className="max-h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center text-gray-400 text-xs">
                  <Sparkles className="w-6 h-6 mx-auto mb-1 opacity-50 text-[var(--nl-primary)]" />
                  Awaiting analysis
                </div>
              )}
              <span className="text-[10px] font-semibold text-[var(--nl-primary)] mt-1 uppercase">HiResCAM Activation</span>
            </div>
          </div>

          <p className="text-[11px] text-[var(--nl-muted-forest)] mt-3">
            HiResCAM maintains element-wise spatial precision by avoiding coarse channel pooling, highlighting specific cortical atrophy and ventricular expansion margins.
          </p>
        </div>
      </div>

      {/* Analysis Results Panel */}
      {result && (
        <div className="nl-card p-6 bg-white border border-[var(--nl-border)] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[var(--nl-border)] gap-4">
            <div>
              <span className="text-xs uppercase font-semibold text-[var(--nl-muted-forest)]">Predicted Classification</span>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{result.predicted_class}</h3>
              <p className="text-xs text-[var(--nl-muted-forest)] mt-0.5">
                Model: <span className="font-mono text-gray-700">{result.model_version}</span> • Latency: <span className="font-mono">{result.inference_time_ms} ms</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-[var(--nl-muted-forest)] block font-semibold uppercase">Confidence</span>
                <span className="text-2xl font-bold text-[var(--nl-primary)]">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Explainable AI Finding */}
          <div className="p-4 bg-[var(--nl-mint)]/30 border border-emerald-200 rounded-xl">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              HiResCAM Anatomical Finding
            </h4>
            <p className="text-sm text-emerald-900">{result.explanation}</p>
          </div>

          {/* Class Probabilities Bar Chart */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Full Multi-Class Probability Distribution
            </h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} unit="%" stroke="#657166" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#657166" fontSize={11} width={130} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Probability']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderColor: '#DDE6E0' }}
                  />
                  <Bar dataKey="confidence" fill="#3B869B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Research Caveat */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
            <span>Research Disclaimer: This classification is an experimental research output produced by the DenseNet121 federated checkpoint and must not be used as a medical diagnosis.</span>
          </div>
        </div>
      )}
    </div>
  );
}
