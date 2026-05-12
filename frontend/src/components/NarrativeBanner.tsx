// frontend/src/components/NarrativeBanner.tsx
import React from 'react';

interface NarrativeBannerProps {
  narrative: string;
  running: boolean;
}

export function NarrativeBanner({ narrative, running }: NarrativeBannerProps) {
  return (
    <div className="mx-6 rounded-xl overflow-hidden bg-gradient-to-r from-brand-indigo-glow/60 to-brand-surface-raised border border-brand-indigo/30 px-5 py-3 flex items-center gap-4">
      {running ? (
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full border-2 border-brand-emerald/60 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-brand-emerald/30 animate-ping"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></div>
          </div>
          <span className="text-[10px] font-mono font-bold text-brand-emerald uppercase tracking-widest ml-2">
            LIVE
          </span>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full border-2 border-brand-text-muted/60 relative flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-text-muted"></div>
          </div>
          <span className="text-[10px] font-mono font-bold text-brand-text-muted uppercase tracking-widest ml-2">
            PAUSED
          </span>
        </div>
      )}

      <div className="w-px h-5 bg-brand-surface-border mx-3"></div>

      <span className="text-xs font-semibold uppercase tracking-widest text-brand-indigo-light whitespace-nowrap">
        System Narrative
      </span>

      <div className="w-px h-5 bg-brand-surface-border mx-3"></div>

      <span key={narrative} className="font-mono text-sm text-brand-text animate-slide-in truncate flex-1">
        {narrative || 'Initializing system...'}
      </span>
    </div>
  );
}