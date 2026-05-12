import asyncio
import time
import random
from state import SIMULATION_STATE
from graph import ROAD_GRAPH, get_shortest_path, close_road, reopen_road, get_route_cost, NODE_POSITIONS
from greedy import greedy_insert_order
from dp import dp_optimize_route
from bin_packing import check_capacity, repack_courier, get_cargo_manifest
from json_logger import append_event_to_json

BROADCAST_CALLBACK = None

def get_total_route_distance() -> float:
    total = 0.0
    for courier in SIMULATION_STATE["couriers"].values():
        if courier["active"] and courier["route"]:
            cost = get_route_cost([courier["position"]] + courier["route"])
            if cost != float('inf'):
                total += cost
    return total

async def run_simulator():
    """Main simulation loop."""
    SIMULATION_STATE["running"] = True
    SIMULATION_STATE["tick"] = 0
    SIMULATION_STATE["narrative"] = "Operations started. 3 Couriers deployed and holding positions."
    future_events = {}

    while SIMULATION_STATE["running"]:
        await asyncio.sleep(1) # 1 real second = 1 tick
        tick = SIMULATION_STATE["tick"] + 1
        SIMULATION_STATE["tick"] = tick
        
        # Move couriers
        for cid, courier in SIMULATION_STATE["couriers"].items():
            if not courier["active"]:
                if courier["status"] != "WAITING_FOR_REPAIR":
                    courier["status"] = "BROKEN_DOWN"
                continue
                
            # Determine state
            if courier["route"]:
                courier["status"] = "MOVING"
                next_node = courier["route"][0]
                path = get_shortest_path(courier["position"], next_node)
                
                if len(path) > 1:
                    step = path[1]
                    cost = get_route_cost([courier["position"], step])
                    if cost != float('inf'):
                        SIMULATION_STATE["total_distance_driven"] += cost
                    courier["position"] = step
                elif len(path) == 1 and path[0] == next_node:
                    courier["position"] = next_node
                elif len(path) == 0 and courier["position"] == next_node:
                    pass
                
                if courier["position"] == next_node:
                    courier["route"].pop(0)
                    orders_to_remove = []
                    delivered_any = False
                    for order in courier["orders"]:
                        if order["delivery_node"] == next_node:
                            orders_to_remove.append(order)
                            delivered_any = True
                    
                    for order in orders_to_remove:
                        if order in courier["orders"]:
                            courier["orders"].remove(order)
                            courier["capacity_used"] -= order["weight"]
                            SIMULATION_STATE["orders_delivered"] += 1
                    
                    if delivered_any:
                        courier["status"] = "DELIVERING"
                        SIMULATION_STATE["narrative"] = f"Courier {cid} successfully delivered package at Node {next_node}."
            else:
                if courier["position"] != courier["depot"]:
                    courier["status"] = "RETURNING_TO_DEPOT"
                    path = get_shortest_path(courier["position"], courier["depot"])
                    if len(path) > 1:
                        step = path[1]
                        cost = get_route_cost([courier["position"], step])
                        if cost != float('inf'):
                            SIMULATION_STATE["total_distance_driven"] += cost
                        courier["position"] = step
                else:
                    courier["status"] = "IDLE"
                        
        if tick in future_events:
            for event in future_events[tick]:
                event()
            del future_events[tick]
                        
        # Initial pacing
        if SIMULATION_STATE["mode"] == "simulation" and tick == 2:
            fire_disruption(tick, future_events, dtype="new_order")
            
        # Disruption logic (Slower, gradual)
        if SIMULATION_STATE["mode"] == "simulation" and tick > 4:
            if random.random() < 0.05:
                fire_disruption(tick, future_events)
            
        # DP Re-optimization
        if tick - SIMULATION_STATE["last_disruption_tick"] >= 6:
            run_dp_reoptimization(tick)
            
        # Route quality history
        SIMULATION_STATE["route_quality_history"].append({
            "tick": tick,
            "total_distance": get_total_route_distance()
        })
        
        # Broadcast
        if BROADCAST_CALLBACK:
            await BROADCAST_CALLBACK(SIMULATION_STATE)

