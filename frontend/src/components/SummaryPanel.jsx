export default function SummaryPanel({ state }) {
  if (!state) return <div className="panel"><h2 className="panel-header">Simulation Summary</h2><p style={{ color: 'var(--on-surface-variant)', fontSize: '13px' }}>Waiting for connection...</p></div>;

  const activeCouriers = Object.values(state.couriers).filter(c => c.active).length;
  const totDisrupt = state.disruption_counts.new_order +
    state.disruption_counts.road_closure +
    state.disruption_counts.breakdown +
    state.disruption_counts.priority_escalation;

  return (
    <div className="panel">
      <h2 className="panel-header">Simulation Summary</h2>
      
      <div className="summary-row">
        <span>Orders Delivered:</span>
        <span className="summary-val">{state.orders_delivered}</span>
      </div>
      <div className="summary-row">
        <span>Total Distance Driven:</span>
        <span className="summary-val">{state.total_distance_driven.toFixed(1)} km</span>
      </div>
      <div className="summary-row" style={{ marginTop: '20px' }}>
        <span>Total Disruptions:</span>
        <span className="summary-val error-val">{totDisrupt}</span>
      </div>
      <div className="summary-row sub">
        <span>├─ New Orders:</span>
        <span className="summary-val">{state.disruption_counts.new_order}</span>
      </div>
      <div className="summary-row sub">
        <span>├─ Road Closures:</span>
        <span className="summary-val error-val">{state.disruption_counts.road_closure}</span>
      </div>
      <div className="summary-row sub">
        <span>├─ Breakdowns:</span>
        <span className="summary-val error-val">{state.disruption_counts.breakdown}</span>
      </div>
      <div className="summary-row sub">
        <span>└─ Priority Escalations:</span>
        <span className="summary-val">{state.disruption_counts.priority_escalation}</span>
      </div>
      <div className="summary-row" style={{ marginTop: '20px' }}>
        <span>Simulation Tick:</span>
        <span className="summary-val">{state.tick}</span>
      </div>
      <div className="summary-row">
        <span>Active Couriers:</span>
        <span className="summary-val">{activeCouriers} / 3</span>
      </div>
    </div>
  );
}
