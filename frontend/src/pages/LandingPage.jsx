import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  ShieldCheck,
  Eye,
  Network,
  Cpu,
  ArrowRight,
  Layers,
  Sparkles,
  Lock,
  Activity,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';

export default function LandingPage() {
  const { user, isAdmin } = useAuth();

  const targetDashboard = user
    ? isAdmin
      ? '/admin/overview'
      : '/hospital/overview'
    : '/login';

  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 pt-6 sm:pt-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold badge-teal mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explainable AI & Federated Learning for Brain MRI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-950 tracking-tight leading-[1.08]">
          Understanding Alzheimer's.
          <span className="block bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent mt-1">
            One Scan at a Time.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          An AI-powered MRI analysis platform combining deep learning, explainable AI, and
          privacy-preserving federated learning to support early-stage Alzheimer's research.
        </p>

        {/* Primary Action Group */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <NavLink
            to="/analyze"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Brain className="w-4 h-4" />
            <span>Analyze an MRI</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>

          <NavLink
            to="/architecture"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-slate-800 font-semibold text-sm hover:bg-slate-50 border border-slate-200/90 shadow-sm transition-all cursor-pointer"
          >
            <Network className="w-4 h-4 text-teal-600" />
            <span>Explore Architecture</span>
          </NavLink>
        </div>

        {/* Research Disclaimer Banner */}
        <div className="mt-10 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center justify-center gap-2.5 max-w-xl mx-auto text-left">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Research Prototype:</strong> Model outputs provide research insights and
            heatmaps, not definitive clinical diagnosis.
          </span>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: DenseNet121 Inference */}
          <div className="apple-card p-8 flex flex-col justify-between apple-card-hover">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                4-Class MRI Classification
              </h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Evaluates brain structural changes across 4 distinct classes:
                <em className="block text-slate-800 font-medium mt-2">
                  Mild Dementia • Moderate Dementia • Non Demented • Very Mild Dementia
                </em>
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>DenseNet121 Backbone</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          {/* Card 2: HiResCAM Explainability */}
          <div className="apple-card p-8 flex flex-col justify-between apple-card-hover border-teal-100/60">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                HiResCAM Explainable AI
              </h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                High-Resolution Class Activation Mapping calculates element-wise feature activation
                weighted by classifier gradients, revealing exact hippocampal and ventricular
                patterns without random heuristics.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-600">
              <span>Deterministic Gradients</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          {/* Card 3: Privacy-Preserving Federated Protocol */}
          <div className="apple-card p-8 flex flex-col justify-between apple-card-hover">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Privacy-Preserving FL
              </h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Raw patient MRI data never leaves local hospital partitions (`hospital_1`,
                `hospital_2`, `hospital_3`). Only encrypted model weight updates participate in
                central FedAvg aggregation.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Zero Raw Data Leakage</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How NeuroLens Analyzes Brain Scans
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
            A transparent and reproducible pipeline from upload to visual attribution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative">
            <span className="text-xs font-bold text-blue-600">Step 01</span>
            <h4 className="font-bold text-slate-900 text-base mt-1">Aspect Resizing</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Maintains true anatomical aspect ratio, centring the MRI slice onto a 224×224 black
              canvas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative">
            <span className="text-xs font-bold text-teal-600">Step 02</span>
            <h4 className="font-bold text-slate-900 text-base mt-1">ImageNet Normalization</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Standardizes RGB channels with ImageNet mean and variance before tensor transfer.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative">
            <span className="text-xs font-bold text-indigo-600">Step 03</span>
            <h4 className="font-bold text-slate-900 text-base mt-1">DenseNet121 Pass</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Authoritative model runs strict forward pass generating calibrated 4-class logits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative">
            <span className="text-xs font-bold text-rose-600">Step 04</span>
            <h4 className="font-bold text-slate-900 text-base mt-1">HiResCAM Overlay</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Extracts high-resolution gradients from `denseblock4`, blending high-contrast Jet
              heatmaps onto the scan.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="max-w-5xl mx-auto px-4 pb-8">
        <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to explore explainable brain MRI predictions?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300">
              Access the clinical diagnostic interface or explore our institutional federated
              workspaces.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <NavLink
                to="/analyze"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-colors cursor-pointer"
              >
                <span>Upload MRI Slice</span>
                <ArrowRight className="w-4 h-4" />
              </NavLink>
              <NavLink
                to={targetDashboard}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <span>Research Dashboard</span>
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

