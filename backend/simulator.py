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
FUTURE_EVENTS = {}

# C1: Demo mode step flag — set to True by /api/simulation/step to advance one tick
DEMO_STEP_REQUESTED = False


# ---------------------------------------------------------------------------
# Route helper utilities (C3: routes are tagged dicts, not bare ints)
# ---------------------------------------------------------------------------

def _route_nodes(route: list) -> list[int]:
    """Extract plain node IDs from a tagged route list."""
    return [e["node"] for e in route]


def _make_stop(order: dict, stop_type: str) -> dict:
    """Create a tagged route stop entry."""
    node = order["pickup_node"] if stop_type == "pickup" else order["delivery_node"]
    return {"node": node, "order_id": order["order_id"], "type": stop_type}


def _rebuild_route_from_nodes(original_route: list, optimized_nodes: list[int]) -> list:
    """
    Reorders tagged route entries to match the DP-optimized node sequence.
    Uses a greedy first-match strategy so repeated node IDs are handled safely.
    """
    available = list(original_route)
    result = []
    for node in optimized_nodes:
        for i, entry in enumerate(available):
            if entry["node"] == node:
                result.append(available.pop(i))
                break
    result.extend(available)  # append any unmatched leftovers
    return result


# ---------------------------------------------------------------------------
# Distance utility
# ---------------------------------------------------------------------------

def get_total_route_distance() -> float:
    total = 0.0
    for courier in SIMULATION_STATE["couriers"].values():
        if courier["active"] and courier["route"]:
            nodes = [courier["position"]] + _route_nodes(courier["route"])
            cost = get_route_cost(nodes)
            if cost != float('inf'):
                total += cost
    return total


# ---------------------------------------------------------------------------
# Main simulation loop
# ---------------------------------------------------------------------------

async def run_simulator():
    """Main simulation loop."""
    global DEMO_STEP_REQUESTED
    SIMULATION_STATE["running"] = True
    SIMULATION_STATE["tick"] = 0
    SIMULATION_STATE["narrative"] = "Operations started. 3 Couriers deployed and holding positions."
    global FUTURE_EVENTS
    FUTURE_EVENTS.clear()

    while SIMULATION_STATE["running"]:
        # C1: Demo mode — pause and wait for manual step signal
        if SIMULATION_STATE["mode"] == "demo":
            while not DEMO_STEP_REQUESTED and SIMULATION_STATE["running"]:
                await asyncio.sleep(0.1)
            DEMO_STEP_REQUESTED = False
            if not SIMULATION_STATE["running"]:
                break
        else:
            await asyncio.sleep(1)  # 1 real second = 1 simulation tick

        tick = SIMULATION_STATE["tick"] + 1
        SIMULATION_STATE["tick"] = tick

        # --- Move couriers ---
        for cid, courier in SIMULATION_STATE["couriers"].items():
            if not courier["active"]:
                if courier["status"] != "WAITING_FOR_REPAIR":
                    courier["status"] = "BROKEN_DOWN"
                continue

            if courier["route"]:
                courier["status"] = "MOVING"
                # C3: extract node from tagged entry
                next_entry = courier["route"][0]
                next_node = next_entry["node"]
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
                    # C3: only deliver if this is a delivery stop for the matching order
                    if next_entry["type"] == "delivery":
                        for order in courier["orders"]:
                            if order["order_id"] == next_entry["order_id"]:
                                orders_to_remove.append(order)
                                delivered_any = True

                    for order in orders_to_remove:
                        if order in courier["orders"]:
                            courier["orders"].remove(order)
                            courier["capacity_used"] = max(0, courier["capacity_used"] - order["weight"])
                            SIMULATION_STATE["orders_delivered"] += 1
                            if order["order_id"] in SIMULATION_STATE["orders"]:
                                del SIMULATION_STATE["orders"][order["order_id"]]

                    if delivered_any:
                        courier["status"] = "DELIVERING"
                        SIMULATION_STATE["narrative"] = (
                            f"Courier {cid} successfully delivered package at Node {next_node}."
                        )
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

        # --- Scheduled future events ---
        if tick in FUTURE_EVENTS:
            for event in FUTURE_EVENTS[tick]:
                event()
            del FUTURE_EVENTS[tick]

        # --- Initial order at tick 2 (simulation mode only) ---
        if SIMULATION_STATE["mode"] == "simulation" and tick == 2:
            fire_disruption(tick, FUTURE_EVENTS, dtype="new_order")

        # --- Random disruptions (simulation mode only) ---
        if SIMULATION_STATE["mode"] == "simulation" and tick > 4:
            if random.random() < 0.05:
                fire_disruption(tick, FUTURE_EVENTS)

        # --- C2: DP Re-optimization — only during quiet periods with actual routes ---
        has_optimizable_routes = any(
            c["active"] and len(c["route"]) >= 2
            for c in SIMULATION_STATE["couriers"].values()
        )
        if has_optimizable_routes and tick - SIMULATION_STATE["last_disruption_tick"] >= 6:
            run_dp_reoptimization(tick)
            SIMULATION_STATE["last_disruption_tick"] = tick

        # --- Route quality snapshot ---
        SIMULATION_STATE["route_quality_history"].append({
            "tick": tick,
            "total_distance": get_total_route_distance()
        })

        # --- Broadcast to all WebSocket clients ---
        if BROADCAST_CALLBACK:
            await BROADCAST_CALLBACK(SIMULATION_STATE)


