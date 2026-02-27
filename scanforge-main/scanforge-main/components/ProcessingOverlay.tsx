import React from 'react';
import { Loader2 } from 'lucide-react';
import { ProcessingState } from '../types';

interface ProcessingOverlayProps {
  status: ProcessingState['status'];
  message: string;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ status, message }) => {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
      <div className="w-full max-w-md px-6 space-y-4">
        <div className="h-64 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse border border-zinc-800/80 shadow-2xl"></div>
        <div className="space-y-2">
          <div className="h-3 rounded-full bg-zinc-800 animate-pulse"></div>
          <div className="h-3 rounded-full bg-zinc-800/80 animate-pulse w-2/3"></div>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-200 font-semibold">
          <Loader2 className="w-4 h-4 animate-spin" />
          {message}
        </div>
      </div>
    </div>
  );
};

export default ProcessingOverlay;