def fire_disruption(tick, future_events, dtype=None):
    if not dtype:
        disruptions = ["new_order", "road_closure", "breakdown", "priority_escalation"]
        dtype = random.choices(disruptions, weights=[0.5, 0.2, 0.1, 0.2], k=1)[0]
    
    if dtype == "new_order":
        pickup = random.choice(list(NODE_POSITIONS.keys()))
        delivery = random.choice(list(NODE_POSITIONS.keys()))
        while delivery == pickup:
            delivery = random.choice(list(NODE_POSITIONS.keys()))
            
        order_id = f"ORD-{tick}-{random.randint(100, 999)}"
        weight = random.uniform(3, 15)
        
        order = {
            "order_id": order_id,
            "pickup_node": pickup,
            "delivery_node": delivery,
            "weight": weight
        }
        SIMULATION_STATE["orders"][order_id] = order
        
        best_cid, best_idx = greedy_insert_order(order, SIMULATION_STATE["couriers"])
        
        if best_cid:
            courier = SIMULATION_STATE["couriers"][best_cid]
            courier["status"] = "ASSIGNED"
            manifest_before = get_cargo_manifest(courier)
            
            old_cost = get_route_cost([courier["position"]] + courier["route"])
            
            courier["orders"].append(order)
            courier["capacity_used"] += weight
            courier["route"].insert(best_idx, delivery)
            courier["route"].insert(best_idx, pickup)
            
            new_cost = get_route_cost([courier["position"]] + courier["route"])
            insertion_cost_delta = new_cost - old_cost if old_cost != float('inf') else 0.0
            
            if not check_capacity(courier, 0):
                courier["status"] = "REBALANCING_LOAD"
                repack_courier(courier, SIMULATION_STATE["couriers"])
                
            manifest_after = get_cargo_manifest(courier)
            
            description_text = f"📦 New order {order_id} assigned to Courier {best_cid} using Greedy Insertion (added {insertion_cost_delta:.1f}km)."
            SIMULATION_STATE["narrative"] = description_text
            log_event({
                "tick": tick,
                "timestamp_s": time.time(),
                "type": "new_order",
                "category": "operational",
                "algorithm": "Greedy Insertion",
                "description": description_text,
                "quality_delta": insertion_cost_delta,
                "courier_id": best_cid,
                "insertion_index": best_idx,
                "insertion_cost_delta": insertion_cost_delta,
                "manifest_before": manifest_before,
                "manifest_after": manifest_after
            })
            SIMULATION_STATE["last_disruption_tick"] = tick
            SIMULATION_STATE["disruption_counts"]["new_order"] += 1
            
    elif dtype == "road_closure":
        edges = list(ROAD_GRAPH.edges)
        if edges:
            u, v = random.choice(edges)
            close_road(u, v)
            
            rerouted = []
            for cid, courier in SIMULATION_STATE["couriers"].items():
                if courier["active"] and courier["route"]:
                    courier["status"] = "REROUTING"
                    rerouted.append(cid)
                    
            description_text = f"🚧 DISRUPTION: Road blocked between Node {u} and {v}. Dijkstra rerouting active couriers."
            SIMULATION_STATE["narrative"] = description_text
            log_event({
                "tick": tick,
                "timestamp_s": time.time(),
                "type": "road_closure",
                "category": "disruption",
                "algorithm": "Incremental Dijkstra",
                "description": description_text,
                "quality_delta": 0.0,
                "edge": [u, v],
                "couriers_rerouted": rerouted
            })
            
            def reopen_callback():
                reopen_road(u, v)
                log_event({
                    "tick": tick + 15,
                    "timestamp_s": time.time(),
                    "type": "road_closure_resolved",
                    "category": "operational",
                    "algorithm": "-",
                    "description": f"✅ Road {u}-{v} cleared. Traffic flow restored.",
                    "quality_delta": 0.0
                })
                
            future_events.setdefault(tick + 15, []).append(reopen_callback)
            SIMULATION_STATE["last_disruption_tick"] = tick
            SIMULATION_STATE["disruption_counts"]["road_closure"] += 1
            
    elif dtype == "breakdown":
        active_cids = [cid for cid, c in SIMULATION_STATE["couriers"].items() if c["active"]]
        if active_cids:
            bad_cid = random.choice(active_cids)
            bad_courier = SIMULATION_STATE["couriers"][bad_cid]
            bad_courier["active"] = False
            bad_courier["status"] = "BROKEN_DOWN"
            
            orders_to_redist = bad_courier["orders"][:]
            bad_courier["orders"] = []
            bad_courier["route"] = []
            bad_courier["capacity_used"] = 0
            
            for o in orders_to_redist:
                best_cid, best_idx = greedy_insert_order(o, SIMULATION_STATE["couriers"])
                if best_cid:
                    c = SIMULATION_STATE["couriers"][best_cid]
                    c["orders"].append(o)
                    c["capacity_used"] += o["weight"]
                    c["route"].insert(best_idx, o["delivery_node"])
                    c["route"].insert(best_idx, o["pickup_node"])
                    if not check_capacity(c, 0):
                        c["status"] = "REBALANCING_LOAD"
                        repack_courier(c, SIMULATION_STATE["couriers"])
                        
            description_text = f"💥 DISRUPTION: Courier {bad_cid} broke down! Greedy Insertion & Bin Packing reassigning {len(orders_to_redist)} stranded orders."
            SIMULATION_STATE["narrative"] = description_text
            log_event({
                "tick": tick,
                "timestamp_s": time.time(),
                "type": "breakdown",
                "category": "disruption",
                "algorithm": "Greedy Insertion + Bin Packing",
                "description": description_text,
                "quality_delta": 0.0,
                "courier_id": bad_cid,
                "orders_redistributed": len(orders_to_redist)
            })
            
            def respawn_callback():
                bad_courier["active"] = True
                bad_courier["status"] = "IDLE"
                # They stay at their current position, but now they are repaired
                log_event({
                    "tick": tick + 20,
                    "timestamp_s": time.time(),
                    "type": "breakdown_resolved",
                    "category": "operational",
                    "algorithm": "-",
                    "description": f"🔧 Courier {bad_cid} repaired and back online.",
                    "quality_delta": 0.0
                })
                
            bad_courier["status"] = "WAITING_FOR_REPAIR"
            future_events.setdefault(tick + 20, []).append(respawn_callback)
            SIMULATION_STATE["last_disruption_tick"] = tick
            SIMULATION_STATE["disruption_counts"]["breakdown"] += 1
            
    elif dtype == "priority_escalation":
        all_orders = []
        for cid, c in SIMULATION_STATE["couriers"].items():
            for o in c["orders"]:
                all_orders.append((cid, o))
                
        if all_orders:
            cid, order = random.choice(all_orders)
            courier = SIMULATION_STATE["couriers"][cid]
            courier["status"] = "REROUTING"
            
            if order["pickup_node"] in courier["route"]:
                courier["route"].remove(order["pickup_node"])
            if order["delivery_node"] in courier["route"]:
                courier["route"].remove(order["delivery_node"])
                
            courier["route"].insert(0, order["delivery_node"])
            courier["route"].insert(0, order["pickup_node"])
            
            description_text = f"🚨 DISRUPTION: VIP Order {order['order_id']} escalated. Forcing Courier {cid} to sequence it next."
            SIMULATION_STATE["narrative"] = description_text
            log_event({
                "tick": tick,
                "timestamp_s": time.time(),
                "type": "priority_escalation",
                "category": "disruption",
                "algorithm": "Route Resequencing",
                "description": description_text,
                "quality_delta": 0.0,
                "order_id": order["order_id"],
                "courier_id": cid
            })
            SIMULATION_STATE["last_disruption_tick"] = tick
            SIMULATION_STATE["disruption_counts"]["priority_escalation"] += 1