# ---------------------------------------------------------------------------
# Disruption engine
# ---------------------------------------------------------------------------

def fire_disruption(tick, future_events, dtype=None):
    if not dtype:
        disruptions = ["new_order", "road_closure", "breakdown", "priority_escalation"]
        dtype = random.choices(disruptions, weights=[0.5, 0.2, 0.1, 0.2], k=1)[0]

    # --- New Order ---
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

            old_cost = get_route_cost([courier["position"]] + _route_nodes(courier["route"]))

            courier["orders"].append(order)
            courier["capacity_used"] += weight
            # C3: insert tagged stop dicts
            courier["route"].insert(best_idx, _make_stop(order, "delivery"))
            courier["route"].insert(best_idx, _make_stop(order, "pickup"))

            new_cost = get_route_cost([courier["position"]] + _route_nodes(courier["route"]))
            insertion_cost_delta = new_cost - old_cost if old_cost != float('inf') else 0.0

            if not check_capacity(courier, 0):
                courier["status"] = "REBALANCING_LOAD"
                repack_courier(courier, SIMULATION_STATE["couriers"])

            manifest_after = get_cargo_manifest(courier)
            description_text = (
                f"📦 New order {order_id} assigned to Courier {best_cid} "
                f"using Greedy Insertion (added {insertion_cost_delta:.1f}km)."
            )
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

    # --- Road Closure ---
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

            description_text = (
                f"🚧 DISRUPTION: Road blocked between Node {u} and {v}. "
                f"Dijkstra rerouting active couriers."
            )
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
                    "tick": SIMULATION_STATE["tick"],  # C7: actual tick at resolution time
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

    # --- Breakdown ---
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
                    # C3: insert tagged stop dicts
                    c["route"].insert(best_idx, _make_stop(o, "delivery"))
                    c["route"].insert(best_idx, _make_stop(o, "pickup"))
                    if not check_capacity(c, 0):
                        c["status"] = "REBALANCING_LOAD"
                        repack_courier(c, SIMULATION_STATE["couriers"])

            description_text = (
                f"💥 DISRUPTION: Courier {bad_cid} broke down! "
                f"Greedy Insertion & Bin Packing reassigning {len(orders_to_redist)} stranded orders."
            )
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
                log_event({
                    "tick": SIMULATION_STATE["tick"],  # C7: actual tick at resolution time
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

    # --- Priority Escalation ---
    elif dtype == "priority_escalation":
        all_orders = []
        for cid, c in SIMULATION_STATE["couriers"].items():
            for o in c["orders"]:
                all_orders.append((cid, o))

        if all_orders:
            cid, order = random.choice(all_orders)
            courier = SIMULATION_STATE["couriers"][cid]
            courier["status"] = "REROUTING"

            # C3: remove by order_id — safe even if another order shares the same node
            courier["route"] = [
                e for e in courier["route"]
                if e["order_id"] != order["order_id"]
            ]
            # Re-insert at front of queue
            courier["route"].insert(0, _make_stop(order, "delivery"))
            courier["route"].insert(0, _make_stop(order, "pickup"))

            description_text = (
                f"🚨 DISRUPTION: VIP Order {order['order_id']} escalated. "
                f"Forcing Courier {cid} to sequence it next."
            )
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


# ---------------------------------------------------------------------------
# DP Re-optimization
# ---------------------------------------------------------------------------

def run_dp_reoptimization(tick):
    total_time = 0
    greedy_dist = 0.0
    dp_dist = 0.0

    for cid, courier in SIMULATION_STATE["couriers"].items():
        if not courier["active"] or len(courier["route"]) < 2:
            continue

        # C3: extract node IDs for DP
        stops = _route_nodes(courier["route"])
        old_cost = get_route_cost([courier["position"]] + stops)
        if old_cost != float('inf'):
            greedy_dist += old_cost

        start_ms = time.time() * 1000
        new_nodes, new_cost = dp_optimize_route(courier["position"], stops)
        end_ms = time.time() * 1000

        # C3: rebuild tagged route in the new optimized order
        courier["route"] = _rebuild_route_from_nodes(courier["route"], new_nodes)
        if new_cost != float('inf'):
            dp_dist += new_cost
        total_time += (end_ms - start_ms)

    saved = greedy_dist - dp_dist
    if saved > 0 or total_time > 0:
        SIMULATION_STATE["narrative"] = (
            f"🧠 QUIET PERIOD: Dynamic Programming (DP) mathematically optimized "
            f"all active routes, saving {saved:.1f}km."
        )
        SIMULATION_STATE["dp_comparisons"].insert(0, {
            "tick": tick,
            "greedy_dist": round(greedy_dist, 2),
            "dp_dist": round(dp_dist, 2),
            "saved": round(saved, 2),
            "time_ms": round(total_time, 2)
        })


# ---------------------------------------------------------------------------
# Logger
# ---------------------------------------------------------------------------

def log_event(event_dict):
    SIMULATION_STATE["events"].insert(0, event_dict)
    try:
        current_mode = SIMULATION_STATE.get("mode", "simulation")
        append_event_to_json(event_dict, current_mode)
    except Exception as e:
        print(f"Error saving log to JSON: {e}")
