// frontend/src/components/CourierPanel.tsx
import React from 'react';
import { Truck, CircleDot, Navigation, PackageCheck, ClipboardList, CornerDownLeft, AlertOctagon, Clock, Scale, GitBranch } from 'lucide-react';
import { Courier, CourierStatus } from '../types';

interface CourierPanelProps {
  couriers: Record<string, Courier>;
}

export function CourierPanel({ couriers }: CourierPanelProps) {
  const getStatusIcon = (status: CourierStatus) => {
    switch(status) {
      case 'IDLE': return CircleDot;
      case 'MOVING': return Navigation;
      case 'DELIVERING': return PackageCheck;
      case 'ASSIGNED': return ClipboardList;
      case 'RETURNING_TO_DEPOT': return CornerDownLeft;
      case 'BROKEN_DOWN': return AlertOctagon;
      case 'WAITING_FOR_REPAIR': return Clock;
      case 'REBALANCING_LOAD': return Scale;
      case 'REROUTING': return GitBranch;
      default: return CircleDot;
    }
  };

  const getStatusBadge = (status: CourierStatus) => {
    switch(status) {
      case 'IDLE':
      case 'RETURNING_TO_DEPOT':
        return 'bg-brand-surface-high text-brand-text-muted border border-brand-muted';
      case 'MOVING':
      case 'DELIVERING':
      case 'ASSIGNED':
        return 'bg-brand-indigo/15 text-brand-indigo-light border border-brand-indigo/30';
      case 'BROKEN_DOWN':
      case 'WAITING_FOR_REPAIR':
        return 'bg-brand-rose/15 text-brand-rose-bright border border-brand-rose/30';
      case 'REBALANCING_LOAD':
      case 'REROUTING':
        return 'bg-brand-amber/15 text-brand-amber border border-brand-amber/30';
      default:
        return 'bg-brand-surface-high text-brand-text-muted border border-brand-muted';
    }
  };

  return (
    <div className="bg-brand-surface-raised border border-brand-surface-border rounded-xl flex flex-col h-[400px]">
      <div className="px-4 py-3 border-b border-brand-surface-border flex items-center gap-2">
        <Truck size={15} className="text-brand-indigo-bright" />
        <span className="font-semibold text-sm">Fleet Status</span>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {Object.values(couriers).map(courier => {
          const Icon = getStatusIcon(courier.status);
          const iconColor = courier.active ? courier.color : '#fb7185';
          const pct = Math.min(100, Math.round((courier.capacity_used / courier.capacity_max) * 100) || 0);
          
          let barColor = courier.color;
          if (pct > 80) barColor = '#f43f5e';
          else if (pct > 50) barColor = '#f59e0b';

          return (
             <div 
               key={courier.id} 
               className={`mx-3 my-2 bg-brand-surface border rounded-xl overflow-hidden flex transition-all duration-300 hover:shadow-lg ${courier.active ? 'border-brand-surface-border' : 'border-brand-rose/40'}`}
             >
                <div 
                  className="w-1 self-stretch flex-shrink-0" 
                  style={{ backgroundColor: courier.active ? courier.color : '#f43f5e' }}
                />
                
                <div className="px-4 py-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center font-mono">
                      <Icon size={16} className="mr-2" style={{ color: iconColor }} />
                      <span className="text-sm font-bold" style={{ color: courier.color }}>
                        {courier.id.replace('Courier_', 'C')}
                      </span>
                      <span className="text-sm font-medium text-brand-text ml-2 tracking-tight">
                        {courier.name}
                      </span>
                    </div>
                    
                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${getStatusBadge(courier.status)}`}>
                      {courier.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-brand-surface-high/60 rounded-lg px-2 py-1.5 text-center flex flex-col justify-center border border-brand-surface-border/50">
                      <span className="text-[9px] uppercase tracking-widest text-brand-text-muted font-mono mb-0.5">NODE</span>
                      <span className="text-sm font-bold font-mono" style={{ color: iconColor }}>{courier.position}</span>
                    </div>
                    <div className="bg-brand-surface-high/60 rounded-lg px-2 py-1.5 text-center flex flex-col justify-center border border-brand-surface-border/50">
                      <span className="text-[9px] uppercase tracking-widest text-brand-text-muted font-mono mb-0.5">STOPS</span>
                      <span className="text-sm font-bold font-mono" style={{ color: iconColor }}>{courier.route.length}</span>
                    </div>
                    <div className="bg-brand-surface-high/60 rounded-lg px-2 py-1.5 text-center flex flex-col justify-center border border-brand-surface-border/50">
                      <span className="text-[9px] uppercase tracking-widest text-brand-text-muted font-mono mb-0.5">ORDERS</span>
                      <span className="text-sm font-bold font-mono text-brand-text">{courier.orders.length}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] text-brand-text-muted font-mono font-semibold tracking-widest uppercase">CARGO</span>
                      <span className="text-[10px] font-mono tracking-tight" style={{ color: pct > 80 ? '#fb7185' : pct > 50 ? '#fbbf24' : '#8b9cc8' }}>
                        {courier.capacity_used.toFixed(1)} / {courier.capacity_max} kg <span className="opacity-50">·</span> {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-brand-surface-high rounded-full overflow-hidden border border-brand-surface-border/50">
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ 
                          width: `${pct}%`,
                          backgroundColor: barColor,
                          boxShadow: `0 0 8px ${barColor}60`
                        }}
                      />
                    </div>
                  </div>
                </div>
             </div>
          );
        })}
      </div>
    </div>
  );
}