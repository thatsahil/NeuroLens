import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ title = "Connection Error", message = "Unable to fetch data from backend service.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 glass-panel rounded-xl text-center max-w-lg mx-auto border border-rose-500/20">
      <div className="p-3 bg-rose-500/10 rounded-full text-rose-400 mb-3">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/30 text-sm font-medium transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      )}
    </div>
  );
};

export default ErrorState;
