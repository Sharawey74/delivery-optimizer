// frontend/src/components/SummaryPanel.tsx
import React from 'react';
import { BarChart3, PackageCheck, Milestone, ShieldAlert, Clock, Users } from 'lucide-react';
import { SimulationState } from '../types';

interface SummaryPanelProps {
  state: SimulationState;
}

export function SummaryPanel({ state }: SummaryPanelProps) {
  const activeCouriers = Object.values(state.couriers).filter(c => c.active).length;
  const totalCouriers = Object.keys(state.couriers).length;
  
  const totalDisruptions = 
    state.disruption_counts.road_closure + 
    state.disruption_counts.breakdown + 
    state.disruption_counts.priority_escalation;

  const rows = [
    {
      label: 'Orders Delivered',
      value: state.orders_delivered,
      icon: PackageCheck,
      iconClass: 'text-brand-emerald-bright',
      valClass: 'text-brand-emerald-bright'
    },
    {
      label: 'Total Distance',
      value: `${state.total_distance_driven.toFixed(1)} km`,
      icon: Milestone,
      iconClass: 'text-brand-indigo-light',
      valClass: 'text-brand-indigo-light'
    },
    {
      label: 'Total Disruptions',
      value: totalDisruptions,
      icon: ShieldAlert,
      iconClass: 'text-brand-rose-bright',
      valClass: 'text-brand-rose-bright',
      sub: [
        { label: 'Road Closures', value: state.disruption_counts.road_closure },
        { label: 'Breakdowns', value: state.disruption_counts.breakdown },
        { label: 'Priority Escalations', value: state.disruption_counts.priority_escalation }
      ]
    },
    {
      label: 'Simulation Tick',
      value: (
        <span className="flex items-center gap-[2px]">
          {state.tick}s <span className={state.running ? "w-1.5 h-3.5 bg-brand-indigo-bright animate-blink inline-block" : "w-1.5 h-3.5 bg-brand-text-muted inline-block"}></span>
        </span>
      ),
      icon: Clock,
      iconClass: 'text-brand-indigo-bright',
      valClass: 'text-brand-indigo-bright'
    },
    {
      label: 'Active Couriers',
      value: (
        <span>{activeCouriers} <span className="text-brand-text-muted">/</span> {totalCouriers}</span>
      ),
      icon: Users,
      iconClass: 'text-brand-cyan-bright',
      valClass: 'text-brand-text'
    }
  ];

  return (
    <div className="bg-brand-surface-raised border border-brand-surface-border rounded-xl">
      <div className="px-4 py-3 border-b border-brand-surface-border flex items-center gap-2">
        <BarChart3 size={15} className="text-brand-indigo-bright" />
        <span className="text-sm font-semibold">Simulation Summary</span>
      </div>

      <div className="px-4 py-3 pb-4 space-y-2">
        {rows.map((row, idx) => (
          <React.Fragment key={idx}>
            <div className="flex justify-between items-center py-2 border-b border-brand-surface-border/50 last:border-0 hover:bg-brand-surface-high/30 px-2 -mx-2 rounded transition-colors duration-150">
              <div className="flex items-center gap-3">
                <row.icon size={15} className={row.iconClass} />
                <span className="text-xs text-brand-text-secondary font-medium tracking-wide">{row.label}</span>
              </div>
              <div className={`font-mono text-sm font-semibold ${row.valClass}`}>
                {row.value}
              </div>
            </div>
            
            {row.sub && row.sub.map((sub, sidx) => (
              <div key={`sub-${sidx}`} className="pl-9 pr-2 flex justify-between text-xs py-1.5 hover:bg-brand-surface-high/20 -mx-2 rounded border-l-2 border-transparent hover:border-brand-indigo/30 transition-all duration-150">
                <span className="text-brand-text-muted flex items-center gap-2">
                  <span className="text-brand-surface-border font-mono">{sidx === row.sub!.length - 1 ? '└─' : '├─'}</span>
                  {sub.label}
                </span>
                <span className="font-mono font-medium text-brand-text-secondary">{sub.value}</span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}