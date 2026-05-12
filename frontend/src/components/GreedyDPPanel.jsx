export default function GreedyDPPanel({ comparisons }) {
  if (!comparisons) return null;
  
  const totalSaved = comparisons.reduce((sum, c) => sum + c.saved, 0);
  const runs = comparisons.length;
  
  return (
    <div className="panel">
      <h2 className="panel-header">DP Re-Optimization</h2>
      {runs === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>DP re-optimization runs during quiet periods (no disruption for 10 ticks)</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Tick</th>
                <th>Greedy Dist</th>
                <th>DP Dist</th>
                <th>Distance Saved</th>
                <th>Time (ms)</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.slice(0, 5).map((c, i) => (
                <tr key={i}>
                  <td>{c.tick}</td>
                  <td>{c.greedy_dist.toFixed(1)}</td>
                  <td>{c.dp_dist.toFixed(1)}</td>
                  <td className="text-cyan">{c.saved > 0 ? `+${c.saved.toFixed(1)}` : c.saved.toFixed(1)}</td>
                  <td>{c.time_ms.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '20px', fontFamily: 'JetBrains Mono', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Total saved: <span className="text-cyan">{totalSaved.toFixed(1)} km</span></span>
            <span style={{ color: 'var(--on-surface-variant)' }}>Runs: {runs}</span>
          </div>
        </>
      )}
    </div>
  );
}
