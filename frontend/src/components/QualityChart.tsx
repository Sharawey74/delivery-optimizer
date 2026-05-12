// frontend/src/components/QualityChart.tsx
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown } from 'lucide-react';
import { RouteQualityPoint } from '../types';

interface QualityChartProps {
  history: RouteQualityPoint[];
}

export function QualityChart({ history }: QualityChartProps) {
  if (history.length === 0) {
    return (
      <div className="bg-brand-surface-raised border border-brand-surface-border rounded-xl h-[300px] flex items-center justify-center">
         <span className="text-brand-text-muted font-mono text-xs">Awaiting quality data...</span>
      </div>
    );
  }

  // Find spikes for ReferenceLines (heuristics: big jump in distance)
  const spikes: number[] = [];
  for (let i = 1; i < history.length; i++) {
    if (history[i].total_distance > history[i-1].total_distance * 1.1) {
      spikes.push(history[i].tick);
    }
  }

  return (
    <div className="bg-brand-surface-raised border border-brand-surface-border rounded-xl p-4 h-[300px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown size={15} className="text-brand-indigo-bright" />
        <span className="text-sm font-semibold">Total Route Distance Over Time</span>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2d4a" vertical={false} />
            <XAxis 
              dataKey="tick" 
              stroke="#1f2d4a" 
              tick={{ fill: '#4a5680', fontSize: 10, fontFamily: 'monospace' }} 
              tickFormatter={(val) => `${val}s`}
            />
            <YAxis 
              stroke="#1f2d4a" 
              tick={{ fill: '#4a5680', fontSize: 10, fontFamily: 'monospace' }}
              domain={['auto', 'auto']}
              tickFormatter={(val) => val.toFixed(0)}
            />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#1a2340', borderColor: '#1f2d4a', borderRadius: '8px', color: '#e8eaf6', fontFamily: 'monospace', fontSize: '12px' }}
              itemStyle={{ color: '#818cf8' }}
              labelStyle={{ color: '#8b9cc8', marginBottom: '4px' }}
              formatter={(value: number) => [`${value.toFixed(1)} km`, 'Distance']}
              labelFormatter={(label) => `Tick: ${label}s`}
            />
            
            {spikes.map((tick, i) => (
              <ReferenceLine key={i} x={tick} stroke="#f43f5e" strokeDasharray="3 3" strokeOpacity={0.5} />
            ))}

            <Area 
              type="stepAfter" 
              dataKey="total_distance" 
              stroke="#818cf8" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorDist)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}