def run_dp_reoptimization(tick):
    total_saved = 0
    total_time = 0
    greedy_dist = 0
    dp_dist = 0
    
    for cid, courier in SIMULATION_STATE["couriers"].items():
        if not courier["active"] or len(courier["route"]) < 2:
            continue
            
        old_cost = get_route_cost([courier["position"]] + courier["route"])
        if old_cost != float('inf'):
            greedy_dist += old_cost
        
        start_ms = time.time() * 1000
        new_route, new_cost = dp_optimize_route(courier["position"], courier["route"])
        end_ms = time.time() * 1000
        
        courier["route"] = new_route
        if new_cost != float('inf'):
            dp_dist += new_cost
        total_time += (end_ms - start_ms)
        
    saved = greedy_dist - dp_dist
    if saved > 0 or total_time > 0:
        SIMULATION_STATE["narrative"] = f"🧠 QUIET PERIOD: Dynamic Programming (DP) mathematically optimized all active routes, saving {saved:.1f}km."
        SIMULATION_STATE["dp_comparisons"].insert(0, {
            "tick": tick,
            "greedy_dist": round(greedy_dist, 2),
            "dp_dist": round(dp_dist, 2),
            "saved": round(saved, 2),
            "time_ms": round(total_time, 2)
        })

def log_event(event_dict):
    SIMULATION_STATE["events"].insert(0, event_dict)
    try:
        current_mode = SIMULATION_STATE.get("mode", "simulation")
        append_event_to_json(event_dict, current_mode)
    except Exception as e:
        print(f"Error saving log to JSON: {e}")
