import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Network,
  ShieldCheck,
  Building2,
  Server,
  Layers,
  Cpu,
  ArrowDown,
  ArrowRight,
  Lock,
  Database,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="space-y-12 py-4 sm:py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold badge-teal">
            Research Architecture
          </span>
          <span className="text-xs font-mono text-slate-500">FedAvg • Multi-Client Privacy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
          Federated Learning & System Architecture
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          NeuroLens implements institutional decentralized model training. Clinical MRI records
          remain confined inside hospital firewalls; only mathematical model parameters are exchanged.
        </p>
      </div>

      {/* Visual Workflow Diagram */}
      <section className="apple-card p-6 sm:p-10 bg-white border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-600" />
          <span>Federated Training & Aggregation Protocol</span>
        </h2>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center relative">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Hospital 1 (Alpha)</h4>
            <p className="text-xs text-slate-500 mt-1">22,769 Local MRI Scans</p>
            <div className="mt-3 inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold badge-blue">
              Weight: 32.78%
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] text-slate-600 font-medium">
              Local DenseNet121 Training
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center relative">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Hospital 2 (Beta)</h4>
            <p className="text-xs text-slate-500 mt-1">23,623 Local MRI Scans</p>
            <div className="mt-3 inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold badge-teal">
              Weight: 34.01%
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] text-slate-600 font-medium">
              Local DenseNet121 Training
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Hospital 3 (Gamma)</h4>
            <p className="text-xs text-slate-500 mt-1">23,073 Local MRI Scans</p>
            <div className="mt-3 inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold badge-amber">
              Weight: 33.22%
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] text-slate-600 font-medium">
              Local DenseNet121 Training
            </div>
          </div>
        </div>

        {/* Transfer Indicator */}
        <div className="my-6 text-center">
          <div className="inline-flex flex-col items-center justify-center text-xs text-slate-500 font-mono">
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
              Encrypted Local Model Weights Only (No Patient Scans Transferred)
            </span>
            <ArrowDown className="w-5 h-5 text-slate-400 mt-2 animate-bounce" />
          </div>
        </div>

        {/* Central Aggregator Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center mx-auto mb-3 text-blue-400">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Central Federated Aggregator (FedAvg)</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
            Computes sample-weighted average:
            <code className="block mt-2 font-mono bg-slate-950/60 p-2 rounded-lg text-teal-300 text-[11px]">
              W_global = ∑ (n_k / N_total) × W_k
            </code>
          </p>
        </div>

        {/* Checkpoint Lineage Distinction */}
        <div className="mt-8 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Active Centralized Inference Model vs. Federated Lineage:</strong> While the
            system tracks the historical federated rounds (Round 0 initialization & Round 1 FedAvg),
            the active diagnostic inference checkpoint (`densenet121_best.pth`) was trained
            centrally on the Kaggle Alzheimer's dataset to maximize baseline accuracy (71.05%) and
            provide calibrated HiResCAM visual explanations.
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="apple-card p-6 bg-white">
          <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <span>DenseNet121 Architecture</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex justify-between py-1 border-b border-slate-100">
              <span className="font-medium text-slate-500">Backbone:</span>
              <span className="font-mono text-slate-800">torchvision.models.densenet121</span>
            </li>
            <li className="flex justify-between py-1 border-b border-slate-100">
              <span className="font-medium text-slate-500">Feature Block:</span>
              <span className="font-mono text-slate-800">1024 channels (denseblock4)</span>
            </li>
            <li className="flex justify-between py-1 border-b border-slate-100">
              <span className="font-medium text-slate-500">Final Classifier:</span>
              <span className="font-mono text-slate-800">nn.Linear(1024, 4)</span>
            </li>
            <li className="flex justify-between py-1 border-b border-slate-100">
              <span className="font-medium text-slate-500">Input Geometry:</span>
              <span className="font-mono text-slate-800">224 × 224 × 3 (RGB)</span>
            </li>
            <li className="flex justify-between py-1">
              <span className="font-medium text-slate-500">Pretrained Weights:</span>
              <span className="text-slate-800">ImageNet Initialized</span>
            </li>
          </ul>
        </div>

        <div className="apple-card p-6 bg-white">
          <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>Privacy & Security Guarantees</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                <strong>Data Locality:</strong> No patient identifiers or MRI scans are ever
                transferred across institutions.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Database className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                <strong>Strict Shard Segregation:</strong> Hospital accounts are scoped solely to
                their local client shard (`hospital_1`, etc.).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                <strong>Append-Only Audit:</strong> All model uploads, logins, and analysis events
                are recorded in tamper-evident logs.
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

