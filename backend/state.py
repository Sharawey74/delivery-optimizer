from typing import Dict, Any

SIMULATION_STATE: Dict[str, Any] = {
    "tick": 0,
    "running": False,
    "mode": "simulation", # "simulation" or "demo"
    "orders": {},
    "couriers": {},
    "events": [],
    "total_distance_driven": 0.0,
    "orders_delivered": 0,
    "disruption_counts": {
        "new_order": 0,
        "road_closure": 0,
        "breakdown": 0,
        "priority_escalation": 0
    },
    "last_disruption_tick": 0,
    "narrative": "System initializing...",
    "dp_comparisons": [],
    "route_quality_history": []
}

def reset_state():
    SIMULATION_STATE["tick"] = 0
    SIMULATION_STATE["running"] = False
    SIMULATION_STATE["mode"] = SIMULATION_STATE.get("mode", "simulation")
    SIMULATION_STATE["orders"] = {}
    SIMULATION_STATE["events"] = []
    SIMULATION_STATE["total_distance_driven"] = 0.0
    SIMULATION_STATE["orders_delivered"] = 0
    SIMULATION_STATE["disruption_counts"] = {
        "new_order": 0,
        "road_closure": 0,
        "breakdown": 0,
        "priority_escalation": 0
    }
    SIMULATION_STATE["last_disruption_tick"] = 0
    SIMULATION_STATE["narrative"] = "System initialized. Couriers awaiting dispatch."
    SIMULATION_STATE["dp_comparisons"] = []
    SIMULATION_STATE["route_quality_history"] = []
    
    SIMULATION_STATE["couriers"] = {
        "C1": {
            "id": "C1",
            "name": "Alpha",
            "position": 0,
            "depot": 0,
            "route": [],
            "orders": [],
            "capacity_max": 50,
            "capacity_used": 0,
            "active": True,
            "color": "#00dbe7", # Cyan
            "status": "IDLE"
        },
        "C2": {
            "id": "C2",
            "name": "Beta",
            "position": 7,
            "depot": 7,
            "route": [],
            "orders": [],
            "capacity_max": 50,
            "capacity_used": 0,
            "active": True,
            "color": "#ddb7ff", # Purple
            "status": "IDLE"
        },
        "C3": {
            "id": "C3",
            "name": "Gamma",
            "position": 14,
            "depot": 14,
            "route": [],
            "orders": [],
            "capacity_max": 50,
            "capacity_used": 0,
            "active": True,
            "color": "#fed83a", # Yellow
            "status": "IDLE"
        }
    }
