// frontend/src/components/EventLog.tsx
import React, { useState } from 'react';
import { 
  ScrollText, Inbox, PackagePlus, Construction, Zap, 
  Siren, CheckCircle2, Wrench, LucideIcon 
} from 'lucide-react';
import { SimulationEvent } from '../types';

interface EventLogProps {
  events: SimulationEvent[];
}

export function EventLog({ events }: EventLogProps) {
  const [tab, setTab] = useState<'operational' | 'disruption'>('operational');

  const filtered = events.filter(e => e.category === tab).reverse();

  return (
    <div className="bg-brand-surface-raised border border-brand-surface-border rounded-xl flex flex-col h-[400px]">
      <div className="px-4 py-3 border-b border-brand-surface-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText size={15} className="text-brand-indigo-bright" />
          <span className="font-semibold text-sm">System Logs</span>
        </div>
        <div className="flex bg-brand-surface-high border border-brand-surface-border rounded-md p-1">
          <button
            className={`px-3 py-1 text-xs rounded-md transition-colors ${tab === 'operational' ? 'bg-brand-indigo text-white' : 'text-brand-text-muted hover:text-brand-text'}`}
            onClick={() => setTab('operational')}
          >
            Operations
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md transition-colors ${tab === 'disruption' ? 'bg-brand-indigo text-white' : 'text-brand-text-muted hover:text-brand-text'}`}
            onClick={() => setTab('disruption')}
          >
            Disruptions
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
            <Inbox size={32} className="text-brand-text-muted opacity-40" />
            <span className="text-xs text-brand-text-muted font-mono">No {tab} events yet.</span>
          </div>
        ) : (
          filtered.map((event, idx) => {
            const isLast = idx === filtered.length - 1;
            let Icon: LucideIcon = PackagePlus;
            let iconClass = "bg-brand-surface-high text-brand-text-secondary";
            let colorClass = "text-brand-text";

            switch(event.type) {
              case 'new_order': 
                Icon = PackagePlus; iconClass = "bg-brand-indigo/20 text-brand-indigo-bright"; colorClass = "text-brand-indigo-bright"; break;
              case 'road_closure': 
                Icon = Construction; iconClass = "bg-brand-amber/20 text-brand-amber"; colorClass = "text-brand-amber"; break;
              case 'breakdown': 
                Icon = Zap; iconClass = "bg-brand-rose/20 text-brand-rose-bright"; colorClass = "text-brand-rose-bright"; break;
              case 'priority_escalation': 
                Icon = Siren; iconClass = "bg-brand-violet/20 text-brand-violet-bright"; colorClass = "text-brand-violet-bright"; break;
              case 'road_closure_resolved': 
              case 'breakdown_resolved': 
                Icon = event.type === 'breakdown_resolved' ? Wrench : CheckCircle2; 
                iconClass = "bg-brand-emerald/20 text-brand-emerald"; colorClass = "text-brand-emerald"; break;
            }

            return (
              <div key={`${event.tick}-${idx}`} className="flex gap-3 px-4 py-3 border-b border-brand-surface-border/60 hover:bg-brand-surface-high/40 transition-colors duration-150 animate-slide-in">
                <div className="w-8 flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${iconClass}`}>
                    <Icon size={14} />
                  </div>
                  {!isLast && <div className="flex-1 w-px bg-brand-surface-border mx-auto mt-1" />}
                </div>
                
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-brand-surface-high font-mono text-[10px] text-brand-text-muted px-1.5 py-0.5 rounded border border-brand-surface-border">
                      [{event.tick}s]
                    </span>
                    <span className={`text-xs font-semibold uppercase tracking-wide truncate ${colorClass}`}>
                      {event.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="text-xs text-brand-text-secondary leading-relaxed">
                    {event.description}
                  </div>
                  
                  <div className="font-mono text-[10px] text-brand-text-muted mt-1 flex items-center gap-2">
                    <span>algo: {event.algorithm}</span>
                    {event.quality_delta !== 0 && (
                      <span className={event.quality_delta > 0 ? 'text-brand-rose' : 'text-brand-emerald'}>
                        {event.quality_delta > 0 ? '+' : ''}{event.quality_delta.toFixed(1)} km
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}