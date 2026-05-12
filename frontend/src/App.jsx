import { useState, useEffect } from 'react';
import { useSimulation } from './hooks/useWebSocket';
import Map from './components/Map';
import EventLog from './components/EventLog';
import QualityChart from './components/QualityChart';
import GreedyDPPanel from './components/GreedyDPPanel';
import SummaryPanel from './components/SummaryPanel';
import HelpModal from './components/HelpModal';
import './App.css';

export default function App() {
  const { state, connected, startSimulation, stopSimulation } = useSimulation();
  const [nodes, setNodes] = useState(null);
  const [edges, setEdges] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetch('/api/nodes').then(r => r.json()).then(setNodes);
    fetch('/api/edges').then(r => r.json()).then(setEdges);
  }, []);

  const setMode = async (mode) => {
    await fetch('/api/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
  };

  const triggerDisruption = async (type) => {
    await fetch(`/api/trigger/${type}`, { method: 'POST' });
  };

  const totalOrders = state ? state.orders_delivered + Object.keys(state.orders).length : 0;
  
  let capacityUsed = 0;
  let capacityMax = 0;
  if (state) {
    Object.values(state.couriers).forEach(c => {
      capacityUsed += c.capacity_used;
      capacityMax += c.capacity_max;
    });
  }
  const utilPct = capacityMax > 0 ? ((capacityUsed / capacityMax) * 100).toFixed(0) : 0;

  return (
    <div className="app-wrapper">
      <div className="main-content">
        <header className="header">
          <h1>🚚 Delivery Optimizer</h1>
          <div className="header-controls">
            {state && (
              <button className="primary-btn" onClick={() => setShowHelp(true)} style={{ marginRight: '16px', background: 'var(--primary)', color: 'var(--on-primary)' }}>
                📖 Guide & Help
              </button>
            )}

            {state && (
              <div style={{ display: 'flex', gap: '8px', marginRight: '16px', background: 'var(--surface-container)', padding: '4px', borderRadius: '4px' }}>
                <button 
                  className={state.mode === 'simulation' ? 'primary-btn' : ''} 
                  onClick={() => setMode('simulation')}
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                >
                  Simulation Mode
                </button>
                <button 
                  className={state.mode === 'demo' ? 'primary-btn' : ''} 
                  onClick={() => setMode('demo')}
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                >
                  Demo Mode
                </button>
              </div>
            )}
          
            <button className={state?.running ? '' : 'primary-btn'} onClick={startSimulation} disabled={state?.running}>
              ▶ Start
            </button>
            <button onClick={stopSimulation} disabled={!state?.running}>
              ⏹ Stop
            </button>
            <div className="connection-status">
              <span className={`dot ${connected ? 'dot-connected' : 'dot-disconnected'}`}></span>
              {connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </header>
        
        {/* Manual Trigger Buttons (Only in Demo Mode or always visible?) Let's show when running */}
        {state?.running && state?.mode === 'demo' && (
          <div style={{ display: 'flex', gap: '12px', background: 'var(--surface-container-low)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}>
            <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>Trigger Event:</span>
            <button onClick={() => triggerDisruption('new_order')}>📦 New Order</button>
            <button onClick={() => triggerDisruption('road_closure')}>🚧 Close Road</button>
            <button onClick={() => triggerDisruption('priority_escalation')}>🚨 VIP Priority</button>
            <button onClick={() => triggerDisruption('breakdown')}>💥 Courier Breakdown</button>
          </div>
        )}

        <div className="top-cards">
          <div className="stat-card active-card">
            <div className="stat-card-title">Active Orders</div>
            <div className="stat-card-value">{state ? Object.keys(state.orders).length : 0}</div>
            <div className="stat-card-sub">↗ Total handled: {totalOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Total Distance</div>
            <div className="stat-card-value">{state ? state.total_distance_driven.toFixed(1) : '0.0'} <span style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>km</span></div>
          </div>
          <div className="stat-card warning-card">
            <div className="stat-card-title">Active Disruptions</div>
            <div className="stat-card-value">{state ? (state.disruption_counts.new_order + state.disruption_counts.road_closure + state.disruption_counts.breakdown + state.disruption_counts.priority_escalation) : 0}</div>
          </div>
          <div className="stat-card active-card">
            <div className="stat-card-title">Courier Utilization</div>
            <div className="stat-card-value">{utilPct}%</div>
            <div className="capacity-bar-container" style={{ marginTop: '12px' }}>
              <div className="capacity-bar-fill" style={{ width: `${utilPct}%` }}></div>
            </div>
          </div>
        </div>

        {/* NARRATIVE PANEL */}
        {state && (
          <div className="narrative-panel">
            <span className="narrative-label">Live Operation Status:</span>
            <span className="narrative-text">{state.narrative || "System initialized. Couriers awaiting dispatch."}</span>
          </div>
        )}

        <div className="layout-grid">
          <div className="col-left">
            <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
              <Map state={state} nodes={nodes} edges={edges} />
            </div>
            
            <QualityChart state={state} />
            
            <GreedyDPPanel comparisons={state?.dp_comparisons} />
          </div>
          
          <div className="col-right">
            <SummaryPanel state={state} />
            
            {state && <EventLog events={state.events} />}
            
            <div className="panel">
              <h2 className="panel-header">Couriers (Operational State)</h2>
              {state && Object.values(state.couriers).map(c => (
                <div key={c.id} className="courier-card" style={{ borderColor: c.active ? 'var(--outline-variant)' : 'var(--error)' }}>
                  <div className="courier-header">
                    <h3 className="courier-name">Courier {c.id.replace('C', '')}</h3>
                    <div className={`badge ${['IDLE', 'RETURNING_TO_DEPOT'].includes(c.status) ? 'gray' : c.active ? 'green' : 'red'}`}>{c.status}</div>
                  </div>
                  <div className="courier-stats">
                    <p>Current Node: {c.position}</p>
                    <p>Stops Remaining: {c.route.length}</p>
                  </div>
                  <div className="capacity-bar-container">
                    <div 
                      className="capacity-bar-fill" 
                      style={{ width: `${(c.capacity_used / c.capacity_max) * 100}%`, backgroundColor: c.active ? c.color : 'var(--error)' }}
                    ></div>
                  </div>
                  <div className="capacity-text">{c.capacity_used.toFixed(1)} / {c.capacity_max} kg</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
