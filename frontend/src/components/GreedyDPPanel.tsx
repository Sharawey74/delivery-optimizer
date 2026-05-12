// frontend/src/components/GreedyDPPanel.tsx
import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { DPComparison } from '../types';

interface GreedyDPPanelProps {
  comparisons: DPComparison[];
}

export function GreedyDPPanel({ comparisons }: GreedyDPPanelProps) {
  const totalSaved = comparisons.reduce((sum, c) => sum + c.saved, 0);

  return (
    <div className="bg-brand-surface-raised border border-brand-surface-border rounded-xl flex flex-col h-[300px]">
      <div className="px-4 py-3 border-b border-brand-surface-border flex items-center gap-2">
        <BrainCircuit size={15} className="text-brand-violet-bright" />
        <span className="text-sm font-semibold">DP Re-Optimization</span>
        {comparisons.length > 0 && (
          <span className="bg-brand-violet/15 text-brand-violet-bright border border-brand-violet/30 rounded-full px-2 text-[9px] font-bold tracking-widest ml-auto">
            ACTIVE
          </span>
        )}
      </div>

      {comparisons.length === 0 ? (
        <div className="px-4 py-6 flex-1 flex flex-col justify-center items-center gap-2 text-center">
          <BrainCircuit size={32} className="text-brand-text-muted opacity-30" />
          <span className="text-xs font-mono text-brand-text-muted">DP optimization runs during quiet periods</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-1 scrollbar-thin">
          <div className="w-full font-mono text-xs">
            <div className="grid grid-cols-5 text-brand-text-muted border-b border-brand-surface-border py-2 px-3 sticky top-0 bg-brand-surface-raised/95 backdrop-blur z-10 text-[10px]">
              <div>TICK</div>
              <div>GREEDY</div>
              <div>DP OPTIMIZED</div>
              <div>SAVED</div>
              <div>TIME</div>
            </div>
            
            <div className="flex flex-col">
              {[...comparisons].reverse().slice(0, 50).map((c, i) => (
                <div key={`${c.tick}-${i}`} className="grid grid-cols-5 border-b border-dashed border-brand-surface-border/40 py-2.5 px-3 hover:bg-brand-surface-high/50 transition-colors">
                  <div className="text-brand-text-muted">{c.tick}s</div>
                  <div className="text-brand-text-secondary">{c.greedy_dist.toFixed(1)}</div>
                  <div className="text-brand-indigo-light">{c.dp_dist.toFixed(1)}</div>
                  <div className={`font-semibold ${c.saved > 0 ? 'text-brand-emerald' : 'text-brand-rose'}`}>
                    {c.saved > 0 ? '+' : ''}{c.saved.toFixed(1)}
                  </div>
                  <div className="text-brand-text-muted">{c.time_ms.toFixed(0)}ms</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-t border-brand-surface-border flex justify-between items-center bg-brand-surface-high/30">
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-text-muted uppercase tracking-widest font-semibold">Total saved:</span>
          <span className="font-mono font-bold text-brand-emerald text-sm">{totalSaved.toFixed(1)} km</span>
        </div>
        <div className="font-mono text-xs text-brand-text-muted">
          Runs: {comparisons.length}
        </div>
      </div>
    </div>
  );
}