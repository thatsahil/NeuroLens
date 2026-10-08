import React from 'react';
import { Activity } from 'lucide-react';

const LoadingState = ({ message = "Processing AI model data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8 text-slate-300">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
        <Activity className="absolute inset-0 m-auto w-6 h-6 text-cyan-400 animate-pulse" />
      </div>
      <p className="text-sm font-medium tracking-wide text-slate-400">{message}</p>
    </div>
  );
};

export default LoadingState;
