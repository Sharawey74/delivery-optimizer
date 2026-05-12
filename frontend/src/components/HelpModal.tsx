// frontend/src/components/HelpModal.tsx
import React, { useEffect } from 'react';
import { Truck, X, Route, BrainCircuit, PackagePlus, Zap, Construction, Star, Wifi, Map, BarChart3 } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const Section = ({ num, icon: Icon, color, title, children }: {
  num: string; icon: React.ElementType; color: string; title: string; children: React.ReactNode;
}) => (
  <section>
    <h3 className="flex items-center gap-2 text-base font-semibold text-brand-indigo-light mb-3">
      <span className={`w-6 h-6 rounded-full ${color} text-xs font-bold flex items-center justify-center`}>{num}</span>
      <Icon size={15} />
      {title}
    </h3>
    <div className="space-y-2">{children}</div>
  </section>
);

const Card = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="bg-brand-surface border-l-2 border-brand-indigo/40 px-4 py-3 rounded-r-lg text-sm text-brand-text-secondary hover:border-brand-indigo transition-colors duration-150">
    <span className="text-brand-text font-semibold">{label}: </span>
    {children}
  </div>
);

const Badge = ({ label, color }: { label: string; color: string }) => (
  <span className={`${color} rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest`}>
    {label}
  </span>
);

