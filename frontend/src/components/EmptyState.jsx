import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({ title = "No Records Found", message = "There are no data items available to display.", actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-xl text-center max-w-md mx-auto my-6 border border-slate-700/50">
      <div className="p-4 bg-slate-800/60 rounded-full text-slate-400 mb-4 border border-slate-700">
        <FolderOpen className="w-8 h-8" />
      </div>
      <h4 className="text-base font-medium text-slate-200 mb-1">{title}</h4>
      <p className="text-sm text-slate-400 mb-6">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-cyan-600/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
