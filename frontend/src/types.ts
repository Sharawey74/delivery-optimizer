export interface Order {
  order_id: string;
  pickup_node: number;
  delivery_node: number;
  weight: number;
}

export type CourierStatus =
  | 'IDLE' | 'MOVING' | 'DELIVERING' | 'ASSIGNED'
  | 'RETURNING_TO_DEPOT' | 'BROKEN_DOWN'
  | 'WAITING_FOR_REPAIR' | 'REBALANCING_LOAD' | 'REROUTING';

// C3: Routes are now tagged objects, not bare node integers
export interface RouteEntry {
  node: number;
  order_id: string;
  type: 'pickup' | 'delivery';
}

export interface Courier {
  id: string;
  name: string;
  position: number;
  depot: number;
  route: RouteEntry[];
  orders: Order[];
  capacity_max: number;
  capacity_used: number;
  active: boolean;
  color: string;
  status: CourierStatus;
}

export interface SimulationEvent {
  tick: number;
  timestamp_s: number;
  type: string;
  category: 'operational' | 'disruption';
  algorithm: string;
  description: string;
  quality_delta: number;
  [key: string]: unknown;
}

export interface DPComparison {
  tick: number;
  greedy_dist: number;
  dp_dist: number;
  saved: number;
  time_ms: number;
}

export interface RouteQualityPoint {
  tick: number;
  total_distance: number;
}

export interface SimulationState {
  tick: number;
  running: boolean;
  mode: 'simulation' | 'demo';
  orders: Record<string, Order>;
  couriers: Record<string, Courier>;
  events: SimulationEvent[];
  total_distance_driven: number;
  orders_delivered: number;
  disruption_counts: {
    new_order: number;
    road_closure: number;
    breakdown: number;
    priority_escalation: number;
  };
  last_disruption_tick: number;
  narrative: string;
  dp_comparisons: DPComparison[];
  route_quality_history: RouteQualityPoint[];
}

export interface MapNode { id: number; lat: number; lng: number; }
export interface MapEdge { u: number; v: number; closed: boolean; }