export function HelpModal({ onClose }: HelpModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-[820px] max-w-[95vw] max-h-[88vh] flex flex-col bg-brand-surface-raised border border-brand-surface-border rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.7)] animate-scale-in">

        {/* Header */}
        <div className="px-6 py-5 border-b border-brand-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck size={20} className="text-brand-indigo-bright" />
            <h2 className="text-lg font-bold text-brand-text tracking-tight">Delivery Optimizer — Complete Guide</h2>
          </div>
          <button onClick={onClose} title="Close" aria-label="Close"
            className="bg-brand-surface-high hover:bg-brand-rose/15 hover:text-brand-rose text-brand-text-muted transition-colors rounded-lg p-1.5">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-7 scrollbar-thin">

          {/* 1. Algorithms */}
          <Section num="1" icon={BrainCircuit} color="bg-brand-indigo/20 text-brand-indigo-bright" title="Algorithms Used">
            <Card label="Dijkstra (Routing)">
              Every tick, each courier asks: "What is the shortest path from my position to my next stop?" Dijkstra explores the road graph starting from the courier's node, tracking the cheapest way to reach each other node. It automatically skips any road in the closed-edges list, so rerouting after a road closure is instant and requires no extra code.
            </Card>
            <Card label="Greedy Insertion (Order Assignment)">
              When a new order arrives, the system tries inserting [pickup → delivery] at every possible position in every courier's route and picks the combination with the lowest extra distance added. It's called "greedy" because it picks the locally cheapest slot right now without worrying about future orders.
            </Card>
            <Card label="Bitmask Dynamic Programming (Route Optimization)">
              During quiet periods (no disruption for 6 ticks), DP finds the mathematically optimal visiting order for each courier's current stops. It works by tracking which stops have been visited using a bitmask (binary number), trying all combinations, and picking the minimum-cost complete path. Capped at 8 stops per courier for real-time performance.
            </Card>
            <Card label="Bin Packing (Load Balancing)">
              When a courier is overloaded (e.g. after a breakdown redistribution), its lightest packages are removed one by one until it's within capacity. Each removed package is then re-assigned to the best available courier using Greedy Insertion.
            </Card>
          </Section>

          {/* 2. Simulation Flow */}
          <Section num="2" icon={Route} color="bg-brand-emerald/20 text-brand-emerald" title="Simulation Flow (Every Tick)">
            <div className="bg-brand-surface rounded-lg border border-brand-surface-border px-4 py-3 text-sm text-brand-text-secondary space-y-1.5 font-mono text-xs">
              {[
                "1. Move couriers — each active courier takes one step toward its next route stop via Dijkstra.",
                "2. Arrival check — if a courier reaches a delivery stop, the order is completed and removed.",
                "3. Return to depot — if a courier has no more stops, it heads home automatically.",
                "4. Scheduled events — road reopenings & courier repairs execute if their timer expires.",
                "5. Random disruptions — 5% chance per tick of a random event (Simulation mode only).",
                "6. DP optimization — if 6 quiet ticks have passed and routes exist, DP reorders all routes.",
                "7. Quality snapshot — total remaining route distance is recorded for the chart.",
                "8. Broadcast — full state is pushed to all connected clients via WebSocket.",
              ].map((step, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-brand-indigo-bright flex-shrink-0">›</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* 3. Modes */}
          <Section num="3" icon={BarChart3} color="bg-brand-amber/20 text-brand-amber" title="Simulation vs Demo Mode">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-brand-surface rounded-lg border border-brand-surface-border text-sm text-brand-text-secondary">
                <div className="font-semibold text-brand-text mb-1">Simulation Mode</div>
                Auto-runs every second. Random disruptions fire with a 5% chance per tick. The system demonstrates all algorithms working together autonomously.
              </div>
              <div className="p-3 bg-brand-surface rounded-lg border border-brand-surface-border text-sm text-brand-text-secondary">
                <div className="font-semibold text-brand-text mb-1">Demo Mode</div>
                Fully manual. The simulation pauses after Start and waits. Use <strong>▶ Step Forward</strong> to advance one tick at a time. Use the Trigger buttons to inject specific events on demand.
              </div>
            </div>
          </Section>

          {/* 4. Disruptions */}
          <Section num="4" icon={Zap} color="bg-brand-rose/20 text-brand-rose-bright" title="Disruption Types">
            <div className="grid grid-cols-2 gap-3 text-sm text-brand-text-secondary">
              {[
                { icon: PackagePlus, color: "bg-brand-indigo/15 text-brand-indigo-bright border-brand-indigo/30", label: "New Order", desc: "A pickup + delivery order is created. Greedy Insertion assigns it to the best courier at the cheapest route position." },
                { icon: Construction, color: "bg-brand-amber/15 text-brand-amber border-brand-amber/30", label: "Road Closure", desc: "A random road is blocked for 15 ticks. Dijkstra automatically reroutes couriers around it on the next tick." },
                { icon: Zap, color: "bg-brand-rose/15 text-brand-rose-bright border-brand-rose/30", label: "Breakdown", desc: "A random active courier breaks down for 20 ticks. Its orders are redistributed via Greedy Insertion + Bin Packing." },
                { icon: Star, color: "bg-brand-violet/15 text-brand-violet-bright border-brand-violet/30", label: "VIP Priority", desc: "A random in-progress order jumps to the front of its courier's queue, forcing immediate pickup and delivery." },
              ].map(({ icon: Icon, color, label, desc }) => (
                <div key={label} className="p-3 bg-brand-surface rounded-lg border border-brand-surface-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`border rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${color}`}>{label}</span>
                  </div>
                  <p className="text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 5. Courier Statuses */}
          <Section num="5" icon={Truck} color="bg-brand-cyan/20 text-brand-cyan-bright" title="Courier Status Badges">
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                ["IDLE", "bg-brand-surface-high text-brand-text-muted border-brand-muted", "No stops assigned. Courier is at depot waiting."],
                ["MOVING", "bg-brand-indigo/15 text-brand-indigo-light border-brand-indigo/30", "Travelling toward next route stop via Dijkstra path."],
                ["DELIVERING", "bg-brand-indigo/15 text-brand-indigo-light border-brand-indigo/30", "Just arrived at a delivery node. Package handed off."],
                ["ASSIGNED", "bg-brand-indigo/15 text-brand-indigo-light border-brand-indigo/30", "New order just added. Will begin moving next tick."],
                ["RETURNING TO DEPOT", "bg-brand-surface-high text-brand-text-muted border-brand-muted", "All orders done. Heading back to home depot."],
                ["REROUTING", "bg-brand-amber/15 text-brand-amber border-brand-amber/30", "Route changed due to road closure or VIP escalation."],
                ["REBALANCING LOAD", "bg-brand-amber/15 text-brand-amber border-brand-amber/30", "Over capacity. Bin Packing offloading lightest packages."],
                ["BROKEN DOWN", "bg-brand-rose/15 text-brand-rose-bright border-brand-rose/30", "Vehicle failure. Not moving. Orders being redistributed."],
                ["WAITING FOR REPAIR", "bg-brand-rose/15 text-brand-rose-bright border-brand-rose/30", "Waiting for 20-tick repair timer before coming back online."],
              ].map(([label, color, desc]) => (
                <div key={label} className="bg-brand-surface rounded-lg border border-brand-surface-border p-2">
                  <span className={`border rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${color}`}>{label}</span>
                  <p className="text-brand-text-muted mt-1.5 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 6. WebSockets */}
          <Section num="6" icon={Wifi} color="bg-brand-emerald/20 text-brand-emerald" title="WebSocket — Why the UI Updates Live">
            <Card label="How it works">
              When the frontend loads, it opens a persistent WebSocket connection to the backend at <code className="text-brand-indigo-light bg-brand-surface-high px-1 rounded">ws://localhost/ws</code>. Every simulation tick, the backend pushes the complete state as JSON to all connected clients. React receives it, calls setState, and the entire UI re-renders instantly — no page refresh, no polling. If the connection drops, the hook retries automatically every 3 seconds.
            </Card>
            <Card label="The LIVE indicator">
              The green pulsing <strong>LIVE</strong> badge in the header means the WebSocket is connected and receiving updates. If it shows <strong>OFFLINE</strong> (red), the backend is not running or the connection was lost.
            </Card>
          </Section>

          {/* 7. Dashboard Panels */}
          <Section num="7" icon={Map} color="bg-brand-violet/20 text-brand-violet-bright" title="Dashboard Panels Explained">
            <div className="grid grid-cols-2 gap-2 text-xs text-brand-text-secondary">
              {[
                ["Live Operations Map", "Shows courier positions (numbered circles), all road edges, closed roads (dashed red), and each courier's planned route as a dashed colour line."],
                ["System Logs", "Scrollable event timeline split into Operations (deliveries, DP runs) and Disruptions (closures, breakdowns, escalations)."],
                ["Total Route Distance Chart", "Plots total remaining planned distance over time. Spikes = new orders added. Drops = DP optimized or deliveries completed."],
                ["DP Re-Optimization Panel", "Table of every DP run: the greedy distance before, the DP distance after, km saved, and computation time in ms."],
                ["Fleet Status", "Each courier's live node position, stop count, order count, and cargo capacity bar colour-coded by load level."],
                ["Simulation Summary", "Running totals: orders delivered, km driven, disruption counts by type, current tick, and active courier count."],
              ].map(([title, desc]) => (
                <div key={title} className="bg-brand-surface rounded-lg border border-brand-surface-border p-3">
                  <div className="font-semibold text-brand-text mb-1">{title}</div>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}