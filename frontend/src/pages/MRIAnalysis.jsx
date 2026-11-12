import React, { useState } from 'react';
import {
  Upload,
  Brain,
  Sparkles,
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle2,
  Eye,
  RefreshCw,
  X,
  Sliders,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import api from '../services/api';

const CLASS_COLORS = {
  'Mild Dementia': '#F59E0B',
  'Moderate Dementia': '#EF4444',
  'Non Demented': '#10B981',
  'Very mild Dementia': '#3B82F6'
};

const PROCESSING_STEPS = [
  'Uploading MRI image...',
  'Preparing 224x224 aspect-preserving canvas...',
  'Running DenseNet121 forward inference...',
  'Computing HiResCAM feature activations...',
  'Finalizing diagnosis & visual explanation...'
];

export default function MRIAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('overlay'); // 'overlay', 'side-by-side', 'original'

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file format
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Only JPEG and PNG MRI images are supported.');
        return;
      }
      // Validate size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10 MB limit.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || loading) return;

    setLoading(true);
    setError(null);
    setStepIndex(0);

    // Realistic step progression timer during live network upload
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
    }, 400);

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
      clearInterval(interval);
      setLoading(false);
    }
  };

  const chartData = result
    ? Object.entries(result.probabilities).map(([name, prob]) => ({
        name,
        confidence: Number((prob * 100).toFixed(1)),
        prob: prob
      }))
    : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold badge-teal">
            Explainable AI (XAI)
          </span>
          <span className="text-xs font-mono text-slate-500">
            HiResCAM • DenseNet121 • 4 Classes
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          MRI Scan Classification & HiResCAM Explanation
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Upload an axial brain MRI slice to obtain 4-class classification probabilities and generate
          high-resolution class activation heatmaps highlighting salient degenerative patterns.
        </p>
      </div>

      {/* Upload and Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dropzone Card */}
        <div className="lg:col-span-5 apple-card p-6 bg-white space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Select MRI Slice</h2>
            {selectedFile && (
              <button
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <div
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all relative ${
              selectedFile
                ? 'border-blue-400 bg-blue-50/20'
                : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Upload MRI Scan"
              disabled={loading}
            />

            {previewUrl ? (
              <div className="space-y-3">
                <img
                  src={previewUrl}
                  alt="MRI Scan Preview"
                  className="w-36 h-36 object-contain rounded-xl mx-auto shadow-sm border border-slate-200 bg-black"
                />
                <p className="text-xs font-semibold text-slate-800 truncate max-w-xs mx-auto">
                  {selectedFile?.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {(selectedFile?.size / 1024).toFixed(1)} KB • Click or drop to replace
                </p>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Select or drag & drop an MRI slice
                </p>
                <p className="text-xs text-slate-500 mt-1">Supports JPEG or PNG (up to 10 MB)</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
              !selectedFile || loading
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-md'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Inference & HiResCAM...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>Analyze Scan with HiResCAM</span>
              </>
            )}
          </button>

          {/* Stepper during processing */}
          {loading && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Progress Telemetry
              </span>
              <p className="text-xs font-semibold text-blue-700">
                {PROCESSING_STEPS[stepIndex]}
              </p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${((stepIndex + 1) / PROCESSING_STEPS.length) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Clinical Disclaimer & Quick Instructions Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="apple-card p-6 bg-white space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Diagnostic Classification Guide</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="font-semibold text-emerald-900 block">Non Demented (Class 2)</span>
                <p className="text-emerald-700 mt-1 text-[11px] leading-relaxed">
                  Preserved cortical volume and regular ventricular contours without focal cerebral
                  atrophy.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                <span className="font-semibold text-blue-900 block">Very Mild Dementia (Class 3)</span>
                <p className="text-blue-700 mt-1 text-[11px] leading-relaxed">
                  Early temporal lobe variance with subtle enlargement of lateral ventricular horns.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                <span className="font-semibold text-amber-900 block">Mild Dementia (Class 0)</span>
                <p className="text-amber-700 mt-1 text-[11px] leading-relaxed">
                  Noticeable hippocampal volume reduction and medial temporal atrophy patterns.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
                <span className="font-semibold text-rose-900 block">Moderate Dementia (Class 1)</span>
                <p className="text-rose-700 mt-1 text-[11px] leading-relaxed">
                  Extensive ventricular dilation with pronounced bilateral cortical thinning.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Zero Storage Policy:</strong> Uploaded images are evaluated in-memory using
                deterministic preprocessing and are never permanently stored without permission.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <section className="space-y-6 pt-4 border-t border-slate-200 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Inference Result
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {result.predicted_class}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold badge-blue">
                  {(result.confidence * 100).toFixed(1)}% Confidence
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Inference Time: {result.inference_time_ms} ms</span>
            </div>
          </div>

          {/* Visualization Grid: Original vs. HiResCAM Overlay */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visualizer Card */}
            <div className="lg:col-span-6 apple-card p-6 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-teal-600" />
                  <span>HiResCAM Activation Map</span>
                </h3>
                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
                  <button
                    onClick={() => setViewMode('overlay')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'overlay'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Overlay
                  </button>
                  <button
                    onClick={() => setViewMode('original')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'original'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setViewMode('side-by-side')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'side-by-side'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Side-by-Side
                  </button>
                </div>
              </div>

              {/* Image Container */}
              <div className="p-4 bg-slate-950 rounded-2xl flex items-center justify-center min-h-[300px]">
                {viewMode === 'overlay' && (
                  <img
                    src={result.hirescam_heatmap_base64}
                    alt="HiResCAM Overlay"
                    className="max-h-72 object-contain rounded-xl shadow-lg"
                  />
                )}
                {viewMode === 'original' && (
                  <img
                    src={previewUrl}
                    alt="Original MRI Slice"
                    className="max-h-72 object-contain rounded-xl shadow-lg"
                  />
                )}
                {viewMode === 'side-by-side' && (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="text-center">
                      <img
                        src={previewUrl}
                        alt="Original MRI"
                        className="w-full max-h-56 object-contain rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Original MRI</span>
                    </div>
                    <div className="text-center">
                      <img
                        src={result.hirescam_heatmap_base64}
                        alt="HiResCAM"
                        className="w-full max-h-56 object-contain rounded-lg"
                      />
                      <span className="text-[10px] text-teal-400 mt-1 block">HiResCAM Overlay</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                <span className="font-semibold text-slate-900 block mb-1">
                  Biomedical Explanation:
                </span>
                <p className="leading-relaxed">{result.explanation}</p>
              </div>
            </div>

            {/* Probability Breakdown Bar Chart */}
            <div className="lg:col-span-6 apple-card p-6 bg-white space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-4">
                  4-Class Probability Distribution
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 11, fill: '#475569' }}
                        width={120}
                      />
                      <Tooltip
                        formatter={(val) => [`${val}%`, 'Probability']}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="confidence" radius={[0, 8, 8, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CLASS_COLORS[entry.name] || '#3B82F6'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Model Spec Metadata */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-500">
                <div>
                  <span className="block text-[11px] text-slate-400">Model Version</span>
                  <span className="font-mono text-slate-800 font-semibold truncate block">
                    {result.model_version}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">Explainable AI Method</span>
                  <span className="text-slate-800 font-medium truncate block">
                    {result.xai_method}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
