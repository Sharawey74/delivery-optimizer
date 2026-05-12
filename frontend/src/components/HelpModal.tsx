// frontend/src/components/HelpModal.tsx
import React, { useEffect } from 'react';
import { Truck, X } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-[760px] max-w-[90vw] max-h-[85vh] flex flex-col bg-brand-surface-raised border border-brand-surface-border rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.7)] shadow-brand-indigo/10 animate-scale-in">
        <div className="px-6 py-5 border-b border-brand-surface-border flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <Truck size={20} className="text-brand-indigo-bright" />
            <h2 className="text-lg font-bold text-brand-text tracking-tight">Delivery Optimizer Guide</h2>
          </div>
          <button 
            onClick={onClose}
            title="Close"
            aria-label="Close"
            className="bg-brand-surface-high hover:bg-brand-rose/15 hover:text-brand-rose text-brand-text-muted transition-colors rounded-lg p-1.5"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-6 scrollbar-thin">
          <section>
            <h3 className="flex items-center gap-2 text-base font-semibold text-brand-indigo-light mb-3">
               <span className="w-6 h-6 rounded-full bg-brand-indigo/20 text-brand-indigo-bright text-xs font-bold flex items-center justify-center">1</span>
               How the Algorithm Works
            </h3>
            <div className="bg-brand-surface border-l-2 border-brand-indigo/40 px-4 py-3 rounded-r-lg text-sm text-brand-text-secondary mb-2 hover:border-brand-indigo transition-colors duration-150">
              <span className="text-brand-text font-semibold">Initial Assignment:</span> New orders trigger a bipartite matching system to assign orders to couriers based on distance and remaining capacity.
            </div>
            <div className="bg-brand-surface border-l-2 border-brand-indigo/40 px-4 py-3 rounded-r-lg text-sm text-brand-text-secondary mb-2 hover:border-brand-indigo transition-colors duration-150">
              <span className="text-brand-text font-semibold">Dynamic Programming (DP):</span> During quiet periods, the route is optimized using a DP approach (Held-Karp for TSP) to find the absolute shortest path.
            </div>
            <div className="bg-brand-surface border-l-2 border-brand-indigo/40 px-4 py-3 rounded-r-lg text-sm text-brand-text-secondary mb-2 hover:border-brand-indigo transition-colors duration-150">
              <span className="text-brand-text font-semibold">Greedy Fallback:</span> If rapid routing is required (due to sudden disruption or high load), the system falls back to Nearest Neighbor greedy routing to save compute time.
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-base font-semibold text-brand-indigo-light mb-3">
               <span className="w-6 h-6 rounded-full bg-brand-amber/20 text-brand-amber-bright text-xs font-bold flex items-center justify-center">2</span>
               Disruption Handling
            </h3>
            <div className="space-y-4 text-sm text-brand-text-secondary">
              <p>The system actively manages chaos through a state machine that transitions courier status dynamically:</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-brand-surface rounded-lg border border-brand-surface-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-brand-rose/15 text-brand-rose-bright border border-brand-rose/30 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase">BROKEN DOWN</span>
                  </div>
                  <p className="text-xs">Courier stops. Their pending orders are instantly re-matched to other active couriers within range.</p>
                </div>
                
                <div className="p-3 bg-brand-surface rounded-lg border border-brand-surface-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-brand-amber/15 text-brand-amber border border-brand-amber/30 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase">REROUTING</span>
                  </div>
                  <p className="text-xs">Triggered by road closures. The route graph updates, closing edges, and A* is re-run immediately.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}