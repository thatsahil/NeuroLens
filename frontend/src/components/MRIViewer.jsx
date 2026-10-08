import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Maximize2 } from 'lucide-react';

const MRIViewer = ({ imageUrl, patientName, title = "Brain MRI Scan" }) => {
  const [zoom, setZoom] = useState(1);
  const [inverted, setInverted] = useState(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setZoom(1);
    setInverted(false);
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-slate-200 font-medium text-sm">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>{title}</span>
          {patientName && <span className="text-slate-400 text-xs">({patientName})</span>}
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 hover:bg-slate-800 text-slate-300 rounded transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 hover:bg-slate-800 text-slate-300 rounded transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setInverted(!inverted)}
            title="Invert Contrast"
            className={`p-1.5 rounded transition-colors ${inverted ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset View"
            className="p-1.5 hover:bg-slate-800 text-slate-300 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center min-h-[320px] max-h-[480px] border border-slate-900 group">
        <img
          src={imageUrl}
          alt="Brain MRI Scan"
          style={{
            transform: `scale(${zoom})`,
            filter: inverted ? 'invert(1) contrast(1.2)' : 'none',
            transition: 'transform 0.2s ease-out, filter 0.2s ease-out'
          }}
          className="max-h-[420px] w-auto object-contain rounded select-none cursor-grab active:cursor-grabbing"
        />
        
        {/* Overlay Grid Line Effect for Medical Tech Impression */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none opacity-40"></div>
        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-cyan-400/80 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
          DenseNet121 Target: 224x224 RGB
        </div>
      </div>
    </div>
  );
};

export default MRIViewer;
