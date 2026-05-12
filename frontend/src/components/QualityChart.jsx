import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';

export default function QualityChart({ state }) {
  if (!state || !state.route_quality_history) return <div className="panel"><h2 className="panel-header">Total Route Distance Over Time</h2><p style={{ color: 'var(--on-surface-variant)', fontSize: '13px' }}>Loading Chart...</p></div>;

  const history = state.route_quality_history;
  const events = state.events;
  
  const disruptionTicks = new Set(
    events.filter(e => ["new_order", "road_closure", "breakdown", "priority_escalation"].includes(e.type)).map(e => e.tick)
  );
  
  const dpTicks = state.dp_comparisons.map(d => d.tick);

  return (
    <div className="panel">
      <h2 className="panel-header">Total Route Distance Over Time</h2>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={history} margin={{ top: 10, right: 20, bottom: 5, left: -20 }}>
            <XAxis dataKey="tick" stroke="var(--outline-variant)" tick={{ fill: 'var(--on-surface-variant)', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <YAxis stroke="var(--outline-variant)" tick={{ fill: 'var(--on-surface-variant)', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--on-surface)' }} />
            
            {dpTicks.map(tick => (
              <ReferenceArea key={`dp-${tick}`} x1={tick - 0.5} x2={tick + 0.5} fill="var(--primary)" fillOpacity={0.05} />
            ))}
            
            {Array.from(disruptionTicks).map(tick => (
              <ReferenceLine key={`disrupt-${tick}`} x={tick} stroke="var(--outline-variant)" strokeDasharray="3 3" />
            ))}
            
            <Line 
              type="monotone" 
              dataKey="total_distance" 
              stroke="var(--primary)" 
              strokeWidth={2} 
              dot={(props) => {
                const { cx, cy, index } = props;
                if (index === history.length - 1) {
                  return <circle cx={cx} cy={cy} r={4} fill="var(--primary)" key={`dot-${index}`} />;
                }
                return null;
              }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
