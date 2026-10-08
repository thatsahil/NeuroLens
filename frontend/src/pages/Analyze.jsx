import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Upload, FileScan, Image as ImageIcon, AlertCircle, CheckCircle, ArrowRight, User, X } from 'lucide-react';

const Analyze = () => {
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId') || '';

  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState(initialPatientId);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [validationError, setValidationError] = useState('');
  
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/patients');
        setPatients(res.data);
        if (!patientId && res.data.length > 0) {
          setPatientId(res.data[0]._id || res.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load patients for selection:", err);
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const validateFile = (selectedFile) => {
    setValidationError('');
    if (!selectedFile) return false;

    // Validate Extension
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png'];
    const filename = selectedFile.name.toLowerCase();
    const isExtensionValid = filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png');
    
    if (!isExtensionValid || (selectedFile.type && !validExtensions.includes(selectedFile.type))) {
      setValidationError('Invalid file type. Please upload a valid JPG, JPEG, or PNG image.');
      return false;
    }

    // Validate Size (10MB limit)
    const maxSizeMB = 10;
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setValidationError(`File size exceeds ${maxSizeMB} MB limit.`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected && validateFile(selected)) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
    }
  };

  const handleAnalyze = async () => {
    if (!patientId) {
      setValidationError('Please select a patient before analyzing.');
      return;
    }
    if (!file) {
      setValidationError('Please select an MRI image scan.');
      return;
    }

    setAnalyzing(true);
    setApiError(null);

    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('file', file);

    try {
      const res = await api.post('/predictions/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const predId = res.data._id || res.data.id;
      navigate(`/predictions/${predId}`);
    } catch (err) {
      console.error("Analyze request error:", err);
      setApiError(err.response?.data?.detail || "Inference server error. Failed to analyze MRI image.");
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileScan className="w-6 h-6 text-cyan-400" />
          MRI Upload & DenseNet121 Inference
        </h1>
        <p className="text-sm text-slate-400">
          Upload brain MRI scan (JPG/PNG) to evaluate Alzheimer's dementia stage probabilities.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        {/* Step 1: Patient Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-cyan-400" />
            Step 1: Select Target Patient
          </label>
          
          {loadingPatients ? (
            <div className="text-xs text-slate-400 animate-pulse">Loading patient list...</div>
          ) : (
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="" disabled>-- Select Patient Record --</option>
              {patients.map((pat) => (
                <option key={pat._id || pat.id} value={pat._id || pat.id}>
                  {pat.name} (Age: {pat.age}, {pat.gender}) — ID: {pat._id || pat.id}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Validation Errors */}
        {(validationError || apiError) && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{validationError || apiError}</span>
          </div>
        )}

        {/* Step 2: Upload Zone */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            Step 2: Upload MRI Scan (JPG / JPEG / PNG)
          </label>

          {!previewUrl ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/40 group"
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
                id="mri-upload-input"
              />
              <label htmlFor="mri-upload-input" className="cursor-pointer space-y-3">
                <div className="p-4 rounded-full bg-slate-900 text-cyan-400 group-hover:scale-110 transition-transform mx-auto w-fit">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Click to browse or drag & drop MRI scan image
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports JPG, JPEG, PNG (Max 10 MB). Automatically normalized for DenseNet121.
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6 bg-slate-950">
              <div className="relative w-48 h-48 rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center flex-shrink-0">
                <img src={previewUrl} alt="MRI Preview" className="max-h-full max-w-full object-contain" />
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Scan Loaded & Validated
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-300 space-y-1 font-mono">
                  <p>File Name: <span className="text-slate-100">{file?.name}</span></p>
                  <p>Size: <span className="text-slate-100">{(file?.size / (1024 * 1024)).toFixed(2)} MB</span></p>
                  <p>Input Specs: <span className="text-cyan-400">224x224 RGB ImageNet Norm</span></p>
                </div>

                <p className="text-[11px] text-slate-400">
                  Ready to trigger PyTorch DenseNet121 classification pipeline.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Trigger Inference Button */}
        <div className="pt-4 border-t border-slate-800/80">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !file || !patientId}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-cyan-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Running DenseNet121 Model Inference...</span>
              </div>
            ) : (
              <>
                <FileScan className="w-5 h-5" />
                <span>Run DenseNet121 Inference Analysis</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analyze;
