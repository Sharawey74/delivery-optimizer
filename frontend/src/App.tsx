// frontend/src/App.tsx
import React, { useState } from 'react';
import { 
  Truck, Play, Square, Wifi, WifiOff, HelpCircle, 
  LayoutDashboard, Sliders, Package, Route, AlertTriangle, Gauge,
  PackagePlus, Construction, Zap, Star
} from 'lucide-react';
import { useSimulation } from './hooks/useWebSocket';

import { StatCard } from './components/StatCard';
import { NarrativeBanner } from './components/NarrativeBanner';
import { Map } from './components/Map';
import { EventLog } from './components/EventLog';
import { QualityChart } from './components/QualityChart';
import { GreedyDPPanel } from './components/GreedyDPPanel';
import { SummaryPanel } from './components/SummaryPanel';
import { CourierPanel } from './components/CourierPanel';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const { state, connected, startSimulation, stopSimulation, triggerEvent, setMode } = useSimulation();
  const [showGuide, setShowGuide] = useState(false);
  const [demoMode, setDemoMode] = useState(false); // Can be driven by BE or UI state

  if (!state) {
    return (
      <div className="bg-brand-bg min-h-screen text-brand-text flex flex-col items-center justify-center font-mono">
        <div className="w-12 h-12 bg-brand-surface border border-brand-indigo/30 rounded-xl flex items-center justify-center mb-4 animate-pulse">
          <Truck className="text-brand-indigo" size={24} />
        </div>
        Connecting to Operations Core...
        <span className="text-[10px] text-brand-text-muted mt-2">Ensure backend is running on :8000</span>
      </div>
    );
  }

  const isDemo = state.mode === 'demo' || demoMode;
  
  const totalDisruptions = 
    state.disruption_counts.road_closure + 
    state.disruption_counts.breakdown + 
    state.disruption_counts.priority_escalation;

  const fleetUtil = state.couriers 
    ? Math.round(
      (Object.values(state.couriers).reduce((acc, c) => acc + c.capacity_used, 0) / 
      (Object.values(state.couriers).reduce((acc, c) => acc + c.capacity_max, 0) || 1)) * 100
      )
    : 0;

  return (
    <div className="bg-brand-bg min-h-screen text-brand-text font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-brand-surface/90 backdrop-blur-xl border-b border-brand-surface-border shadow-[0_1px_0_0_rgba(99,102,241,0.15)] h-[60px] px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Truck className="text-brand-indigo-bright" size={22} />
          <span className="font-semibold text-lg text-brand-text ml-2 tracking-tight">Delivery Optimizer</span>
          <span className="text-xs text-brand-text-muted ml-3 font-mono hidden sm:block uppercase tracking-widest border-l border-brand-surface-border pl-3 h-4 flex items-center">
            Nexus Logistics
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 bg-brand-surface-high border border-brand-surface-border hover:border-brand-indigo/50 hover:text-brand-indigo-light transition-all duration-200 rounded-md px-3 py-1.5 text-sm font-medium"
          >
            <HelpCircle size={15} /> Guide
          </button>

          <div className="bg-brand-surface-high border border-brand-surface-border rounded-lg p-1 flex gap-1">
            <button 
              onClick={() => { setDemoMode(false); setMode && setMode('simulation'); }}
              className={`flex items-center gap-1.5 px-3 py-1 text-sm font-medium transition-all ${!isDemo ? 'bg-brand-indigo text-white shadow-lg shadow-brand-indigo/30 rounded-md' : 'text-brand-text-secondary hover:text-brand-text'}`}
            >
              <LayoutDashboard size={14} /> Sim
            </button>
            <button 
              onClick={() => { setDemoMode(true); setMode && setMode('demo'); }}
              className={`flex items-center gap-1.5 px-3 py-1 text-sm font-medium transition-all ${isDemo ? 'bg-brand-indigo text-white shadow-lg shadow-brand-indigo/30 rounded-md' : 'text-brand-text-secondary hover:text-brand-text'}`}
            >
              <Sliders size={14} /> Demo
            </button>
          </div>

          <button 
            onClick={startSimulation}
            disabled={state.running}
            className="flex items-center gap-1.5 bg-brand-indigo hover:bg-brand-indigo-bright text-white shadow-lg shadow-brand-indigo/40 rounded-md px-4 py-1.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Play size={14} /> Start
          </button>

          <button 
            onClick={stopSimulation}
            disabled={!state.running}
            className="flex items-center gap-1.5 border border-brand-surface-border hover:border-brand-rose/50 hover:text-brand-rose disabled:border-brand-surface-border disabled:text-brand-text-muted disabled:hover:border-brand-surface-border rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200"
          >
            <Square size={14} /> Stop
          </button>

          <div className="flex items-center gap-2 bg-brand-surface-high border border-brand-surface-border px-3 py-1.5 rounded-md ml-2">
            {connected ? (
              <>
                <Wifi size={14} className="text-brand-emerald" />
                <span className="text-brand-emerald text-xs font-mono font-bold uppercase tracking-widest relative flex items-center gap-2">
                  <span className="absolute -left-1.5 w-1 h-1 bg-brand-emerald rounded-full animate-ping block mb-px"></span>
                  Live
                </span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-brand-rose" />
                <span className="text-brand-rose text-xs font-mono font-bold uppercase tracking-widest">Offline</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Demo Trigger Bar */}
      {state.running && isDemo && (
        <div className="bg-brand-surface border border-brand-indigo/20 rounded-xl px-5 py-3 mx-6 mt-4 flex items-center gap-4 backdrop-blur-sm shadow-xl shadow-brand-indigo/5 animate-scale-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-text-muted uppercase tracking-widest">
            <Sliders size={14} /> Trigger Event
          </div>
          <div className="w-px h-5 bg-brand-surface-border"></div>
          <div className="flex items-center gap-3">
             <button onClick={() => triggerEvent('new_order')} className="flex items-center gap-2 border border-brand-indigo/30 text-brand-indigo-light hover:bg-brand-indigo/10 hover:border-brand-indigo rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200">
               <PackagePlus size={15} /> New Order
             </button>
             <button onClick={() => triggerEvent('road_closure')} className="flex items-center gap-2 border border-brand-amber/30 text-brand-amber hover:bg-brand-amber/10 hover:border-brand-amber rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200">
               <Construction size={15} /> Road Close
             </button>
             <button onClick={() => triggerEvent('priority_escalation')} className="flex items-center gap-2 border border-brand-violet/30 text-brand-violet-bright hover:bg-brand-violet/10 hover:border-brand-violet rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200">
               <Star size={15} /> VIP Priority
             </button>
             <button onClick={() => triggerEvent('breakdown')} className="flex items-center gap-2 border border-brand-rose/30 text-brand-rose-bright hover:bg-brand-rose/10 hover:border-brand-rose rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200">
               <Zap size={15} /> Breakdown
             </button>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pt-4 mb-4">
        <StatCard 
          title="Active Orders" 
          value={Object.keys(state.orders).length} 
          icon={Package} 
          variant={Object.keys(state.orders).length > 0 ? 'active' : 'default'} 
        />
        <StatCard 
          title="Total Distance" 
          value={`${state.total_distance_driven.toFixed(1)}`} 
          sub="kilometers"
          icon={Route} 
        />
        <StatCard 
          title="Active Disruptions" 
          value={totalDisruptions} 
          sub={`${state.events.filter(e => e.category === 'disruption').length} total logged`}
          icon={AlertTriangle} 
          variant={totalDisruptions > 0 ? 'danger' : 'default'} 
        />
        <StatCard 
          title="Fleet Utilization" 
          value={`${fleetUtil}%`} 
          icon={Gauge} 
          variant={fleetUtil > 80 ? 'warning' : 'default'} 
        />
      </div>

      <div className="mb-6">
        <NarrativeBanner narrative={state.narrative || "Monitoring fleet..."} running={state.running} />
      </div>

      {/* Main Grid */}
      <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Left Column (span 2) */}
        <div className="lg:col-span-2 space-y-5">
          <Map couriers={state.couriers} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <EventLog events={state.events || []} />
            <QualityChart history={state.route_quality_history || []} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          <SummaryPanel state={state} />
          <GreedyDPPanel comparisons={state.dp_comparisons || []} />
          <CourierPanel couriers={state.couriers} />
        </div>
      </div>

      {showGuide && <HelpModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}